---
sidebar_position: 5
title: Upgrade to 1.4.1
description: Upgrade a Loch S3 server to 1.4.1 and check the behavior changes that can affect existing clients and buckets.
---

# Upgrade to 1.4.1

1.4.1 is a security release. Some fixes change how the server behaves: check them before you upgrade.

## Upgrade

1. [Back up](./backup.md) the data directory, the users file and the master key.
2. Check the changes below.
3. Change the image tag to `ghcr.io/loch-sh/s3:1.4.1` and restart:

   ```bash
   docker compose pull s3 && docker compose up -d s3
   ```

## Behavior changes

| Change | Effect | What to do |
|---|---|---|
| Policies with `Condition`, `NotAction`, `NotResource`, `NotPrincipal` or an invalid action are refused | A policy stored by an older version with these fields no longer applies: the bucket becomes private (root and owner only) | Before upgrading, read each policy with `get-bucket-policy` and rewrite it without these fields |
| Explicit `Deny` wins over ACLs | A `public-read` ACL no longer opens objects that a policy denies | Nothing, unless you relied on it |
| Slow uploads are cut | An upload under 4096 bytes/s over 60 seconds fails with `RequestTimeout` | For slow links, lower `S3_MIN_UPLOAD_RATE` or set it to `0` |
| The quota counts metadata files and ACLs | Reported usage grows a little | Check the margin under `S3_MAX_STORAGE_BYTES` |
| Non-canonical keys are refused | Keys with `.`, `..` or empty segments (`a//b`, `./x`) fail with `400` | Objects written earlier under such keys stay reachable through their normalized key (`a/b`, `x`) |
| Stricter signatures | `host` and every `x-amz-*` header must be signed; the body must match the signed hash | Standard SDKs comply. Check hand-made clients |

New variables: `S3_MIN_UPLOAD_RATE` and `S3_MAX_CONNECTIONS`. See [Configuration reference](../reference/configuration.md).

## Good to know

- Upgrading from 1.2 or older: a crash could leave `{name}.{uuid}.tmp` files next to objects. They now show up as ordinary objects: delete them like any object.
