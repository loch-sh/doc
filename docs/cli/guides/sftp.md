---
sidebar_position: 6
title: SFTP users
description: Create, enable, disable and delete the SFTP accounts of hosted sites, and reset their passwords.
---

# SFTP users

`loch sftp` manages the SFTP accounts that give access to the files of a site. Admin only; the SFTP module must be enabled on the server. Panel side: [SFTP](/panel/hosting/sftp/).

## Commands

| Command | Does |
|---|---|
| `loch sftp sites` | Lists the sites. |
| `loch sftp users` | Lists the users (`--site` to filter). |
| `loch sftp create <username> --site <site>` | Creates a user in a site. Asks for the password. |
| `loch sftp reset-password <username>` | Sets a new password. |
| `loch sftp enable <username>` | Enables a user. |
| `loch sftp disable <username>` | Disables a user: it can no longer log in. |
| `loch sftp delete <username>` | Deletes the account. |

```bash
loch sftp create alice --site blog --subpath web/uploads
loch sftp users --site blog
loch sftp reset-password alice
loch sftp delete alice
```

## Permissions

| Command | Scope | Admin |
|---|---|---|
| `sites`, `users` | `sftp:read` | Yes |
| `create`, `reset-password`, `enable`, `disable`, `delete` | `sftp:write` | Yes |

## Good to know

- `--subpath` confines the user to a sub-directory of the site. It cannot change later.
- `create` also accepts an SSH key (`--ssh-key`), quotas and a bandwidth limit.
- `--password` is visible in the process list: prefer the prompt.
- Deleting a user keeps the files of its home directory.
