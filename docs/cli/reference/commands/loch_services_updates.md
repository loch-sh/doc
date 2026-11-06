---
title: "loch services updates"
description: "List the updates available for the dedicated instances"
sidebar_label: "services updates"
slug: "loch-services-updates"
---

## loch services updates

List the updates available for the dedicated instances

### Synopsis

List the dedicated instances (Redis, Valkey, NATS, Loch S3, ElasticMQ, Mosquitto) with a newer image of
their version or newer versions, with the end of support of each. The API discovers the versions on the
registries periodically; --check asks for a discovery now. Apply one with loch services upgrade.

```
loch services updates [flags]
```

### Examples

```
  loch services updates --check
```

### Options

```
      --check   Check the registries now (otherwise the last periodic check is shown)
  -h, --help    help for updates
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch services](loch_services.md)	 - Manage services: databases, caches and message brokers

