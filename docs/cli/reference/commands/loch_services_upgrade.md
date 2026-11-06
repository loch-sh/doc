---
title: "loch services upgrade"
description: "Update a dedicated instance to the latest image of its version, or to a newer version"
sidebar_label: "services upgrade"
slug: "loch-services-upgrade"
---

## loch services upgrade

Update a dedicated instance to the latest image of its version, or to a newer version

### Synopsis

Update a dedicated instance (Redis, Valkey, NATS, Loch S3, ElasticMQ, Mosquitto): the new image is pulled,
then the instance is recreated with it (its clients are disconnected for a few seconds, the data is kept).
Without --version: the latest image of its current version. With --version: a newer version offered by
loch services updates. An instance never goes back to an older version (data written by a newer version
may not be readable by an older one). If the new image does not start, the previous one is restored.
Shared instances (databases, RabbitMQ) are not updated this way.

```
loch services upgrade <instance> [--version <version>] [flags]
```

### Examples

```
  loch services upgrade redis-cache
  loch services upgrade redis-cache --version 8.10
```

### Options

```
  -h, --help             help for upgrade
      --version string   Newer version to move to (see loch services updates; default: the latest image of the current version)
  -y, --yes              Skip the confirmation prompt
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch services](loch_services.md)	 - Manage services: databases, caches and message brokers

