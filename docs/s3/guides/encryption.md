---
sidebar_position: 4
title: Encryption
description: Encrypt objects at rest with SSE-S3 (server key) or SSE-C (client key), per request, per bucket or for every write.
---

# Encryption

Loch S3 encrypts objects with AES-256-GCM. Two modes:

| Mode | Key | Server setup |
|---|---|---|
| SSE-S3 | A master key on the server; one key derived per object | `S3_ENCRYPTION_KEY_FILE` or `S3_ENCRYPTION_KEY` |
| SSE-C | Sent by the client with every request, never stored | None |

## Set the master key

The key is 32 random bytes, base64-encoded:

```bash
openssl rand -base64 32 > master.key
sudo chown 100:101 master.key   # the container user
chmod 0400 master.key
```

Mount the file and set `S3_ENCRYPTION_KEY_FILE` to its path. Prefer the file to `S3_ENCRYPTION_KEY`: environment variables show up in `docker inspect`.

:::warning
Without the master key, SSE-S3 objects cannot be read. Back it up apart from the data, see [Backup and restore](../admin/backup.md).
:::

## Choose what gets encrypted

| Scope | How |
|---|---|
| One request | Header `x-amz-server-side-encryption: AES256` (`--sse AES256` in `aws s3 cp`) |
| One bucket | Bucket default encryption (below) |
| Every write | `S3_ENCRYPT_BY_DEFAULT=true` |

Bucket default encryption (only the owner or root can set it):

```bash
aws s3api put-bucket-encryption --bucket my-bucket --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
```

Downloads are decrypted transparently.

## SSE-C

```bash
KEY=$(openssl rand -base64 32)
KEY_MD5=$(echo -n "$KEY" | base64 -d | openssl dgst -md5 -binary | base64)
SSE_C="--sse-customer-algorithm AES256 --sse-customer-key $KEY --sse-customer-key-md5 $KEY_MD5"

aws s3api put-object --bucket my-bucket --key secret.txt --body secret.txt $SSE_C
aws s3api get-object --bucket my-bucket --key secret.txt secret.txt $SSE_C
```

Keep the key: the server does not store it, and the object cannot be read without it.

Without the key, a GET fails with `MissingSecurityHeader`; with a wrong key, with `AccessDenied`.

## Good to know

- Objects written before encryption was turned on stay in clear text. Copy an object onto itself to encrypt it.
- SSE-C headers win over default encryption. SSE-S3 and SSE-C headers cannot be combined.
- Multipart parts stay in clear text in `.uploads/` until the upload is completed.
- Without HTTPS, SSE-C keys travel in clear text: keep a TLS proxy in front.
