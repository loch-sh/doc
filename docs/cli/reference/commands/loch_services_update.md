---
title: "loch services update"
description: "Change the options of a dedicated instance (Redis, Valkey, NATS, S3, ElasticMQ, Mosquitto)"
sidebar_label: "services update"
slug: "loch-services-update"
---

## loch services update

Change the options of a dedicated instance (Redis, Valkey, NATS, S3, ElasticMQ, Mosquitto)

### Synopsis

Change the size or settings of a dedicated instance (see loch services engines for the options and
which ones can change). The instance is recreated with them: a few seconds of unavailability, data kept.
On failure, the previous options are restored.

```
loch services update <instance> --option key=value [...] [flags]
```

### Examples

```
  loch services update redis-cache --option memory=1024 --option policy=allkeys-lru
```

### Options

```
  -h, --help                    help for update
  -o, --option stringToString   Option to change, key=value (repeatable) (default [])
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch services](loch_services.md)	 - Manage services: databases, caches and message brokers

