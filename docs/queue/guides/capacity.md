---
sidebar_position: 1
title: Capacity and timeouts
description: Choose how many visitors use the service at once, when an idle visitor loses their slot and how fast the queue moves.
---

# Capacity and timeouts

The plugin counts **visitors**, not requests: a browser that keeps the cookie counts once, whatever the number of requests it sends.

## Options

| Option | Default | Role |
|---|---|---|
| `maxEntries` | `100` | Number of visitors allowed in at the same time |
| `inactivityTimeoutSeconds` | `60` | An active visitor who sends no request for this long loses their slot |
| `hardSessionLimitSeconds` | `0` (off) | Maximum time in the service, even for a busy visitor |
| `cleanupIntervalSeconds` | `30` | How often the plugin frees slots and lets in the head of the queue |
| `refreshIntervalSeconds` | `20` | How often the waiting page reloads |
| `cookieMaxAgeSeconds` | `3600` | Lifetime of the cookie in the browser |

Example: 300 visitors, 5 minutes of inactivity, 1 hour at most.

```yaml
labels:
  - traefik.http.middlewares.queue.plugin.queuemanager.maxEntries=300
  - traefik.http.middlewares.queue.plugin.queuemanager.inactivityTimeoutSeconds=300
  - traefik.http.middlewares.queue.plugin.queuemanager.hardSessionLimitSeconds=3600
```

## Choose the values

- **`maxEntries`**: start below what the service handles under load, then raise it.
- **`inactivityTimeoutSeconds`**: every request through the router keeps the slot. Too short, a visitor reading a long page goes back to the queue. Too long, idle visitors hold slots.
- **`hardSessionLimitSeconds`**: counts from entry, or from the exit of the queue. When it is reached, the visitor goes back to the queue unless a slot is free.
- **`cleanupIntervalSeconds`**: the queue mostly moves at each cleanup. A wait can last this long after a slot frees up.
- **`refreshIntervalSeconds`**: keep it well below `inactivityTimeoutSeconds`. A visitor let in must send a request before the inactivity timeout, otherwise they lose the slot before seeing it.
- **`cookieMaxAgeSeconds`**: the cookie is not renewed. When it expires, the visitor becomes a new one, at the end of the queue. Make it longer than a wait plus a session.

The wait time shown to visitors is an approximation computed from the position, not a measurement. Its floor is `minWaitTimeMinutes` (`1`).

## Turn the queue off

Set `enabled=false` to let every request through without removing the middleware. The rate limit is off too.

Full list: [Configuration reference](../reference/configuration.md).
