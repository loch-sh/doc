---
sidebar_position: 3
title: Cache
description: Create dedicated Redis and Valkey instances, choose their memory, eviction policy, persistence, Lua scripts and Redis modules.
---

# Cache

The **Cache** menu offers **Redis** and **Valkey**, two in-memory key-value stores used for caching, sessions, queues and counters. Each instance runs in its own container, with one user.

:::note
Admin only. Requires the [services module](./overview.md).
:::

## Create an instance

1. Open **Cache → Redis** (or **Valkey**), then click **New instance**.
2. Choose the **Version**, then the settings under **Size and settings** (table below).
3. Choose the **Networks** and enter the **Name**: lowercase letters and digits, starting with a letter, 24 characters max. It becomes the user, and the host name is `svc-redis-<name>` (or `svc-valkey-<name>`).
4. Click **Create**, then copy the password from **Connection details**.

<Screenshot id="services-create-redis" alt="The New Redis instance page with the version and memory cards and the summary" />

```bash
loch services create cache --engine redis --version 8.4 --option memory=512 --option policy=allkeys-lru
```

## Settings

| Setting | Values | Default | Changeable |
|---|---|---|---|
| **Memory** | 128 MB to 4 GB, or **Custom** up to 64 GB. The data gets half | 256 MB | Yes |
| **When memory is full** | **Refuse writes**, or evict keys (least recently used, least frequently used, expiring keys) | **Refuse writes** | Yes |
| **Persistence** | **Journal (AOF)**: at most one second lost; **Snapshots**: writes since the last snapshot can be lost; **None**: lost at every restart | **Journal (AOF)** | No |
| **Lua scripts** | **Allowed** or **Disabled** (`EVAL` and functions) | **Allowed** | Yes |
| **Redis modules** | JSON, search, time series, Bloom filters (Redis 8 and later only) | **Disabled** | Yes |

For a pure cache, choose **Evict least recently used**. Keep **Refuse writes** when the data must not disappear (sessions, queues).

**Edit** changes the changeable settings: the instance restarts, the data is kept. Option names for the CLI: [Services engines](../reference/services-engines.md#options-of-dedicated-engines).

## Connection details

**Host** (`svc-redis-<name>`, `svc-valkey-<name>`), **Port** (6379), **User**, **Password** and **Connection URI**.

## Good to know

- Lua scripts and Redis modules widen the attack surface: turn them off when no library needs them.
- Update, resize, published port and deletion: [Managed services](./overview.md).
