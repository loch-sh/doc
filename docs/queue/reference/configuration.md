---
sidebar_position: 1
title: Configuration reference
description: Every option of the Loch Queue Manager middleware, with its type, default value and validation rule.
---

# Configuration reference

Options go under the plugin name `queuemanager` in the middleware configuration:

- Docker labels: `traefik.http.middlewares.<name>.plugin.queuemanager.<option>=<value>`
- File provider: `http.middlewares.<name>.plugin.queuemanager.<option>`

Values are checked when Traefik creates the middleware. A value that fails a check stops the middleware with `invalid QueueManager configuration: <reason>`.

## Queue

| Option | Type | Default | Check | Description |
|---|---|---|---|---|
| `enabled` | bool | `true` | | `false` lets every request through, without queue or rate limit |
| `maxEntries` | int | `100` | > 0 | Number of visitors allowed in at the same time |
| `inactivityTimeoutSeconds` | int | `60` | > 0 | An active visitor without a request for this long loses the slot |
| `hardSessionLimitSeconds` | int | `0` | ≥ 0 | Maximum time in the service, counted from entry or from the exit of the queue. `0` turns it off |
| `cleanupIntervalSeconds` | int | `30` | > 0 | Interval between two cleanups: removal of expired visitors, entry of the head of the queue |

The queue is always first in, first out. The `queueStrategy` option exists, with `fifo` as its only value.

## Waiting page

| Option | Type | Default | Check | Description |
|---|---|---|---|---|
| `queuePageFile` | string | `/var/public/queue-page.html` | not empty | HTML template of the waiting page. Missing or invalid: built-in English page |
| `queueTranslationsFile` | string | `/var/public/translations.json` | | Texts of the page per language. Missing: empty texts |
| `refreshIntervalSeconds` | int | `20` | > 0 | Reload interval of the waiting page, in seconds |
| `minWaitTimeMinutes` | int | `1` | | Floor of the wait time shown, in minutes |
| `httpResponseCode` | int | `429` | | Status of the waiting page, the JSON response and the rate limit response |
| `httpContentType` | string | `text/html; charset=utf-8` | | `Content-Type` of the waiting page |

## Visitor identification

| Option | Type | Default | Check | Description |
|---|---|---|---|---|
| `useCookies` | bool | `true` | | `true`: random cookie. `false`: SHA-256 hash of the client IP and User-Agent |
| `cookieName` | string | `loch-queue-id` | | Name of the cookie, also checked by the rate limit |
| `cookieMaxAgeSeconds` | int | `3600` | | Lifetime of the cookie, not renewed |
| `rateLimitTimes` | int | `5` | | Requests without the cookie allowed per IP and per minute. `0` refuses every request without the cookie |

The cookie holds 16 random bytes in hexadecimal, with `Path=/`, `HttpOnly`, `SameSite=Lax`, and `Secure` when the TLS connection ends at Traefik.

## Logs

| Option | Type | Default | Check | Description |
|---|---|---|---|---|
| `logLevel` | string | `info` | | `debug`, `info`, `warn` or `error` |
| `debug` | bool | `false` | | Forces the `debug` level and fills `DebugInfo` on the waiting page and in the JSON response |
| `logFile` | string | empty | | File to append the logs to. Empty: Traefik standard error. If the file cannot be opened, standard error is used |

## Full example

```yaml title="dynamic.yml"
http:
  middlewares:
    queue:
      plugin:
        queuemanager:
          enabled: true
          maxEntries: 300
          inactivityTimeoutSeconds: 300
          hardSessionLimitSeconds: 3600
          cleanupIntervalSeconds: 30
          refreshIntervalSeconds: 20
          minWaitTimeMinutes: 1
          queuePageFile: /var/public/queue-page.html
          queueTranslationsFile: /var/public/translations.json
          httpResponseCode: 429
          useCookies: true
          cookieName: loch-queue-id
          cookieMaxAgeSeconds: 7200
          rateLimitTimes: 5
          logLevel: warn
```
