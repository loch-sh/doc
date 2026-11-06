---
title: "loch services"
description: "Manage services: databases, caches and message brokers"
sidebar_label: "services"
slug: "loch-services"
---

## loch services

Manage services: databases, caches and message brokers

### Synopsis

Manage the services module (admin only): MySQL, MariaDB, PostgreSQL, MongoDB, RabbitMQ (shared:
one instance per version, started with its first resource and removed, with its data, with its last
one) and Redis, Valkey, NATS, Loch S3 object storage, ElasticMQ (SQS) and Mosquitto (MQTT) queues (dedicated: one container per resource, deleted with it).

### Options

```
  -h, --help   help for services
```

### Options inherited from parent commands

```
      --debug   Show HTTP requests
```

### SEE ALSO

* [loch](loch.md)	 - CLI to manage your containers via Host Panel
* [loch services create](loch_services_create.md)	 - Create a database, cache or message broker resource (password shown once)
* [loch services delete](loch_services_delete.md)	 - Delete a resource (database, vhost or dedicated instance)
* [loch services engines](loch_services_engines.md)	 - List the engines and versions available on the endpoint
* [loch services expose](loch_services_expose.md)	 - Publish the port of an instance on the host (admin, services:expose scope)
* [loch services instances](loch_services_instances.md)	 - List the instances (shared: one per engine version; dedicated: one per resource)
* [loch services ls](loch_services_ls.md)	 - List the resources (databases, vhosts, dedicated instances)
* [loch services networks](loch_services_networks.md)	 - Replace the networks of an instance (it is recreated)
* [loch services purge](loch_services_purge.md)	 - Delete an instance edited by hand, with its data
* [loch services reset-password](loch_services_reset-password.md)	 - Generate a new password for a resource user (shown once)
* [loch services retire](loch_services_retire.md)	 - Remove an empty instance (containers and data)
* [loch services unexpose](loch_services_unexpose.md)	 - Close the published port of an instance (admin, services:expose scope)
* [loch services update](loch_services_update.md)	 - Change the options of a dedicated instance (Redis, Valkey, NATS, S3, ElasticMQ, Mosquitto)
* [loch services updates](loch_services_updates.md)	 - List the updates available for the dedicated instances
* [loch services upgrade](loch_services_upgrade.md)	 - Update a dedicated instance to the latest image of its version, or to a newer version

