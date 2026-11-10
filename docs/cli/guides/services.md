---
sidebar_position: 7
title: Databases and services
description: Create databases, caches, message brokers, queues and object storage, reset their passwords, resize, update and publish them.
---

# Databases and services

`loch services` (alias `loch db`) manages the services module. Admin only; the module must be enabled on the server. Panel side: [Services](/panel/services/overview/).

- **Shared engines** (MySQL, MariaDB, PostgreSQL, MongoDB, RabbitMQ): one instance per version. You create a database (or vhost) with a user of the same name. The first one starts the instance.
- **Dedicated engines** (Redis, Valkey, NATS, Loch S3, ElasticMQ, Mosquitto): one container per resource, sized with options.

## Commands

| Command | Does |
|---|---|
| `loch services engines` | Lists the engines, versions, options and the port publishing policy. |
| `loch services instances` | Lists the instances and their state. |
| `loch services ls` | Lists the resources (`--instance` to filter). |
| `loch services create <name> --engine <e> --version <v>` | Creates a resource. Shows the password once. |
| `loch services reset-password <instance> <name>` | Generates a new password. Shows it once. |
| `loch services delete <instance> <name>` | Deletes a resource and its data. |
| `loch services update <instance> --option k=v` | Resizes a dedicated instance (restarts it). |
| `loch services updates` | Lists the updates of the dedicated instances (`--check`: check now). |
| `loch services upgrade <instance>` | Updates a dedicated instance to the latest image of its version (`--version`: move to a newer version). |
| `loch services networks <instance> --network <n>` | Replaces the networks of an instance. |
| `loch services expose <instance> <addr>:<port>` | Publishes the port of an instance on the host. |
| `loch services unexpose <instance>` | Closes the published port. |
| `loch services retire <instance>` | Removes an empty instance. |
| `loch services purge <instance>` | Deletes an instance edited by hand, with all its data. |

```bash
loch services create shop --engine postgres --version 17
loch services create cache --engine redis --version 8.4 --option memory=512
loch services reset-password postgres-17 shop
loch services expose postgres-17 127.0.0.1:5417
```

## Permissions

| Command | Scope | Admin |
|---|---|---|
| `engines`, `instances`, `ls`, `updates` | `services:read` | Yes |
| `create`, `reset-password`, `delete`, `update`, `upgrade`, `retire`, `purge`, `updates --check` | `services:write` | Yes |
| `networks` | `networks:write` | Yes |
| `expose`, `unexpose` | `services:expose` (not included in `services:write`) | Yes |

## Good to know

- The password is printed only on a terminal. In a pipe or a CI log, add `--show-password`.
- `update`, `upgrade`, `networks` and `expose` recreate the instance: its clients are disconnected for a few seconds. The data is kept.
- `upgrade` makes no backup and never goes back to an older version. Back up first when it matters.
- ElasticMQ has no authentication: it is refused on the shared network `services`. Give it a private network with `--network` (see [Networks](./networks.md)).
- Deleting a resource, publishing a port and moving to another version are CLI or panel only: the MCP server does not offer them.
