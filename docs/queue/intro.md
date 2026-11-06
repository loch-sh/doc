---
sidebar_position: 1
slug: /
title: Loch Queue Manager
description: A Traefik middleware plugin that caps the number of concurrent visitors of a service and puts the others in a first-come, first-served waiting room.
---

# Loch Queue Manager

Loch Queue Manager is a Traefik v3 middleware plugin (tested with Traefik v3.6). It lets a set number of visitors use a service at the same time and shows the others a waiting page until a slot frees up.

![The waiting page: position 12 of 40, about 5 minutes to wait](/img/screenshots/queue/next/en/queue-page.png)

## How it works

1. Each visitor gets an identifier: a cookie (`loch-queue-id` by default) or a hash of the IP address and User-Agent.
2. While fewer than `maxEntries` visitors are active, a new visitor goes straight through and becomes active.
3. When the service is full, the visitor joins a FIFO queue and gets the waiting page with HTTP `429`. The page reloads itself every 20 seconds.
4. Every 30 seconds, the plugin drops active visitors idle for more than 60 seconds and lets in the head of the queue.

All values are configurable: [Configuration reference](./reference/configuration.md).

## Features

- Cap on concurrent visitors, with an inactivity timeout and an optional hard session limit.
- Waiting page built from your own HTML template, with position, queue size, approximate wait time and a progress bar.
- Page texts in English, French, Spanish, German, Portuguese and Italian, chosen from the browser's `Accept-Language`.
- JSON response instead of HTML for clients that send `Accept: application/json`.
- Per-IP rate limit for requests without the queue cookie.

## Next steps

1. [Install the plugin](./install.md) and attach the middleware to a router.
2. [Size the capacity and timeouts](./guides/capacity.md).
3. [Customize the waiting page](./guides/waiting-page.md).
4. Read the [limits](./guides/good-to-know.md) before going to production.

## About and license

Loch Queue Manager is published under the Apache License 2.0. Source code: [github.com/loch-sh/traefik-queue](https://github.com/loch-sh/traefik-queue).

From the `NOTICE` file:

> Loch Queue Manager
> Copyright 2025 Loch.sh
>
> This product is a derivative work of Traefik Queue Manager
> (https://github.com/hhftechnology/traefik-queue-manager),
> developed by HHF Technology and licensed under the Apache License, Version 2.0.
>
> The original source files have been modified by Loch.sh. Changes include,
> among others: renaming of the Go package and module, split of the code into
> multiple files, JSON API responses and rate limiting.
