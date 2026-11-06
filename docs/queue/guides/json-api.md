---
sidebar_position: 3
title: JSON clients and single-page apps
description: Get the queue status as JSON instead of the HTML waiting page, from a single-page application or an API client.
---

# JSON clients and single-page apps

A request with the header `Accept: application/json` gets the queue status as JSON instead of the waiting page. The value must be exactly `application/json`: a list such as `application/json, text/plain` gets the HTML page.

```json
{
  "error": "capacity overload",
  "handler": "Loch.sh Queue Manager",
  "detail": {
    "position": 12,
    "queueSize": 40,
    "estimatedWaitTime": 5,
    "refreshInterval": 20,
    "progressPercentage": 70,
    "debugInfo": ""
  }
}
```

The status is `httpResponseCode` (`429` by default) and the response has the header `X-Loch-sh: Loch Queue`. When the visitor gets in, the request reaches the service as usual.

## Handle the queue in the client

1. Send the requests with the cookies: the plugin identifies the visitor by its cookie (`loch-queue-id`). The cookie is `HttpOnly`: the browser sends it, scripts cannot read it.
2. On a response with the `X-Loch-sh` header, show the position and wait time from `detail`.
3. Retry after `detail.refreshInterval` seconds.

```js
async function callApi(url) {
  const res = await fetch(url, {
    headers: {Accept: 'application/json'},
    credentials: 'same-origin', // send the queue cookie
  });
  if (res.headers.get('X-Loch-sh')) {
    const body = await res.json();
    if (body.detail) {
      showQueue(body.detail.position, body.detail.estimatedWaitTime);
      await new Promise((r) => setTimeout(r, body.detail.refreshInterval * 1000));
    } else {
      await new Promise((r) => setTimeout(r, 60_000)); // rate limited
    }
    return callApi(url);
  }
  return res;
}
```

## Good to know

- A client that does not keep the cookie becomes a new visitor at each request, at the end of the queue, and hits the [rate limit](./rate-limit.md) after a few requests.
- A response without `detail` comes from the rate limit, not from the queue.
- `debugInfo` is empty unless the `debug` option is on.

Field details: [JSON response reference](../reference/json-response.md).
