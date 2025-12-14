A captured packet for `/app/getfilelist` for the `loop` folder.  
The json response has been formatted for readability.  

```
GET /app/getfilelist?folder=loop&start=0&end=99 HTTP/1.1
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
            "folder": "loop",
            "count": 100,
            "files": [
                {
                    "name": "/mnt/card/video_inside/20251128_222946_i.ts",
                    "duration": -1,
                    "size": 77209,
                    "createtime": 1764368986,
                    "createtimestr": "20251128222946",
                    "type": 2
                },
                {
                    "name": "/mnt/card/video_back/20251128_222946_b.ts",
                    "duration": -1,
                    "size": 29797,
                    "createtime": 1764368986,
                    "createtimestr": "20251128222946",
                    "type": 2
                },
                // additional files removed for brevity
            ]
        }
    ]
}
```