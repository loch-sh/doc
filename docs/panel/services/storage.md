---
sidebar_position: 6
title: Storage
description: Create Loch S3 object storage instances with a quota and optional encryption, and connect a Laravel site.
---

# Storage

The **Storage** menu offers [Loch S3](/s3/), an object storage compatible with the Amazon S3 API. Sites store and serve uploads, media and backups with any S3 client or SDK. Each instance runs in its own container (`svc-s3-<name>`) with a single root user; a bucket named after the instance is created at start.

:::note
Admin only. Requires the [services module](./overview.md).
:::

## Create an instance

1. Open **Storage → Loch S3**, then click **New instance**.
2. Choose the **Version**, the settings, the **Networks** and the **Name** (lowercase letters and digits), then click **Create**.
3. Copy the secret from **Connection details**.

| Setting | Values | Default | Changeable |
|---|---|---|---|
| **Memory** | 128 MB to 1 GB, or **Custom** up to 8 GB | 256 MB | Yes |
| **Storage quota** | 1 GB to 500 GB, or **Custom** up to 10 TB | 10 GB | Yes |
| **Server-side encryption** | SSE-S3 (AES-256-GCM) on every object, with a key generated for the instance. Loch S3 1.4 and later | **Disabled** | No |

The quota counts objects, their versions and uploads in progress. Lowering it below the space used refuses new writes; nothing is deleted.

```bash
loch services create media --engine s3 --version 1.4 --option quota=10240
```

## Connection details

| Field | Value |
|---|---|
| **Endpoint** | `http://svc-s3-<name>:8080` |
| **Region** | `us-east-1` |
| **Bucket** | Named after the instance. The user can create others |
| **Access key ID**, **Secret access key** | The secret is shown once |
| **Path-style URLs** | Required |

**Copy the Laravel .env lines** copies, secret included:

```bash
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=...
AWS_ENDPOINT=http://svc-s3-media:8080
AWS_USE_PATH_STYLE_ENDPOINT=true
```

## Good to know

- Path-style URLs only, no TLS. Publishing on a public address requires `SERVICES_TLS=off`.
- **New password** changes both the access key and the secret, then restarts the instance. Presigned URLs signed with the old key stop working.
- Presigned URLs use the internal address: they do not work from a browser.
- Buckets, policies and CORS: [Loch S3 documentation](/s3/).
- Update, resize, published port and deletion: [Managed services](./overview.md).
