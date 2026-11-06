---
title: "loch services reset-password"
description: "Generate a new password for a resource user (shown once)"
sidebar_label: "services reset-password"
slug: "loch-services-reset-password"
---

## loch services reset-password

Generate a new password for a resource user (shown once)

### Synopsis

Generate a new password: the old one stops working and open connections are closed.
Dedicated instances (Redis, Valkey, NATS, S3, Mosquitto) are restarted to apply it (a few seconds of unavailability).

```
loch services reset-password <instance> <name> [flags]
```

### Examples

```
  loch services reset-password postgres-17 shop
```

### Options

```
  -h, --help            help for reset-password
      --show-password   Print the password even when stdout is not a terminal (e.g. to capture it)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch services](loch_services.md)	 - Manage services: databases, caches and message brokers

