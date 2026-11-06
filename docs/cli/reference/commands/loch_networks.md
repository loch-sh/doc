---
title: "loch networks"
description: "Manage the private networks between sites and services"
sidebar_label: "networks"
slug: "loch-networks"
---

## loch networks

Manage the private networks between sites and services

### Synopsis

Manage the private networks (admin only): internal Docker networks, without Internet access, that
connect hosted sites and service instances. A site only reaches the instances of its networks.
"services" is the shared network of the services module: every site on it reaches the instances on
it (it cannot be deleted). A private network isolates a group, e.g. a site and its queue.
Attaching or detaching a member recreates its container (a few seconds of downtime for it only).

### Options

```
  -h, --help   help for networks
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch](loch.md)	 - CLI to manage your containers via Host Panel
* [loch networks attach](loch_networks_attach.md)	 - Connect a site or a service instance to a network
* [loch networks config](loch_networks_config.md)	 - Show the creation rules of the networks
* [loch networks create](loch_networks_create.md)	 - Create a private network
* [loch networks delete](loch_networks_delete.md)	 - Delete a private network without members
* [loch networks detach](loch_networks_detach.md)	 - Disconnect a site or a service instance from a network
* [loch networks disconnect](loch_networks_disconnect.md)	 - Disconnect a container the panel does not manage from a network
* [loch networks docker](loch_networks_docker.md)	 - Show the other Docker networks (read-only)
* [loch networks ls](loch_networks_ls.md)	 - List the networks
* [loch networks show](loch_networks_show.md)	 - Show a network and its members
* [loch networks update](loch_networks_update.md)	 - Change the description of a network

