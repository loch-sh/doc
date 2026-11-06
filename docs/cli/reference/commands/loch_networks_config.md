---
title: "loch networks config"
description: "Show the creation rules of the networks"
sidebar_label: "networks config"
slug: "loch-networks-config"
---

## loch networks config

Show the creation rules of the networks

### Synopsis

Show the creation rules of the private networks: how many exist out of the limit, the subnet sizes,
the private ranges a subnet must be in and the reserved ranges (LAN, VPN: NETWORKS_RESERVED_RANGES)
it must not overlap.

```
loch networks config [flags]
```

### Options

```
  -h, --help   help for config
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch networks](loch_networks.md)	 - Manage the private networks between sites and services

