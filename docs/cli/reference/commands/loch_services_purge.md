---
title: "loch services purge"
description: "Delete an instance edited by hand, with its data"
sidebar_label: "services purge"
slug: "loch-services-purge"
---

## loch services purge

Delete an instance edited by hand, with its data

### Synopsis

Delete an instance whose files were edited by hand (shown as modified), with all its data: every
database or resource it held is lost (the data is archived instead with SERVICES_ARCHIVE_ON_RETIRE).
The edited files are never run: the containers are removed through Docker.

```
loch services purge <instance> [flags]
```

### Examples

```
  loch services purge redis-cache
```

### Options

```
  -h, --help   help for purge
  -y, --yes    Skip the confirmation prompt
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch services](loch_services.md)	 - Manage services: databases, caches and message brokers

