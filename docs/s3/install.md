---
sidebar_position: 2
title: Install
description: Run Loch S3 with Docker or as a binary, then create a first bucket with the AWS CLI.
---

# Install

## Docker

The image `ghcr.io/loch-sh/s3:<version>` runs on `linux/amd64` and `linux/arm64`. It listens on port `8080`, stores data in `/data`, runs as uid:gid `100:101` and has a built-in healthcheck.

1. Create `compose.yaml`:

   ```yaml
   services:
     s3:
       image: ghcr.io/loch-sh/s3:1.4.1
       restart: unless-stopped
       ports:
         - "127.0.0.1:8080:8080"
       environment:
         S3_USERS_FILE: /data/.users.json
       volumes:
         - s3-data:/data

   volumes:
     s3-data:
   ```

2. Start it:

   ```bash
   docker compose up -d
   ```

3. Read the root credentials. On first start, the server creates the users file with a `root` user and random keys:

   ```bash
   docker compose exec s3 cat /data/.users.json
   ```

The port is published on the loopback only. To expose it, put a TLS reverse proxy in front: see [Production deployment](./admin/production.md).

## Binary

Download the archive for your platform from [GitHub Releases](https://github.com/loch-sh/s3/releases): Linux musl (`amd64`, `arm64`), Windows `amd64` and macOS (`amd64`, `arm64`). Each archive holds the server `s3` and the user CLI `loch-s3`.

```bash
curl -L -o s3.tar.gz https://github.com/loch-sh/s3/releases/download/1.4.1/s3-linux-amd64.tar.gz
tar xzf s3.tar.gz
S3_DATA_DIR=./data S3_USERS_FILE=./users.json ./s3
```

Without `S3_USERS_FILE` or `S3_ACCESS_KEY_ID`, the server accepts every request without authentication. Use this only for local tests.

## First bucket

Use the access key and secret of the `root` user:

```bash
export AWS_ACCESS_KEY_ID=<access_key_id> AWS_SECRET_ACCESS_KEY=<secret_access_key> AWS_DEFAULT_REGION=us-east-1
aws --endpoint-url http://localhost:8080 s3 mb s3://my-bucket
aws --endpoint-url http://localhost:8080 s3 cp report.pdf s3://my-bucket/report.pdf
aws --endpoint-url http://localhost:8080 s3 ls s3://my-bucket
```

Next: [connect a client](./guides/connect-a-client.md). Every variable: [Configuration reference](./reference/configuration.md).
