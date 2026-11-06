---
title: "loch hosting update"
description: "Change the settings of a hosted stack and redeploy it"
sidebar_label: "hosting update"
slug: "loch-hosting-update"
---

## loch hosting update

Change the settings of a hosted stack and redeploy it

### Synopsis

Change the settings of a hosted stack and redeploy it.
Only the given flags are changed; the other settings are kept.
If the redeployment fails, the previous configuration is restored.

```
loch hosting update <name> [flags]
```

### Examples

```
  loch hosting update blog --domain www.blog.example.com --remove-domain old.example.com
  loch hosting update blog --php 8.5 --memory-limit 512M --env APP_ENV=prod --unset-env DEBUG
  loch hosting update blog --network services --network blog-queue
```

### Options

```
      --asset-dir stringArray                     Symfony routing: directory served without front controller fallback (repeatable, replaces the list)
      --cpus float                                CPU limit of the web container, e.g. 0.5 or 1 (0 = unlimited)
      --disable-module loch hosting php-modules   Disable a PHP module (repeatable, see loch hosting php-modules)
      --display-errors                            PHP display_errors
      --docroot string                            Document root, relative to the site directory
  -d, --domain stringArray                        Add a domain (repeatable)
      --enable-module stringArray                 Re-enable a disabled PHP module, e.g. ioncube (repeatable)
  -e, --env stringArray                           Set an environment variable KEY=VALUE (repeatable)
      --force                                     Overwrite changes made to the compose file outside the panel
  -h, --help                                      help for update
      --https                                     Serve the domains over HTTPS
      --max-execution-time int                    PHP max_execution_time of web requests in seconds (the PHP CLI is never time-limited)
      --memory int                                Memory limit of the web container in MB (0 = unlimited)
      --memory-limit string                       PHP memory_limit of the CLI (crons, console), also the default for web requests (e.g. 256M)
      --network loch networks ls                  Network the site joins (repeatable, replaces the list; see loch networks ls)
      --no-network                                Leave every network
      --no-wait                                   Return as soon as the operation is started
      --php loch hosting templates                PHP version (see loch hosting templates)
      --php-ini-file string                       File holding extra php.ini directives (empty file clears them)
      --post-max string                           PHP post_max_size (e.g. 64M)
      --redirect-https                            Redirect HTTP to HTTPS (requires --https)
      --remove-domain stringArray                 Remove a domain (repeatable)
      --routing string                            Routing: default, symfony or laravel (PHP templates; use the framework's public directory as --docroot), or custom (see --routing-file)
      --routing-file string                       File holding custom routing rules (implies --routing custom)
  -t, --template string                           Template: php-nginx, php-apache, nginx, apache
      --timezone string                           PHP date.timezone (e.g. Europe/Paris)
      --unset-env stringArray                     Remove an environment variable by name (repeatable)
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

