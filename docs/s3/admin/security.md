---
sidebar_position: 4
title: Security
description: Security checklist for a Loch S3 server and summary of the protections built into it.
---

# Security

## Checklist

1. Enable authentication: set `S3_USERS_FILE` (or `S3_ACCESS_KEY_ID` + `S3_SECRET_ACCESS_KEY`). Without it, anyone can read and write.
2. Serve the API over HTTPS only, through a reverse proxy.
3. Block `/_loch/users` at the proxy, or leave `S3_ADMIN_API_KEY` unset.
4. Read the master key from a `0400` file (`S3_ENCRYPTION_KEY_FILE`), not from the environment.
5. Keep the data directory on a case-sensitive filesystem, used only by Loch S3.
6. Run the container read-only, without capabilities, with memory and PID limits. See [Production deployment](./production.md#hardened-container).
7. Give each application its own user and grant it only the buckets it needs.

## Built-in protections

| Area | Protection |
|---|---|
| Signatures | SigV4 checked in constant time; clock skew over 15 minutes refused; `host` and every `x-amz-*` header must be signed |
| Request bodies | Signed SHA-256 and `aws-chunked` chunk signatures verified; nothing is stored on mismatch |
| Presigned URLs | 1 second to 7 days; a bad signature never falls back to anonymous access |
| Paths | Bucket names and keys validated; `.`, `..`, empty segments and symlinks refused |
| Policies | Explicit `Deny` wins; unsupported fields refused instead of ignored; a stored policy that cannot be read denies |
| Encryption | Data encrypted before it is published; plaintext never lands under a bucket |
| Logs | No headers, query strings or keys in the logs |
| Resources | Header and body timeouts, minimum upload rate, connection cap, quota |

## Known limits

- `UNSIGNED-PAYLOAD` and trailing checksums are accepted without verification: integrity then relies on TLS.
- Encrypted objects keep their parameters in a metadata file that is not authenticated.
- A bucket-level `READ` grant allows downloading every object of the bucket.

Full audit history and fixes: [SECURITY.md](https://github.com/loch-sh/s3/blob/1.4.1/SECURITY.md).
