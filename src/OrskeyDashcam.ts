import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import path from 'path';

export type DashcamFolder =
    | 'looping'
    | 'locked'
    | 'parked'
    | 'event';

// Internal map to dashcam API values
const DashcamFolderMap: Record<DashcamFolder, string> = {
    looping: 'loop',
    locked: 'emr',
    parked: 'park',
    event: 'event',
};

/**
 * Library to interact with the ORSKEY-3 dashcam.
 */
export class OrskeyDashcam {

    private axiosInstance: AxiosInstance;

    /**
     * 
     * @param settings the IP address of the dashcam is http://192.168.169.1 and doesn't seem to change
     */
    constructor(settings?: { host: string }) {
        const host = settings?.host ?? 'http://192.168.169.1';
        this.axiosInstance = axios.create({baseURL: host});
    }

    /**
     * Returns a list of videos from the dashcam.
     * @param folder Recording type
     * @param page Page number (starts at 1)
     * @param perPage Number of items per page
     * @returns List of videos newest first
     */
    public async getVideoList({folder = 'looping', page = 1, perPage = 100 }: {
        folder?: DashcamFolder,
        page?: number,
        perPage?: number
    } = {folder: 'looping'}): Promise<VideoFolderInfo | null> {
        const apiFolder = DashcamFolderMap[folder]
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage - 1;
        const response = await this.axiosInstance.get<VideosResponse>(`/app/getfilelist`, {
            params: {
                folder: apiFolder,
                start: startIndex,
                end: endIndex
            }
        });
        const firstFolder = response.data.info[0];
        return firstFolder || null;
    }

    /**
     * Gets the thumbnail image for a video.
     */
    public async getVideoThumbnail(videoInfo: VideoInfo | string): Promise<Buffer> {
        const videoPath = typeof videoInfo === 'string' ? videoInfo : videoInfo.name;
        const response = await this.axiosInstance.get(`/app/getthumbnail?file=${videoPath}`, {
            responseType: 'arraybuffer'
        });
        return response.data;
    }

    /**
     * Saves the thumbnail image for a video to disk.
     */
    public async downloadVideoThumbnail(video: VideoInfo | string, saveToDirectory: string): Promise<void> {
        const thumbnail = await this.getVideoThumbnail(video);
        const outputFilepath = path.join(saveToDirectory, `${typeof video === 'string' ? video : video.name}.jpg`);
        await fs.promises.mkdir(path.parse(outputFilepath).dir, { recursive: true });
        fs.writeFileSync(outputFilepath, thumbnail);
    }

    /**
     * Gets the video file as a Buffer.
     */
    public async getVideo(videoInfo: VideoInfo | string): Promise<Buffer> {
        const videoPath = typeof videoInfo === 'string' ? videoInfo : videoInfo.name;
        const response = await this.axiosInstance.get<ArrayBuffer>(`${videoPath}`, {
            responseType: 'arraybuffer'
        });
        return Buffer.from(response.data);
    }

    /**
     * Stops the dashcam recording.  
     * NOTE - this seems to take a few moments to change **after** the response returns "success".  
     * Calling `.isRecording()` _immediately_ after will not show the updated state.  
     */
    public async stopRecording(): Promise<SetParamResponse> {
        return this.setParam("rec", "0");
    }

    /**
     * Starts the dashcam recording.  
     * NOTE - this seems to take a few moments to change **after** the response returns "success".  
     * Calling `.isRecording()` _immediately_ after will not show the updated state.  
     */
    public async startRecording(): Promise<SetParamResponse> {
        return this.setParam("rec", "1");
    }

    /**
     * Whether the dashcam is currently recording.  
     * NOTE - this does **not** instantly reflect the recording state after `.startRecording()` or `.stopRecording()` are called.
     */
    public async isRecording(): Promise<boolean> {
        const result = await this.getParam("rec");
        return result.info.value === 1;
    }

    private async setParam(name: string, value: string): Promise<SetParamResponse> {
        const response = await this.axiosInstance.get(`/app/setparamvalue`, {
            params: {
                param: name,
                value: value,
            }
        })
        return response.data;
    }

    private async getParam(name: string): Promise<GetParamResponse> {
        const response = await this.axiosInstance.get<GetParamResponse>(`/app/getparamvalue`, {
            params: {
                param: name,
            }
        })
        return response.data;
    }

    /**
     * This can take over 1 minute per video
     */
    public async downloadVideo(video: VideoInfo | string, saveToDirectory: string): Promise<void> {
        const videoPath = typeof video === 'string' ? video : video.name;
        const outputFilepath = path.join(saveToDirectory, `${videoPath}.mp4`);
        await fs.promises.mkdir(path.parse(outputFilepath).dir, { recursive: true });

        return this.axiosInstance({
            method: 'get',
            url: videoPath,
            responseType: 'stream'
        }).then(response => {
            return new Promise<void>((resolve, reject) => {
                const writer = fs.createWriteStream(outputFilepath);
                response.data.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        });
    }
}

export type SetParamResponse = {
    /** 0 for success, 1 for fail */
    result: number;
    /** Usually "set success" or "set fail" */
    info: string;
}

export type GetParamResponse = {
    /** Zero for success */
    result: number;
    info: {
        value: number;
    }
}

export type VideoInfo = {
    /** the path to the video file e.g. /mnt/card/video_front/20250101_000000_f.ts */
    name: string;
    /** always seems to be -1 */
    duration: number;
    /** in kB */
    size: number;
    /** Unix time stamp */
    createtime: number;
    /** formatted YYYYMMDDhhmmss */
    createtimestr: string;
    /** always seems to be 2 */
    type: number;
};

export type VideoFolderInfo = {
    folder: string;
    count: number;
    files: VideoInfo[];
};

type VideosResponse = {
    result: number;
    info: VideoFolderInfo[];
};