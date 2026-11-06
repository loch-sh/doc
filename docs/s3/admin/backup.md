---
sidebar_position: 3
title: Backup and restore
description: Back up the data directory, the users file and the master key of Loch S3, and restore them.
---

# Backup and restore

A Loch S3 server is three things to back up:

| Item | Where | Why |
|---|---|---|
| Data directory | `S3_DATA_DIR` (`/data` in the image) | Objects, versions, metadata, policies, ACLs, bucket owners |
| Users file | `S3_USERS_FILE` | Keys of every user |
| Master key | `S3_ENCRYPTION_KEY_FILE` or `S3_ENCRYPTION_KEY` | Decrypts SSE-S3 objects |

:::warning
Without the master key, every SSE-S3 object is lost. Store it apart from the data backup, so one stolen backup does not hold both.
:::

## Back up

1. Stop the server, or take a filesystem snapshot (LVM, ZFS, Btrfs) so the copy is consistent.
2. Copy the data directory, keeping file owners and permissions:

   ```bash
   docker compose stop s3
   tar czf s3-data-$(date +%F).tar.gz -C /srv/s3 data
   docker compose start s3
   ```

3. Copy the users file and the master key to a separate, protected location.

## Restore

1. Stop the server.
2. Put back the data directory, the users file and the master key at the same paths.
3. Make the data directory writable by the container user: `chown -R 100:101 /srv/s3/data`.
4. Start the server. It removes leftover temporary files and recounts the storage used.

## Good to know

- SSE-C objects need the client's key: the server never had it.
- Restore on a case-sensitive filesystem (Linux). The server warns at startup otherwise.
- Do not edit the data directory by hand: each bucket keeps its metadata, versions and settings in hidden files (`.meta/`, `.versions/`, `.policy.json`...).
