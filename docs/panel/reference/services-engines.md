---
sidebar_position: 4
title: Services engines
description: Every engine of the managed services module, with its versions, topology, port, images and options with their allowed values.
---

# Services engines

Full catalog of the [managed services](../admin/services.md) module. Run `loch services engines` to see what your server offers right now.

## Engines

| Engine | ID | Menu | Topology | Port | Built-in versions | Oldest supported |
|---|---|---|---|---|---|---|
| PostgreSQL | `postgres` | Databases | shared | 5432 | 18, 17, 16, 15 | 15 |
| MariaDB | `mariadb` | Databases | shared | 3306 | 11.8, 11.4, 10.11 | 10.11 |
| MySQL | `mysql` | Databases | shared | 3306 | 8.4 | 5.6 (offered only when pinned) |
| MongoDB | `mongodb` | Databases | shared | 27017 | 8.0, 7.0, 6.0 | 6.0 |
| RabbitMQ | `rabbitmq` | Messaging | shared | 5672 | 4.2, 4.1, 4.0 | 4.0 |
| Redis | `redis` | Cache | dedicated | 6379 | 8.4, 8.2, 7.4 | 7.2 |
| Valkey | `valkey` | Cache | dedicated | 6379 | 9.0, 8.1, 7.2 | 7.2 |
| NATS | `nats` | Messaging | dedicated | 4222 | 2.12, 2.11, 2.10 | 2.10 |
| ElasticMQ (SQS-compatible) | `elasticmq` | Queues | dedicated | 9324 | 1.7 | 1.7 |
| Eclipse Mosquitto (MQTT) | `mosquitto` | Queues | dedicated | 1883 | 2.0 | 2.0 |
| Loch S3 (S3-compatible) | `s3` | Storage | dedicated | 8080 | 1.4 | 1.4 |

- **Shared**: one instance per version; a resource is a database and its user (a virtual host and its user for RabbitMQ).
- **Dedicated**: one container per resource, named and sized at creation.
- **Built-in versions** are used until the first version discovery succeeds. After that, creation offers the latest supported version of each of the 3 latest majors, plus the versions pinned with `SERVICES_<ENGINE>_PINNED_VERSIONS`.
- Existing instances stay managed whatever their version, from the oldest supported one.

## Images and version sources

| Engine | Tags listed on | Pulled from | Support dates |
|---|---|---|---|
| PostgreSQL | `docker.io/library/postgres` (`17`) | `mirror.gcr.io` | endoflife.date |
| MariaDB | `docker.io/library/mariadb` (`11.4`) | `mirror.gcr.io` | endoflife.date |
| MySQL | `docker.io/library/mysql` (`8.4`) | `mirror.gcr.io` | endoflife.date |
| MongoDB | `docker.io/library/mongo` (`8.0`) | `mirror.gcr.io` | endoflife.date |
| RabbitMQ | `docker.io/library/rabbitmq` (`4.2`) | `mirror.gcr.io` | endoflife.date |
| Redis | `docker.io/library/redis` (`8.4-alpine`) | `mirror.gcr.io` | endoflife.date |
| Valkey | `docker.io/valkey/valkey` (`9.0-alpine`) | `mirror.gcr.io` | endoflife.date |
| NATS | `docker.io/library/nats` (`2.12-alpine`) | `mirror.gcr.io` | none: published means supported |
| ElasticMQ | `docker.io/softwaremill/elasticmq-native` (`1.7.1`) | `mirror.gcr.io` | none |
| Mosquitto | `docker.io/library/eclipse-mosquitto` (`2.0.22`) | `mirror.gcr.io` | none |
| Loch S3 | `ghcr.io/loch-sh/s3` (`1.4.0`) | `ghcr.io` | none |

ElasticMQ, Mosquitto and Loch S3 use exact patch tags: a version runs its highest patch tag.

## Options of dedicated engines

Pass them with `--option key=value` in the CLI. "Changeable" means editable later (**Edit** button, `loch services update`); the others are set at creation.

