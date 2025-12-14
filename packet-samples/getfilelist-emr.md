A captured packet for `/app/getfilelist` for the `emr` folder. This probably stands for "emergency" recordings as they are added to this folder when the camera's g-sensor is triggered.  
The json response has been formatted for readability.  

```
GET /app/getfilelist?folder=emr&start=0&end=0 HTTP/1.1
Accept-Encoding: gzip
Cookie: SessionID=null
Connection: close
User-Agent: [REDACTED]
Host: 192.168.169.1


HTTP/1.1 200 OK
Content-Type: application/json
Accept-Encoding: identity
Content-Length: 14782
Connection: close

{
  "result": 0,
  "info": [
    {
      "folder": "emr",
      "count": 6,
      "files": [
        {
          "name": "/mnt/card/video_inside_lock/20251128_204339_i.ts",
          "duration": -1,
          "size": 64396,
          "createtime": 1764362619,
          "createtimestr": "20251128204339",
          "type": 2
        },
        {
          "name": "/mnt/card/video_front_lock/20251128_204338_f.ts",
          "duration": -1,
          "size": 173447,
          "createtime": 1764362618,
          "createtimestr": "20251128204338",
          "type": 2
        },
        // additional files removed for brevity
      ]
    }
  ]
}
```