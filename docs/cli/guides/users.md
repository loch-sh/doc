---
sidebar_position: 9
title: Users
description: List users, grant or revoke access to containers, promote or demote admins and delete users.
---

# Users

`loch users` manages the panel users. Admin only. A restricted user only sees and manages the containers it was granted.

## Commands

| Command | Does |
|---|---|
| `loch users ls` | Lists the users. |
| `loch users grant <email> <container...>` | Gives access to one or more containers. |
| `loch users revoke <email> <container...>` | Removes access to one or more containers. |
| `loch users promote <email>` | Makes the user an admin. |
| `loch users demote <email>` | Makes the user restricted. |
| `loch users rm <email>` | Deletes the user. |

```bash
loch users grant alice@example.com myapp-web-1 myapp-php-1
loch users revoke alice@example.com myapp-php-1
loch users promote bob@example.com
```

## Permissions

| Command | Scope | Admin |
|---|---|---|
| `users …` | None: only the profile of the key's user is checked | Yes |
| `domains` | None: only the profile of the key's user is checked | Yes |

## Good to know

- `loch domains` lists the Traefik domains and their routing.
- A key carries the profile of its user: an admin scope on a restricted user's key grants nothing.
- A key can only create keys within its own scopes.
- Function containers (`fn-*`) cannot be granted to a user.
