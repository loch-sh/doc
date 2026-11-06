---
title: "loch sftp create"
description: "Create an SFTP user"
sidebar_label: "sftp create"
slug: "loch-sftp-create"
---

## loch sftp create

Create an SFTP user

```
loch sftp create <username> [flags]
```

### Options

```
      --bandwidth int          Bandwidth limit in KB/s (0 = unlimited)
  -h, --help                   help for create
      --init-dirs              Initialize the configured directories (e.g. web, logs) in the user's home (default true)
  -m, --must-change-password   Require a password change at next login
  -p, --password string        Password (unsafe: visible in 'ps'; prefer the interactive prompt)
      --quota-files int        Quota in number of files (0 = unlimited)
      --quota-size int         Quota size in bytes (0 = unlimited)
  -s, --site string            Site name (required)
      --ssh-key string         SSH public key
      --subpath string         Restrict the user to a sub-directory of the site (default: whole site)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch sftp](loch_sftp.md)	 - Manage SFTPGo users

