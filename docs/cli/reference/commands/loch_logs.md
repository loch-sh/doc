---
title: "loch logs"
description: "Display container logs"
sidebar_label: "logs"
slug: "loch-logs"
---

## loch logs

Display container logs

### Synopsis

Display container logs (stdout/stderr).
If a filepath is specified, display the content of that file inside the container
using docker exec tail. Requires the 'tail' command to be available in the container.

Examples:
  loch logs php                              # Docker stdout/stderr logs
  loch logs php /var/log/app.log             # Internal file (last 1000 lines)
  loch logs -f php /var/log/app.log          # Follow internal file in real-time
  loch logs -n 50 php /var/log/app.log       # Last 50 lines of internal file

```
loch logs <service> [filepath] [flags]
```

### Options

```
  -f, --follow     Follow logs in real-time
  -h, --help       help for logs
  -n, --tail int   Number of lines to show (0 = all)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch](loch.md)	 - CLI to manage your containers via Host Panel

