---
sidebar_position: 1
title: Architecture
description: How the Loch S3 code is organized and how buckets and objects are stored on disk.
---

# Architecture

Loch S3 is written in Rust on raw `hyper` 1 and `tokio`, without a web framework. Requests are routed by hand in `src/router.rs`.

## Request flow

1. `router.rs` parses the path (`/{bucket}/{key}`) and the sub-resource (`?policy`, `?uploads`…), and rejects non-canonical keys.
2. `auth.rs` checks the SigV4 signature and attaches the body check (signed hash or chunk signatures).
3. The router authorizes: root, bucket owner, then bucket policy (`policy.rs`) and ACLs.
4. A handler in `src/handlers/` runs the operation through `src/storage/`.
5. CORS headers are added when the bucket has a matching rule (`cors.rs`).

## Source layout

| Path | Role |
|---|---|
| `src/main.rs` | Environment variables, startup, cleanup tasks |
| `src/lib.rs` | `ServerConfig`, connection loop, HTTP/1 and HTTP/2 settings |
| `src/router.rs` | Routing, authorization, ACLs, CORS preflight |
| `src/auth.rs` | SigV4 headers and presigned URLs, body checks |
| `src/users.rs` | Users file and in-memory user store |
| `src/policy.rs` | Bucket policy model and evaluation |
| `src/encryption.rs` | SSE-S3 and SSE-C, AES-256-GCM in 1 MiB chunks, HKDF-SHA256 |
| `src/quota/` | Quota counter, reservations, background recount |
| `src/handlers/` | One file per area: bucket, object, multipart, versioning, policy, cors, encryption, users, health |
| `src/storage/` | Filesystem layer for the same areas |
| `src/bin/loch-s3.rs` | User management CLI |
| `tests/integration.rs` | Integration tests against a real server |

## On-disk layout

| Path in `S3_DATA_DIR` | Content |
|---|---|
| `{bucket}/` | One directory per bucket |
| `{bucket}/{key}` | Object data, one file per object (ciphertext if encrypted) |
| `{bucket}/.metadata` | Bucket creation date and owner |
| `{bucket}/.meta/{key}.json` | Object metadata: headers, ETag, owner, encryption parameters |
| `{bucket}/.versions/`, `.versioning.json` | Versions and versioning status |
| `{bucket}/.acl/`, `.acl.xml` | Object and bucket ACLs |
| `{bucket}/.policy.json`, `.cors.json`, `.encryption.json` | Bucket settings |
| `{bucket}/.uploads/{upload_id}/` | Multipart parts in progress |
| `.loch-tmp/` | Writes in progress, renamed into place when complete; emptied at startup |

## Rules

- Writes go to a temporary file, are encrypted there if needed, then published with a rename: metadata first, then data.
- Bodies are streamed to disk with an incremental MD5; nothing is buffered whole.
- Every write reserves its size in the quota before writing.
- Headers and query strings are never logged.
