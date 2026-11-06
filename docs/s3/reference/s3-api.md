---
sidebar_position: 2
title: S3 API compatibility
description: Every S3 operation that Loch S3 supports, with its HTTP route, and the operations it does not support.
---

# S3 API compatibility

Loch S3 only accepts path-style URLs: `/{bucket}` and `/{bucket}/{key}`. Any region is accepted in the signature.

## Supported operations

| Operation | Route |
|---|---|
| ListBuckets | `GET /` |
| CreateBucket | `PUT /{bucket}` (a `LocationConstraint` body is ignored) |
| HeadBucket | `HEAD /{bucket}` |
| DeleteBucket | `DELETE /{bucket}` |
| ListObjectsV2 | `GET /{bucket}` with `prefix`, `delimiter`, `max-keys` (up to 1000), `start-after`, `continuation-token` |
| PutObject | `PUT /{bucket}/{key}` |
| CopyObject | `PUT /{bucket}/{key}` with `x-amz-copy-source`; `x-amz-metadata-directive: COPY` or `REPLACE` |
| GetObject | `GET /{bucket}/{key}`, optional `Range` and `versionId` |
| HeadObject | `HEAD /{bucket}/{key}`, optional `versionId` |
| DeleteObject | `DELETE /{bucket}/{key}`, optional `versionId` |
| CreateMultipartUpload | `POST /{bucket}/{key}?uploads` |
| UploadPart | `PUT /{bucket}/{key}?partNumber=N&uploadId=X` (N from 1 to 10,000) |
| CompleteMultipartUpload | `POST /{bucket}/{key}?uploadId=X` |
| AbortMultipartUpload | `DELETE /{bucket}/{key}?uploadId=X` |
| ListParts | `GET /{bucket}/{key}?uploadId=X` |
| ListMultipartUploads | `GET /{bucket}?uploads` |
| Put/GetBucketVersioning | `PUT`, `GET /{bucket}?versioning` |
| ListObjectVersions | `GET /{bucket}?versions` |
| Put/Get/DeleteBucketPolicy | `PUT`, `GET`, `DELETE /{bucket}?policy` |
| Put/Get/DeleteBucketCors | `PUT`, `GET`, `DELETE /{bucket}?cors` |
| CORS preflight | `OPTIONS /{bucket}` or `/{bucket}/{key}` |
| Put/GetBucketAcl | `PUT`, `GET /{bucket}?acl` (canned `x-amz-acl` or XML body) |
| Put/GetObjectAcl | `PUT`, `GET /{bucket}/{key}?acl` |
| Put/Get/DeleteBucketEncryption | `PUT`, `GET`, `DELETE /{bucket}?encryption` (`AES256` only) |

Presigned URLs work for any of these operations.

## Authentication

| Method | Detail |
|---|---|
| Header SigV4 | `Authorization: AWS4-HMAC-SHA256 …`. `host` and every `x-amz-*` header must be signed |
| Presigned URL | `X-Amz-*` query parameters, `X-Amz-Expires` from 1 to 604,800 seconds |
| `x-amz-content-sha256` | A SHA-256 hash (verified), `UNSIGNED-PAYLOAD`, `STREAMING-AWS4-HMAC-SHA256-PAYLOAD[-TRAILER]` (chunk signatures verified) or `STREAMING-UNSIGNED-PAYLOAD-TRAILER`. Other values are refused |

## Not supported

| Feature | Note |
|---|---|
| Virtual-hosted-style URLs | Use path-style |
| ListObjects v1 | `GET /{bucket}` always answers in the V2 format; `marker` is ignored |
| DeleteObjects (multi-object delete) | `405` |
| GetBucketLocation (`?location`) | Not implemented |
| `partNumber` on GetObject | Ignored, the whole object is returned |
| Multi-range `Range` headers | Ignored, the whole object is returned |
| Tagging, lifecycle, replication, object lock, website, logging, notifications | Not implemented |
| SSE-KMS, IAM, STS, regions | Not implemented |
| `Content-MD5` and `x-amz-checksum-*` | Not verified |

:::warning
Requests for an unsupported sub-resource are not always refused: they can be handled as the plain operation on the same path. For example `PUT /{bucket}/{key}?tagging` replaces the object with the request body. Do not send tagging or lifecycle requests to Loch S3.
:::
