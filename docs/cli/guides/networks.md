---
sidebar_position: 8
title: Private networks
description: Create private networks and choose which hosted sites reach which service instances.
---

# Private networks

`loch networks` (alias `loch net`) manages the internal Docker networks, without Internet access, that connect hosted sites and service instances. A site only reaches the instances of its networks. Admin only. Panel side: [Networks](/panel/admin/networks/).

`services` is the shared network of the services module. It cannot be deleted. A private network isolates a group, e.g. a site and its queue.

## Commands

| Command | Does |
|---|---|
| `loch networks ls` | Lists the networks (`--all`: also the other Docker networks). |
| `loch networks show <name>` | Shows a network and its members. |
| `loch networks config` | Shows the creation rules: limits, subnet sizes, reserved ranges. |
| `loch networks docker [name]` | Shows the Docker networks the panel did not create (read-only). |
| `loch networks create <name>` | Creates a private network (`--subnet`, `--description`). |
| `loch networks update <name> --description <text>` | Changes the description. The subnet cannot change. |
| `loch networks delete <name>` | Deletes a network without members. |
| `loch networks attach <network> --site <s>\|--instance <i>` | Connects a site or an instance. |
| `loch networks detach <network> --site <s>\|--instance <i>` | Disconnects a site or an instance. |
| `loch networks disconnect <network> <container-id>` | Removes a container the panel does not manage. |

```bash
loch networks create shop --description "Shop and its queue"
loch networks attach shop --site shop
loch networks attach shop --instance elasticmq-jobs
loch networks show shop
```

## Permissions

| Command | Scope | Admin |
|---|---|---|
| `ls`, `show`, `config`, `docker` | `networks:read` | Yes |
| `create`, `update`, `delete`, `attach`, `detach`, `disconnect` | `networks:write` | Yes |

## Good to know

- Attaching or detaching recreates the member's container: a few seconds of downtime for it only. A site is redeployed (`--no-wait` to not wait).
- An instance keeps at least one network.
- Names: lowercase letters, digits and dashes, starting with a letter, 24 characters max.
- The subnet is optional. It must be a private IPv4 range from /16 to /28, outside the reserved ranges shown by `loch networks config`.
- You can also set the networks at creation: `loch hosting create --network`, `loch services create --network` and `loch functions create --network`. The networks of a function are changed with `loch functions networks`: see [Functions](./functions.md).
