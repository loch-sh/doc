---
title: "loch networks create"
description: "Create a private network"
sidebar_label: "networks create"
slug: "loch-networks-create"
---

## loch networks create

Create a private network

### Synopsis

Create an internal network (no Internet access) named loch-net-&lt;name> in Docker. Names: lowercase
letters, digits and dashes, starting with a letter (24 characters max). The subnet is optional (Docker
picks one): a private IPv4 range from /16 to /28, outside the reserved ranges (LAN, VPN) and the other
Docker networks; it cannot change afterwards. See the rules with loch networks config.

```
loch networks create <name> [--subnet CIDR] [--description TEXT] [flags]
```

### Examples

```
  loch networks create shop --description "Shop and its queue"
  loch networks create crm --subnet 10.42.0.0/24
```

### Options

```
      --description string   Free description
  -h, --help                 help for create
      --subnet string        IPv4 subnet in CIDR notation, e.g. 10.42.0.0/24 (default: chosen by Docker)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch networks](loch_networks.md)	 - Manage the private networks between sites and services

