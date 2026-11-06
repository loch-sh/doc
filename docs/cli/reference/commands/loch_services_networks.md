---
title: "loch services networks"
description: "Replace the networks of an instance (it is recreated)"
sidebar_label: "services networks"
slug: "loch-services-networks"
---

## loch services networks

Replace the networks of an instance (it is recreated)

### Synopsis

Replace the networks an instance joins: only the sites on one of them can reach it. "services" is the
shared network of the module (refused for engines without authentication, such as ElasticMQ).
The instance is recreated: its clients are disconnected for a few seconds, the data is kept.
To add or remove a single network, see also loch networks attach / detach --instance.

```
loch services networks <instance> --network <name> [--network <name> ...] [flags]
```

### Examples

```
  loch services networks postgres-17 --network services --network shop
  loch services networks elasticmq-jobs --network shop
```

### Options

```
  -h, --help                  help for networks
  -n, --network stringArray   Network the instance joins (repeatable, replaces the list)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch services](loch_services.md)	 - Manage services: databases, caches and message brokers

