# ORSKEY Dashcam Library
This is an unofficial library that provides an interface to interact with ORSKEY dashcams over WiFi via their HTTP API.  

## Features
- Start and stop the dashcam recording
- Check if the dashcam is currently recording
- List videos stored on the dashcam
- Get video thumbnails
- Download videos from the dashcam

## Dashcam Compatibility
This library has been tested with the following dashcam models:
- ORSKEY J10

If you have tested this library with other models, please consider contributing your findings to help improve compatibility information.

## Installation
Using npm:
```bash
npm install orskey-dashcam
```

## Usage
A TypeScript example of how to use the library:
```typescript
import { OrskeyDashcam } from '../src/OrskeyDashcam';

const dashcam = new OrskeyDashcam();

const isRecording = await dashcam.isRecording();
console.log(`Recording status: ${isRecording}`);

if (isRecording) {
    await dashcam.stopRecording();
    console.log('Recording stopped.');
}

const loopVideosFolder = await dashcam.getVideoList({ 
    folder: 'looping', 
    page: 1, 
    perPage: 100
});

if (!loopVideosFolder) {
    console.log('No videos found in looping folder.');

} else {
    console.log(`Found ${loopVideosFolder.files.length} video(s).`);
    const mostRecentVideo = loopVideosFolder.files[0];
    
    if (mostRecentVideo) {
        // save the thumbnail
        const thumbnail = await dashcam.getVideoThumbnail(mostRecentVideo);
        fs.writeFileSync('./downloads/thumbnail.jpg', thumbnail);
        
        // download the video
        await dashcam.downloadVideo(mostRecentVideo, './downloads');
        console.log(`Downloaded video: ${mostRecentVideo.name}`);
    }
}
```

A short JavaScript example of how to use the library:
```javascript
const { OrskeyDashcam } = require('orskey-dashcam');

const dashcam = new OrskeyDashcam();

dashcam.getVideoList().then(videos => {
    console.log(videos);
}).catch(err => {
    console.error('Error fetching video list:', err);
});
```

## Dashcam API
The library interacts with the dashcam using its HTTP API. Packet captures were taken to reverse engineer the API endpoints and their responses. You can find examples of captured packets in the _packet-samples_ folder.

Please note that this library is unofficial and not endorsed by ORSKEY. Use it at your own risk.

## Contributing
Contributions are welcome! If you find any issues or want to add new features, please open an issue or submit a pull request.
