---
sidebar_position: 5
title: Error codes
description: S3 error codes returned by Loch S3, with their HTTP status and the usual cause.
---

# Error codes

Errors are returned in the S3 XML format: `<Error><Code>…</Code><Message>…</Message><Resource>…</Resource><RequestId>…</RequestId></Error>`. The message is a fixed text per code.

| Code | Status | Usual cause |
|---|---|---|
| `AccessDenied` | 403 | No permission, unsigned `host` or `x-amz-*` header, wrong SSE-C key, presigned expiry out of range |
| `SignatureDoesNotMatch` | 403 | Wrong secret key, or an `aws-chunked` chunk signature that does not verify |
| `InvalidAccessKeyId` | 403 | Unknown access key |
| `RequestTimeTooSkewed` | 403 | Client clock more than 15 minutes off |
| `ExpiredToken` | 403 | Presigned URL expired |
| `QuotaExceeded` | 403 | Write over `S3_MAX_STORAGE_BYTES`. Not retried by SDKs |
| `NoSuchBucket` | 404 | Bucket does not exist |
| `NoSuchKey` | 404 | Object does not exist |
| `NoSuchVersion` | 404 | Unknown or malformed `versionId` |
| `NoSuchUpload` | 404 | Unknown or malformed `uploadId` |
| `NoSuchBucketPolicy` | 404 | No policy on the bucket |
| `NoSuchCORSConfiguration` | 404 | No CORS configuration on the bucket |
| `BucketAlreadyExists` | 409 | Name taken by another user |
| `BucketAlreadyOwnedByYou` | 409 | You already own this bucket |
| `BucketNotEmpty` | 409 | Objects, versions or multipart uploads remain |
| `InvalidBucketName` | 400 | Name breaks the naming rules |
| `InvalidArgument` | 400 | Invalid key (`.`, `..`, empty segment, over 1,024 bytes or 64 levels), malformed `aws-chunked` body, invalid copy source, SSE-C key MD5 mismatch, unsupported `x-amz-content-sha256` |
| `InvalidPart` | 400 | Part missing or ETag mismatch on complete |
| `InvalidPartOrder` | 400 | Parts not in ascending order on complete |
| `MalformedPolicy` | 400 | Invalid policy JSON, field or action |
| `MalformedXML` | 400 | Invalid XML body |
| `XAmzContentSHA256Mismatch` | 400 | Body does not match the signed hash. Nothing is stored |
| `RequestTimeout` | 400 | Upload stalled 60 seconds or slower than `S3_MIN_UPLOAD_RATE` |
| `MissingSecurityHeader` | 400 | SSE-C object read without its key |
| `InvalidEncryptionAlgorithmError` | 400 | Algorithm other than `AES256` |
| `ServerSideEncryptionConfigurationNotFoundError` | 400 | SSE-S3 requested without a master key |
| `MethodNotAllowed` | 405 | Unsupported method on this path. Often an empty body |
| `EntityTooLarge` | 413 | Body or metadata over its [limit](./limits.md) |
| `InvalidRange` | 416 | `Range` outside the object |
| `InternalError` | 500 | Server-side failure: check the logs |
