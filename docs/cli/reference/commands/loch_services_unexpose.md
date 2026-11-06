---
title: "loch services unexpose"
description: "Close the published port of an instance (admin, services:expose scope)"
sidebar_label: "services unexpose"
slug: "loch-services-unexpose"
---

## loch services unexpose

Close the published port of an instance (admin, services:expose scope)

### Synopsis

Close the published port of an instance: clients outside the panel can no longer reach it. The instance
is recreated: its clients are disconnected for a few seconds. Sites keep reaching it on its networks.

```
loch services unexpose <instance> [flags]
```

### Examples

```
  loch services unexpose postgres-17
```

### Options

```
  -h, --help   help for unexpose
  -y, --yes    Skip the confirmation prompt
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch services](loch_services.md)	 - Manage services: databases, caches and message brokers

