---
title: "loch stack stop"
description: "Stop every container of a stack"
sidebar_label: "stack stop"
slug: "loch-stack-stop"
---

## loch stack stop

Stop every container of a stack

### Synopsis

Stop every container of a stack.
Without argument, the active namespace is used.
Containers are processed in dependency order (depends_on).

```
loch stack stop [stack] [flags]
```

### Options

```
  -h, --help   help for stop
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch stack](loch_stack.md)	 - Start, stop or restart a whole Docker Compose stack

