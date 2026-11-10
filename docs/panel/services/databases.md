---
sidebar_position: 2
title: Databases
description: Create MySQL, MariaDB, PostgreSQL and MongoDB databases for your websites, with their user, connection details and legacy authentication.
---

# Databases

The **Databases** menu offers **MySQL**, **MariaDB**, **PostgreSQL** and **MongoDB**. They are shared engines: each version runs one instance used by every site, and you create a database with a user of the same name in it.

:::note
Admin only. Requires the [services module](./overview.md).
:::

| Engine | Port | Internal address |
|---|---|---|
| MySQL | 3306 | `svc-mysql-8-4:3306` |
| MariaDB | 3306 | `svc-mariadb-11-8:3306` |
| PostgreSQL | 5432 | `svc-postgres-17:5432` |
| MongoDB | 27017 | `svc-mongodb-8-0:27017` |

Versions: [Services engines](../reference/services-engines.md).

## Create a database

1. Open **Databases → PostgreSQL** (or another engine), then click **New database**.
2. Choose the **Version**: **Instance running** marks the versions that already run, **Recommended** the advised one.
3. Choose the **Networks** (default: `services`). If the instance already runs, the database uses its networks.
4. Enter the **Name**: lowercase letters, digits and `_`, starting with a letter, 32 characters max (16 on MySQL 5.6). It names both the database and the user.
5. Click **Create**, then copy the password from **Connection details**.

The first database of a version starts its instance (up to two minutes).

```bash
loch services create shop --engine postgres --version 17
```

## Connection details

| Field | Example |
|---|---|
| **Host** and **Port** | `svc-postgres-17`, `5432` |
| **Database** and **User** | `shop` |
| **Password** | Shown once |
| **Connection URI** | The full URI, built by the panel |
| **External address**, **Certificate fingerprint (SHA-256)** | Only when the port is published |

<Screenshot id="services-credentials" alt="The Connection details window with the one-time password warning" />

The host is reachable only from the sites on the instance's networks.

## Legacy authentication

For old clients (old PHP, old tools) that cannot use the default mechanism. Turn on **Legacy authentication** at creation; it cannot be changed later.

| Engine | Mechanism used |
|---|---|
| MySQL 8.4 to 8.x | `mysql_native_password` instead of `caching_sha2_password` |
| PostgreSQL | `md5` instead of `SCRAM-SHA-256` (deprecated since PostgreSQL 18) |

```bash
loch services create oldcms --engine mysql --version 8.4 --legacy-auth
```

The mechanism is weaker: enable it only for the clients that need it.

## Good to know

- Deleting the last database of a version also removes its instance, with its data.
- Shared instances are never updated in place: create the databases on an instance of a newer version and move the data.
- MySQL 5.6 is offered only when the server pins it. Out-of-support versions (MySQL 5.6, MongoDB 6.0) and MongoDB, which cannot require TLS, can only be published on `127.0.0.1`.
- Common operations (new password, published port, deletion): [Managed services](./overview.md).
