---
sidebar_position: 1
slug: /
title: Loch S3
description: Loch S3 is a self-hosted, S3-compatible object storage server written in Rust that stores objects on the local filesystem.
---

# Loch S3

Loch S3 is an S3-compatible object storage server. It is a single Rust binary that stores every object as a file in a local directory. Use it for backups, application storage or file hosting on your own servers, with the AWS CLI or any S3 SDK.

All configuration is done with environment variables: there is no configuration file.

## Features

| Area | Supported |
|---|---|
| Authentication | AWS Signature V4 in headers and presigned URLs, `aws-chunked` uploads with chunk signatures |
| Buckets | Create, list, head, delete |
| Objects | Put, get, head, delete, copy, metadata, `Range` requests |
| Listing | ListObjectsV2 with `prefix` and `delimiter` |
| Large files | Multipart upload (create, upload part, complete, abort, list) |
| Versioning | `Enabled` and `Suspended`, delete markers, version listing |
| Access control | Users, bucket owners, canned ACLs, JSON bucket policies |
| Encryption | SSE-S3 and SSE-C (AES-256-GCM), default encryption per bucket or for the whole server |
| Browsers | CORS per bucket |
| Operations | Global storage quota, `/_loch/health` probe, HTTP/1.1 and HTTP/2 |

## Not supported

- Virtual-hosted-style URLs: use path-style (`https://s3.example.com/bucket/key`).
- Multi-object delete (`DeleteObjects`).
- Lifecycle rules, replication, object lock, tagging, regions, SSE-KMS, IAM policies.
- `partNumber` on GET.

Full list: [S3 API compatibility](./reference/s3-api.md).

## Next step

[Install Loch S3](./install.md) and create your first bucket.
