---
sidebar_position: 6
title: Limits
description: Size, time and connection limits enforced by Loch S3 1.4.1.
---

# Limits

| Item | Limit |
|---|---|
| Bucket name | 3 to 63 characters: `a-z`, `0-9`, `-`, `.`; starts and ends with a letter or digit; no `..` |
| Object key | 1,024 bytes, 64 `/`-separated levels; no `.`, `..` or empty segment (a single trailing `/` is allowed). A key cannot also be the "folder" of another key (`a` and `a/b`) |
| Object size | No limit other than the quota and the disk: bodies are streamed |
| User metadata (`x-amz-meta-*`) | 2 KiB in total |
| Stored headers (`Content-Type`, `Cache-Control`, `Content-Disposition`, `Content-Encoding`, `Content-Language`, `Expires`) | 8 KiB in total |
| Multipart | Part numbers 1 to 10,000; no part size limit; unfinished uploads deleted after `S3_UPLOAD_TTL` (24 h) |
| Listing | 1,000 keys per page |
| Request bodies | Bucket policy 20 KiB; CORS and encryption configuration 64 KiB; ACL 16 KiB; versioning configuration 4 KiB; `CompleteMultipartUpload` 10 MiB; admin API 64 KiB |
| Presigned URL | 1 second to 7 days |
| Clock skew | 15 minutes |
| Request headers (HTTP/1) | Received within 30 seconds |
| Idle new connection | Closed after 30 seconds without a byte |
| Upload body | Aborted after 60 seconds without data, or under `S3_MIN_UPLOAD_RATE` (4096 bytes/s) over 60 seconds |
| Connections | `S3_MAX_CONNECTIONS` (1024) |
| HTTP/2 | Ping every 30 seconds, dropped after 20 seconds without answer; 128 streams per connection |
| `aws-chunked` chunk header | 4,096 bytes |
| Encryption chunk | 1 MiB; each chunk adds 16 bytes on disk |

Over a size limit, the server answers `413 EntityTooLarge`.
