---
sidebar_position: 5
title: Queues
description: Create ElasticMQ queues compatible with Amazon SQS on a private network, and Eclipse Mosquitto MQTT brokers.
---

# Queues

The **Queues** menu offers **ElasticMQ** (compatible with the Amazon SQS API) and **Eclipse Mosquitto** (MQTT broker). Each instance runs in its own container.

:::note
Admin only. Requires the [services module](./overview.md).
:::

## ElasticMQ

Applications written for Amazon SQS send and receive messages without an AWS account.

:::warning
ElasticMQ has **no authentication**: every site on the same network can use, purge or delete its queues. Do not store sensitive data in it.
:::

1. Create a [private network](../network/private-networks.md) for the sites allowed to use the queues. The shared `services` network is refused.
2. Open **Queues → ElasticMQ**, then click **New instance**.
3. Choose the **Version**, **SQS limits**, the private **Networks** and the **Name**, then click **Create**.

| Setting | Values | Default |
|---|---|---|
| **Memory** | 128 MB to 1 GB, or **Custom** up to 8 GB | 256 MB |
| **SQS limits** | **Strict**: same limits as Amazon SQS, what works here works on AWS. **Relaxed**: larger messages and longer delays (development, migrations) | **Strict** |

<Screenshot id="services-create-elasticmq" alt="The New ElasticMQ instance page with the no-authentication warnings and the SQS limits" />

```bash
loch services create jobs --engine elasticmq --version 1.7 --network shop
```

**Connection details** give the **Endpoint** (`http://svc-elasticmq-<name>:9324`), the **Region** (`us-east-1`) and the **Queue URL prefix**. Any credentials are accepted, but the SDKs need some (for example `x`). There is no **New password**, and the port can only be published on `127.0.0.1`.

## Eclipse Mosquitto

An MQTT broker for connected devices, sensors and dashboards. One MQTT user, no anonymous access.

1. Open **Queues → Eclipse Mosquitto**, then click **New instance**.
2. Choose the **Version**, the settings, the **Networks** and the **Name**, then click **Create**.

| Setting | Values | Default |
|---|---|---|
| **Memory** | 64 to 512 MB, or **Custom** up to 4 GB | 128 MB |
| **Persistence** | **Kept on disk**: retained messages and persistent sessions survive a restart. **Memory only** | **Kept on disk** |
| **Maximum message size** | 1, 10 or 100 MB | 1 MB |
| **Queued messages per client** | Kept for a disconnected or slow client (QoS 1 and 2): 1,000, 10,000 or 100,000 | 1,000 |

```bash
loch services create sensors --engine mosquitto --version 2.0
```

**Connection details**: **Host** (`svc-mosquitto-<name>`), **Port** (1883), **User**, **Password** and **Connection URI** (`mqtt://<user>:<password>@svc-mosquitto-<name>:1883`). Topics are not managed by the panel.

## Good to know

- Every setting of both engines can be changed later with **Edit**.
- Update, resize, published port and deletion: [Managed services](./overview.md).
