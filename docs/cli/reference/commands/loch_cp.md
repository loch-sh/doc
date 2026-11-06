---
title: "loch cp"
description: "Copy files between local filesystem and a container"
sidebar_label: "cp"
slug: "loch-cp"
---

## loch cp

Copy files between local filesystem and a container

### Synopsis

Copy files between the local filesystem and a container.

Use the service:path syntax to refer to a container path:
  loch cp php:/var/www/html ./html
  loch cp ./file.txt php:/tmp/file.txt

```
loch cp <source> <destination> [flags]
```

### Options

```
  -h, --help   help for cp
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch](loch.md)	 - CLI to manage your containers via Host Panel

