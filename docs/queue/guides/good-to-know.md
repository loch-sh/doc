---
sidebar_position: 5
title: Limits and troubleshooting
description: What to know before production (in-memory state, abandoned places, reloads) and how to fix the common problems.
---

# Limits and troubleshooting

## Limits

- **State in memory.** The queue lives in the memory of each middleware instance. Several Traefik replicas do not share it, and a restart empties it. A dynamic configuration change may also recreate the middleware with an empty queue: change the configuration outside peak hours.
- **Abandoned places.** A visitor who closes the waiting page keeps their place in the queue. When their turn comes, the slot stays reserved until `inactivityTimeoutSeconds` runs out. The queue moves slower than its size suggests when many visitors give up.
- **Approximate wait time.** The wait shown is computed from the position, not measured from real departures.
- **Cookie without `Secure` behind a TLS proxy.** The cookie gets the `Secure` flag only when the TLS connection ends at Traefik.
- **Reload URL.** The default page reloads with `<meta http-equiv="refresh" content="…;url=./">` and a script that reloads the current path without its query string. On a deep path such as `/shop/item`, the meta refresh goes to `/shop/`. Edit the template if visitors must come back to the exact URL.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Traefik refuses the middleware: `invalid QueueManager configuration` | A value fails the [checks](../reference/configuration.md) | Fix the value given in the message |
| The built-in English page shows instead of yours | Template not found or invalid | Check `queuePageFile` and the volume; the log says `Could not load queue page template` |
| Empty texts on the waiting page | Language missing from the translations file, or file not found | Add the language, check `queueTranslationsFile` |
| Changes to the template or translations do not show | Files are read at startup | Restart Traefik |
| JSON `{"error":"capacity overload"}` without `detail` | [Rate limit](./rate-limit.md) on requests without the cookie | Keep cookies, or raise `rateLimitTimes` |
| Visitors go back to the queue while browsing | `inactivityTimeoutSeconds` too short, or cookie expired | Raise `inactivityTimeoutSeconds` or `cookieMaxAgeSeconds` |

## Logs

The plugin writes to the Traefik standard error, or to `logFile`, with the prefix `[Loch-Queue]`. Set `debug=true` to see each decision (client, position, promotions) while troubleshooting, and turn it off afterwards: it is verbose.
