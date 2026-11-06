---
title: "loch services delete"
description: "Delete a resource (database, vhost or dedicated instance)"
sidebar_label: "services delete"
slug: "loch-services-delete"
---

## loch services delete

Delete a resource (database, vhost or dedicated instance)

### Synopsis

Delete a database (or vhost) and its user permanently; when it is the last one of its shared instance,
the instance is removed too, with its data. A dedicated instance (Redis, Valkey, NATS, S3, ElasticMQ, Mosquitto) is deleted with its data.

```
loch services delete <instance> <name> [flags]
```

### Examples

```
  loch services delete postgres-17 shop
```

### Options

```
  -h, --help   help for delete
  -y, --yes    Skip the confirmation prompt
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch services](loch_services.md)	 - Manage services: databases, caches and message brokers

