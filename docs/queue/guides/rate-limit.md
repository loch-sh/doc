---
sidebar_position: 4
title: Rate limit and client IP
description: How the plugin limits requests without the queue cookie, which IP address it uses, and how to configure Traefik behind a proxy.
---

# Rate limit and client IP

The plugin limits the requests that arrive **without the queue cookie**, per IP address. It protects the queue from clients that create a new visitor at every request.

## How it works

- Every request without the cookie is counted for its IP address, over a sliding window of one minute, even when the service has free slots.
- Above `rateLimitTimes` requests (`5` by default), the request gets a JSON response with the `httpResponseCode` status (`429`):

  ```json
  {"error": "capacity overload", "handler": "Loch.sh Queue Manager"}
  ```

- The plugin checks that the cookie is present, not its value. A browser that keeps the cookie is counted only on its first request.

## Who may be limited

| Client | Why | What to do |
|---|---|---|
| `curl`, uptime monitors, webhooks, bots | They do not keep cookies | Use a cookie jar (`curl -c jar -b jar`), or raise `rateLimitTimes` |
| Many visitors behind one IP (company network, NAT) | Their first requests all come from the same address | Raise `rateLimitTimes` |
| Every visitor, with `useCookies=false` | No cookie is set, so every request is counted | Keep `useCookies=true`, or raise `rateLimitTimes` well above the number of requests per minute of a page |

There is no option to turn the limit off: set `rateLimitTimes` high to make it loose.

```yaml
labels:
  - traefik.http.middlewares.queue.plugin.queuemanager.rateLimitTimes=60
```

## Client IP address

The plugin takes the first header found, in this order:

1. `X-Forwarded-For`, first entry
2. `X-Real-IP`
3. `Fly-Client-IP`
4. `CF-Connecting-IP`
5. The address of the TCP connection

The value is used as is: a client that can set these headers can choose its IP for the rate limit and, with `useCookies=false`, its identity. Behind a proxy or a CDN, accept forwarded headers only from it, with `forwardedHeaders.trustedIPs` on the Traefik entrypoint, and do not enable `forwardedHeaders.insecure`.

```yaml title="traefik.yml"
entryPoints:
  websecure:
    address: ":443"
    forwardedHeaders:
      trustedIPs:
        - "10.0.0.0/8" # your proxy or load balancer
```
