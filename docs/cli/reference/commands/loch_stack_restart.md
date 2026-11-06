---
title: "loch stack restart"
description: "Restart every container of a stack"
sidebar_label: "stack restart"
slug: "loch-stack-restart"
---

## loch stack restart

Restart every container of a stack

### Synopsis

Restart every container of a stack.
Without argument, the active namespace is used.
Containers are processed in dependency order (depends_on).

```
loch stack restart [stack] [flags]
```

### Options

```
  -h, --help   help for restart
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch stack](loch_stack.md)	 - Start, stop or restart a whole Docker Compose stack

