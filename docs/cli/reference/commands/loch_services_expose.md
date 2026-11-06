---
title: "loch services expose"
description: "Publish the port of an instance on the host (admin, services:expose scope)"
sidebar_label: "services expose"
slug: "loch-services-expose"
---

## loch services expose

Publish the port of an instance on the host (admin, services:expose scope)

### Synopsis

Publish the port of an instance on an address of the host, so that clients outside the panel reach it
(e.g. 127.0.0.1:5417 for an SSH tunnel, [::1]:5417 in IPv6). The address must be allowed by the API
configuration and the port free (see the policy at the end of loch services engines). Replaces the
current published port. The instance is recreated: its clients are disconnected for a few seconds.
Outside the loopback, TLS is required from every client of the instance (internal sites included)
unless TLS is off on the endpoint; --tls-optional offers it without requiring it (PostgreSQL,
MySQL 8.4 and MariaDB, when the endpoint allows it). Instances out of support and engines without
authentication or TLS can only be published on the loopback.

```
loch services expose <instance> <address>:<port> [flags]
```

### Examples

```
  loch services expose postgres-17 127.0.0.1:5417
  loch services expose mariadb-11-4 10.0.0.5:3307 --tls-optional
  loch services expose redis-cache [::1]:6380
```

### Options

```
  -h, --help           help for expose
      --tls-optional   Offer TLS without requiring it (PostgreSQL, MySQL 8.4, MariaDB; only when the endpoint allows it)
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch services](loch_services.md)	 - Manage services: databases, caches and message brokers

