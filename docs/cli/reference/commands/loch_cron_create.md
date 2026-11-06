---
title: "loch cron create"
description: "Create a scheduled job (interactive, or with flags for a function invocation)"
sidebar_label: "cron create"
slug: "loch-cron-create"
---

## loch cron create

Create a scheduled job (interactive, or with flags for a function invocation)

### Synopsis

Create a scheduled job. Questions are asked for what the flags do not give.
Types: docker_action, docker_exec, http and function_invoke (invokes a function with a fixed JSON
event; needs the functions:invoke scope; the job keeps the status, duration and size of the response,
never the payload; the event is at most 64 KiB). An event holding tokens belongs in a file (--event),
not in --event-json (shell history, process list).

```
loch cron create [flags]
```

### Examples

```
  loch cron create
  loch cron create --name nightly-report --schedule '0 3 * * *' --function report --event-json '{"period": "day"}'
```

### Options

```
      --event string        function_invoke: file holding the JSON event
      --event-json string   function_invoke: the JSON event (default {})
      --function string     Create a function_invoke job for this function
  -h, --help                help for create
      --name string         Job name (asked when not given)
      --schedule string     Cron expression or @every 5m (asked when not given)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch cron](loch_cron.md)	 - Manage scheduled jobs

