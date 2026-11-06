---
title: "loch hosting delete"
description: "Delete a hosted stack"
sidebar_label: "hosting delete"
slug: "loch-hosting-delete"
---

## loch hosting delete

Delete a hosted stack

### Synopsis

Delete a hosted stack. The site files are kept unless --purge-data is given.

```
loch hosting delete <name> [flags]
```

### Options

```
  -h, --help         help for delete
      --no-wait      Return as soon as the operation is started
      --purge-data   Also delete the site directory and all its files
  -y, --yes          Skip the confirmation prompt
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch hosting](loch_hosting.md)	 - Manage hosted web stacks (admin)

