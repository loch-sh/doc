---
sidebar_position: 4
title: Messaging
description: Create RabbitMQ virtual hosts on a shared broker and dedicated NATS instances with JetStream storage.
---

# Messaging

The **Messaging** menu offers **RabbitMQ** (AMQP broker, shared) and **NATS** (publish-subscribe and JetStream streams, dedicated).

:::note
Admin only. Requires the [services module](./overview.md).
:::

## RabbitMQ

Each version runs one broker shared by every site. A resource is a **virtual host** and a user of the same name, isolated from the others and bounded in connections, queues and queue size.

1. Open **Messaging → RabbitMQ**, then click **New virtual host**.
2. Choose the **Version** and the **Networks**, enter the **Name** (lowercase letters, digits and `_`), then click **Create**.
3. Copy the password from **Connection details**: **Host** (`svc-rabbitmq-4-2`), **Port** (5672), **Virtual host**, **User**, **Password**, **Connection URI**.

<Screenshot id="services-rabbitmq" alt="The RabbitMQ page with the 4.2 broker unfolded on its virtual hosts" />

```bash
loch services create shop --engine rabbitmq --version 4.2
```

Deleting a virtual host deletes its queues and messages. Deleting the last one removes the broker, with its data. The management interface of RabbitMQ is not available.

## NATS

Each instance runs in its own container, with one user.

1. Open **Messaging → NATS**, then click **New instance**.
2. Choose the **Version**, the settings, the **Networks** and the **Name** (lowercase letters and digits), then click **Create**.

| Setting | Values | Default |
|---|---|---|
| **Memory** | 128 MB to 1 GB, or **Custom** up to 16 GB. In-memory streams get a quarter | 256 MB |
| **Stream storage** | JetStream disk space: 1 GB to 50 GB, or **Custom** up to 1 TB | 1 GB |
| **Maximum message size** | 1, 8 or 64 MB | 1 MB |

Every setting can be changed later with **Edit**. Keep messages small: large ones cost memory for every client.

```bash
loch services create events --engine nats --version 2.12 --option storage=5120
```

**Connection details**: **Host** (`svc-nats-<name>`), **Port** (4222), **User**, **Password**, **Connection URI**.

## Good to know

- Accounts, subjects and streams are managed by your applications, not by the panel.
- Update (NATS only), resize, published port and deletion: [Managed services](./overview.md).
