---
sidebar_position: 2
title: Bases de données
description: Créez des bases MySQL, MariaDB, PostgreSQL et MongoDB pour vos sites, avec leur utilisateur, leurs informations de connexion et l'authentification legacy.
---

# Bases de données

Le menu **Bases de données** propose **MySQL**, **MariaDB**, **PostgreSQL** et **MongoDB**. Ce sont des moteurs partagés : chaque version fait tourner une instance utilisée par tous les sites, dans laquelle vous créez une base avec un utilisateur du même nom.

:::note
Réservé aux admins. Nécessite le [module services](./overview.md).
:::

| Moteur | Port | Adresse interne |
|---|---|---|
| MySQL | 3306 | `svc-mysql-8-4:3306` |
| MariaDB | 3306 | `svc-mariadb-11-8:3306` |
| PostgreSQL | 5432 | `svc-postgres-17:5432` |
| MongoDB | 27017 | `svc-mongodb-8-0:27017` |

Versions : [moteurs de services](../reference/services-engines.md).

## Créer une base

1. Ouvrez **Bases de données → PostgreSQL** (ou un autre moteur), puis cliquez sur **Nouvelle base**.
2. Choisissez la **Version** : **Instance démarrée** signale les versions qui tournent déjà, **Recommandée** celle conseillée.
3. Choisissez les **Réseaux** (par défaut : `services`). Si l'instance tourne déjà, la base utilise ses réseaux.
4. Saisissez le **Nom** : lettres minuscules, chiffres et `_`, en commençant par une lettre, 32 caractères au plus (16 sur MySQL 5.6). Il nomme la base et l'utilisateur.
5. Cliquez sur **Créer**, puis copiez le mot de passe dans **Informations de connexion**.

La première base d'une version démarre son instance (jusqu'à deux minutes).

```bash
loch services create shop --engine postgres --version 17
```

## Informations de connexion

| Champ | Exemple |
|---|---|
| **Hôte** et **Port** | `svc-postgres-17`, `5432` |
| **Base** et **Utilisateur** | `shop` |
| **Mot de passe** | Affiché une seule fois |
| **URI de connexion** | L'URI complète, construite par le panel |
| **Adresse externe**, **Empreinte du certificat (SHA-256)** | Seulement quand le port est publié |

L'hôte n'est joignable que depuis les sites présents sur les réseaux de l'instance.

## Authentification legacy

Pour les anciens clients (vieux PHP, vieux outils) qui ne gèrent pas le mécanisme par défaut. Activez **Authentification legacy** à la création ; ce choix ne peut plus être modifié.

| Moteur | Mécanisme utilisé |
|---|---|
| MySQL 8.4 à 8.x | `mysql_native_password` au lieu de `caching_sha2_password` |
| PostgreSQL | `md5` au lieu de `SCRAM-SHA-256` (obsolète depuis PostgreSQL 18) |

```bash
loch services create oldcms --engine mysql --version 8.4 --legacy-auth
```

Le mécanisme est plus faible : ne l'activez que pour les clients qui en ont besoin.

## Bon à savoir

- Supprimer la dernière base d'une version retire aussi son instance, avec ses données.
- Les instances partagées ne sont jamais mises à jour sur place : créez les bases sur une instance d'une version plus récente et déplacez les données.
- MySQL 5.6 n'est proposé que si le serveur l'épingle. Les versions hors support (MySQL 5.6, MongoDB 6.0) et MongoDB, qui ne peut pas exiger TLS, ne peuvent être publiés que sur `127.0.0.1`.
- Opérations communes (nouveau mot de passe, port publié, suppression) : [services managés](./overview.md).
