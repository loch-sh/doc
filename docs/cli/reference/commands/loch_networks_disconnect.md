---
title: "loch networks disconnect"
description: "Disconnect a container the panel does not manage from a network"
sidebar_label: "networks disconnect"
slug: "loch-networks-disconnect"
---

## loch networks disconnect

Disconnect a container the panel does not manage from a network

### Synopsis

Disconnect from a network a container the panel does not manage (shown as unmanaged by loch networks
show, e.g. a container connected by hand or by a CI job). Sites and instances leave a network with
loch networks detach.

```
loch networks disconnect <network> <containerId> [flags]
```

### Examples

```
  loch networks disconnect shop 3f2a9c1d7e4b
```

### Options

```
  -h, --help   help for disconnect
  -y, --yes    Skip the confirmation prompt
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch networks](loch_networks.md)	 - Manage the private networks between sites and services

