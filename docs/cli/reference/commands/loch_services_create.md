---
title: "loch services create"
description: "Create a database, cache or message broker resource (password shown once)"
sidebar_label: "services create"
slug: "loch-services-create"
---

## loch services create

Create a database, cache or message broker resource (password shown once)

### Synopsis

Shared engines (databases, RabbitMQ): create a database (or vhost) and a user of the same name, with
privileges on it only; the first resource of a version starts its instance. Names: lowercase letters,
digits and _, starting with a letter (32 characters max, 16 on MySQL 5.6).
Dedicated engines (Redis, Valkey, NATS, S3, ElasticMQ, Mosquitto): create a container of its own, sized with --option (see
loch services engines). Names: lowercase letters and digits, starting with a letter (24 characters max).
S3 (Loch S3): the access key and secret are the credentials, URLs are path-style (Laravel:
AWS_USE_PATH_STYLE_ENDPOINT=true); names have at least 3 characters.
Networks (--network, repeatable): the networks the instance joins when this command creates it
(shared engines: the first resource of a version; dedicated engines: always). Default: the shared
network "services". ElasticMQ has no authentication: give it the private network(s) of the sites
allowed to reach it (see loch networks).
Starting an instance can take a couple of minutes.

```
loch services create <name> --engine <engine> --version <version> [--option key=value ...] [flags]
```

### Examples

```
  loch services create shop --engine postgres --version 17
  loch services create cache --engine redis --version 8.4 --option memory=512 --option policy=allkeys-lru
  loch services create media --engine s3 --version 1.4 --option quota=10240
  loch services create oldcms --engine mysql --version 8.4 --legacy-auth
  loch services create jobs --engine elasticmq --version 1.7 --network shop
```

### Options

```
  -e, --engine string           Engine: mysql, mariadb, postgres, mongodb, redis, valkey, rabbitmq, nats, s3, elasticmq or mosquitto
  -h, --help                    help for create
      --legacy-auth             Older password mechanism for clients that lack the default one: mysql_native_password on MySQL 8.4, md5 on PostgreSQL (see LEGACY AUTH in loch services engines)
      --network stringArray     Network the new instance joins (repeatable; default: the shared network services; required for ElasticMQ). See loch networks ls
  -o, --option stringToString   Option of a dedicated engine, key=value (repeatable; see loch services engines) (default [])
      --show-password           Print the password even when stdout is not a terminal (e.g. to capture it)
      --version string          Engine version (see loch services engines)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch services](loch_services.md)	 - Manage services: databases, caches and message brokers

