---
sidebar_position: 3
title: JSON response reference
description: Fields and headers of the JSON responses sent to queued and rate-limited clients.
---

# JSON response reference

Guide: [JSON clients and single-page apps](../guides/json-api.md).

## Queued client

Sent when the request has `Accept: application/json` (exact value) and the visitor is in the queue.

| Field | Type | Content |
|---|---|---|
| `error` | string | Always `capacity overload` |
| `handler` | string | Always `Loch.sh Queue Manager` |
| `detail.position` | int | Position in the queue, from 1 |
| `detail.queueSize` | int | Number of visitors in the queue |
| `detail.estimatedWaitTime` | int | Approximate wait, in minutes |
| `detail.refreshInterval` | int | Seconds to wait before retrying (`refreshIntervalSeconds`) |
| `detail.progressPercentage` | int | Progress, from 0 to 100 |
| `detail.debugInfo` | string | Internal state; empty unless `debug=true` |

## Rate-limited client

Sent to a request without the cookie above `rateLimitTimes` per minute, whatever its `Accept` header. Same `error` and `handler`, no `detail`.

```json
{"error": "capacity overload", "handler": "Loch.sh Queue Manager"}
```

## Status and headers

| Item | Value |
|---|---|
| Status | `httpResponseCode` (`429` by default) |
| `Content-Type` | `application/json` |
| `X-Loch-sh` | `Loch Queue` |
| `Set-Cookie` | The queue cookie, on the first request of a visitor (with `useCookies=true`) |
