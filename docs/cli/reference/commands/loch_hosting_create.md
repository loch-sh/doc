---
title: "loch hosting create"
description: "Create and deploy a hosted stack"
sidebar_label: "hosting create"
slug: "loch-hosting-create"
---

## loch hosting create

Create and deploy a hosted stack

### Synopsis

Create a hosted stack and deploy it.
Settings that are not given default to the server defaults (see `loch hosting templates`).

```
loch hosting create <name> [flags]
```

### Examples

```
  loch hosting create blog --template php-nginx --php 8.4 --domain blog.example.com --https --redirect-https
  loch hosting create docs --template nginx --docroot public --domain docs.example.com
  loch hosting create shop --network services --network shop-backend
```

### Options

```
      --asset-dir stringArray                     Symfony routing: directory served without front controller fallback (repeatable, replaces the list)
      --cpus float                                CPU limit of the web container, e.g. 0.5 or 1 (0 = unlimited)
      --disable-module loch hosting php-modules   Disable a PHP module (repeatable, see loch hosting php-modules)
      --display-errors                            PHP display_errors
      --docroot string                            Document root, relative to the site directory
  -d, --domain stringArray                        Domain served by the stack (repeatable)
      --enable-module stringArray                 Re-enable a disabled PHP module, e.g. ioncube (repeatable)
  -e, --env stringArray                           Environment variable KEY=VALUE (repeatable)
  -h, --help                                      help for create
      --https                                     Serve the domains over HTTPS
      --max-execution-time int                    PHP max_execution_time of web requests in seconds (the PHP CLI is never time-limited)
      --memory int                                Memory limit of the web container in MB (0 = unlimited)
      --memory-limit string                       PHP memory_limit of the CLI (crons, console), also the default for web requests (e.g. 256M)
      --network loch networks ls                  Network the site joins (repeatable; see loch networks ls). Default: the server default, "services" when the services module is enabled
      --no-network                                Join no network (not even the default one)
      --no-wait                                   Return as soon as the operation is started
      --php loch hosting templates                PHP version (see loch hosting templates)
      --php-ini-file string                       File holding extra php.ini directives (empty file clears them)
      --post-max string                           PHP post_max_size (e.g. 64M)
      --redirect-https                            Redirect HTTP to HTTPS (requires --https)
      --routing string                            Routing: default, symfony or laravel (PHP templates; use the framework's public directory as --docroot), or custom (see --routing-file)
      --routing-file string                       File holding custom routing rules (implies --routing custom)
  -s, --site string                               Site directory (default: the stack name)
  -t, --template string                           Template: php-nginx, php-apache, nginx, apache (default "php-nginx")
      --timezone string                           PHP date.timezone (e.g. Europe/Paris)
      --upload-max string                         PHP upload_max_filesize (e.g. 64M)
      --vhost-file string                         File holding extra vhost directives (empty file clears them)
      --web-memory-limit string                   PHP memory_limit of web requests only (empty = same as --memory-limit)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch hosting](loch_hosting.md)	 - Manage hosted web stacks (admin)

