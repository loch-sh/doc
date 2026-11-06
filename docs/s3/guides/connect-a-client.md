---
sidebar_position: 1
title: Connect a client
description: Configure the AWS CLI, an S3 SDK or Cyberduck to use a Loch S3 server with path-style URLs.
---

# Connect a client

Every S3 client needs three settings:

| Setting | Value |
|---|---|
| Endpoint | URL of the server, for example `https://s3.example.com` |
| Addressing style | Path-style (virtual-hosted-style is not supported) |
| Region | Any value; use `us-east-1` |

## AWS CLI

```bash
aws configure set aws_access_key_id <access_key_id>
aws configure set aws_secret_access_key <secret_access_key>
aws configure set region us-east-1
aws configure set default.s3.addressing_style path
```

Pass the endpoint to every command, or set it once with `aws configure set endpoint_url https://s3.example.com`:

```bash
aws --endpoint-url https://s3.example.com s3 ls
```

HTTP/2 is negotiated automatically. Enable it in the AWS CLI with `export AWS_USE_HTTP2=true`.

## SDKs

Set the endpoint, the region and path-style addressing. Example with Python (boto3):

```python
import boto3
from botocore.config import Config

s3 = boto3.client(
    "s3",
    endpoint_url="https://s3.example.com",
    region_name="us-east-1",
    aws_access_key_id="<access_key_id>",
    aws_secret_access_key="<secret_access_key>",
    config=Config(s3={"addressing_style": "path"}),
)
```

Other SDKs have the same options: `forcePathStyle: true` in JavaScript v3, `usePathStyle` / `forcePathStyle` in Java, `UsePathStyle` in Go v2.

## Cyberduck

1. Download [`LochS3.cyberduckprofile`](https://github.com/loch-sh/s3/blob/1.4.1/LochS3.cyberduckprofile) from the repository.
2. Double-click it to install it.
3. Open a new connection, choose the **Loch S3** protocol, then enter the server, port, access key and secret key.

The profile sets SigV4, path-style URLs and plain HTTP on port `8080`. For a server behind HTTPS, set `Scheme` to `https` and `Default Port` to `443` in the file before you install it.

## Good to know

- The server clock and the client clock must agree within 15 minutes, or requests fail with `RequestTimeTooSkewed`.
- The `host` header and every `x-amz-*` header must be signed. Standard SDKs do this.
- Recent SDKs send `aws-chunked` bodies with trailing checksums: they are accepted, the checksums are not verified.
