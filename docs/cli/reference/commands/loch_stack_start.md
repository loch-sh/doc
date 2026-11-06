---
title: "loch stack start"
description: "Start every container of a stack"
sidebar_label: "stack start"
slug: "loch-stack-start"
---

## loch stack start

Start every container of a stack

### Synopsis

Start every container of a stack.
Without argument, the active namespace is used.
Containers are processed in dependency order (depends_on).

```
loch stack start [stack] [flags]
```

### Options

```
  -h, --help   help for start
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch stack](loch_stack.md)	 - Start, stop or restart a whole Docker Compose stack

