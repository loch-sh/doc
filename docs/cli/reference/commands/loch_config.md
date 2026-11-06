---
title: "loch config"
description: "Configure an endpoint"
sidebar_label: "config"
slug: "loch-config"
---

## loch config

Configure an endpoint

### Synopsis

Configure an API endpoint. Creates it if it doesn't exist.

```
loch config <endpoint> [flags]
```

### Options

```
  -h, --help           help for config
      --name string    Display name
      --token string   API key (unsafe: visible in 'ps'; omit to be prompted securely, or use 'loch login')
      --url string     Endpoint URL
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch](loch.md)	 - CLI to manage your containers via Host Panel
* [loch config ls](loch_config_ls.md)	 - List configured endpoints