| Engine | Option | Allowed values | Default | Changeable |
|---|---|---|---|---|
| Redis, Valkey | `memory` (container MB; data gets half) | 128, 256, 512, 1024, 2048, 4096 | 256 | yes |
| | `policy` (when memory is full) | `noeviction`, `allkeys-lru`, `allkeys-lfu`, `volatile-lru`, `volatile-lfu`, `volatile-ttl` | `noeviction` | yes |
| | `persistence` | `aof`, `rdb`, `none` | `aof` | no |
| | `scripting` (Lua) | `on`, `off` | `on` | yes |
| Redis only | `modules` (JSON, search, time series…; Redis 8 and later) | `off`, `on` | `off` | yes |
| NATS | `memory` (container MB; in-memory streams get a quarter) | 128, 256, 512, 1024 | 256 | yes |
| | `storage` (JetStream disk, MB) | 1024, 5120, 10240, 51200 | 1024 | yes |
| | `payload` (largest message, MB) | 1, 8, 64 | 1 | yes |
| ElasticMQ | `memory` (container MB) | 128, 256, 512, 1024 | 256 | yes |
| | `limits` (`strict`: Amazon SQS limits; `relaxed`: larger messages, longer delays) | `strict`, `relaxed` | `strict` | yes |
| Mosquitto | `memory` (container MB) | 64, 128, 256, 512 | 128 | yes |
| | `persistence` (retained messages, persistent sessions) | `on`, `off` | `on` | yes |
| | `message-size` (largest message, MB) | 1, 10, 100 | 1 | yes |
| | `queued` (messages kept per offline or slow client) | 1000, 10000, 100000 | 1000 | yes |
| Loch S3 | `memory` (container MB) | 128, 256, 512, 1024 | 256 | yes |
| | `quota` (MB) | 1024, 5120, 10240, 51200, 102400, 512000 | 10240 | yes |
| | `encryption` (SSE-S3 on every object; Loch S3 1.4 and later) | `off`, `on` | `off` | no |

### Custom sizes

Besides the listed values, these options accept any multiple of the step within the range (**Custom** card in GB, `--option memory=3G` in the CLI):

| Engine | Option | Range | Step |
|---|---|---|---|
| Redis, Valkey | `memory` | 128 MB to 64 GB | 128 MB |
| NATS | `memory` | 128 MB to 16 GB | 128 MB |
| | `storage` | 1 GB to 1 TB | 1 GB |
| ElasticMQ | `memory` | 128 MB to 8 GB | 128 MB |
| Mosquitto | `memory` | 64 MB to 4 GB | 64 MB |
| Loch S3 | `memory` | 128 MB to 8 GB | 128 MB |
| | `quota` | 1 GB to 10 TB | 1 GB |

## Shared engines

Shared engines have no options. One setting is chosen per database:

| Setting | Engines | Effect |
|---|---|---|
| **Legacy authentication** (`--legacy-auth`) | MySQL 8.4 to 8.x, PostgreSQL | `mysql_native_password` (MySQL) or `md5` (PostgreSQL) for old clients. Fixed at creation |

## Names and limits

| Item | Rule |
|---|---|
| Shared resource name | `[a-z][a-z0-9_]`, 32 characters max (16 on MySQL 5.6) |
| Dedicated instance name | `[a-z][a-z0-9]`, 24 characters max (it becomes a host name) |
| Reserved names (all engines) | `admin`, `all`, `default`, `healthcheck`, `loch`, `none`, `root`, `test`, `user`, and the `loch_` prefix |
| Resources per shared instance | `SERVICES_MAX_RESOURCES_PER_INSTANCE` (default 50) |
| Dedicated instances per engine | `SERVICES_MAX_DEDICATED_INSTANCES` (default 20) |

## Engine notes

| Engine | Note |
|---|---|
| ElasticMQ | No authentication. Refused on the `services` network, loopback-only when published |
| MySQL 5.6, MongoDB 6.0 | Out of support: loopback-only when published |
| MongoDB | Cannot require TLS: loopback-only when published while `SERVICES_TLS=auto` |
| Loch S3 | Path-style URLs only; no TLS (publishing on a public address requires `SERVICES_TLS=off`). `SERVICES_S3_ADMIN_API_KEY` (shared mode) is not available yet and disables the engine |
| Mosquitto | One MQTT user, no anonymous access |
