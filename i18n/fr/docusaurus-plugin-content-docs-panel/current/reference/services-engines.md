---
sidebar_position: 4
title: Moteurs de services
description: Tous les moteurs du module services managés, avec leurs versions, leur topologie, leur port, leurs images et leurs options avec les valeurs autorisées.
---

# Moteurs de services

Catalogue complet du module [services managés](../admin/services.md). Lancez `loch services engines` pour voir ce que votre serveur propose en ce moment.

## Moteurs

| Moteur | ID | Menu | Topologie | Port | Versions intégrées | Plus ancienne prise en charge |
|---|---|---|---|---|---|---|
| PostgreSQL | `postgres` | Bases de données | partagée | 5432 | 18, 17, 16, 15 | 15 |
| MariaDB | `mariadb` | Bases de données | partagée | 3306 | 11.8, 11.4, 10.11 | 10.11 |
| MySQL | `mysql` | Bases de données | partagée | 3306 | 8.4 | 5.6 (proposée seulement si épinglée) |
| MongoDB | `mongodb` | Bases de données | partagée | 27017 | 8.0, 7.0, 6.0 | 6.0 |
| RabbitMQ | `rabbitmq` | Messagerie | partagée | 5672 | 4.2, 4.1, 4.0 | 4.0 |
| Redis | `redis` | Cache | dédiée | 6379 | 8.4, 8.2, 7.4 | 7.2 |
| Valkey | `valkey` | Cache | dédiée | 6379 | 9.0, 8.1, 7.2 | 7.2 |
| NATS | `nats` | Messagerie | dédiée | 4222 | 2.12, 2.11, 2.10 | 2.10 |
| ElasticMQ (compatible SQS) | `elasticmq` | Files d'attente | dédiée | 9324 | 1.7 | 1.7 |
| Eclipse Mosquitto (MQTT) | `mosquitto` | Files d'attente | dédiée | 1883 | 2.0 | 2.0 |
| Loch S3 (compatible S3) | `s3` | Stockage | dédiée | 8080 | 1.4 | 1.4 |

- **Partagée** : une instance par version ; une ressource est une base et son utilisateur (un hôte virtuel et son utilisateur pour RabbitMQ).
- **Dédiée** : un conteneur par ressource, nommé et dimensionné à la création.
- Les **versions intégrées** servent jusqu'à la première découverte de versions réussie. Ensuite, la création propose la dernière version supportée de chacune des 3 dernières versions majeures, plus les versions épinglées avec `SERVICES_<ENGINE>_PINNED_VERSIONS`.
- Les instances existantes restent gérées quelle que soit leur version, à partir de la plus ancienne prise en charge.

## Images et sources des versions

| Moteur | Tags listés sur | Téléchargée depuis | Dates de support |
|---|---|---|---|
| PostgreSQL | `docker.io/library/postgres` (`17`) | `mirror.gcr.io` | endoflife.date |
| MariaDB | `docker.io/library/mariadb` (`11.4`) | `mirror.gcr.io` | endoflife.date |
| MySQL | `docker.io/library/mysql` (`8.4`) | `mirror.gcr.io` | endoflife.date |
| MongoDB | `docker.io/library/mongo` (`8.0`) | `mirror.gcr.io` | endoflife.date |
| RabbitMQ | `docker.io/library/rabbitmq` (`4.2`) | `mirror.gcr.io` | endoflife.date |
| Redis | `docker.io/library/redis` (`8.4-alpine`) | `mirror.gcr.io` | endoflife.date |
| Valkey | `docker.io/valkey/valkey` (`9.0-alpine`) | `mirror.gcr.io` | endoflife.date |
| NATS | `docker.io/library/nats` (`2.12-alpine`) | `mirror.gcr.io` | aucune : publiée signifie supportée |
| ElasticMQ | `docker.io/softwaremill/elasticmq-native` (`1.7.1`) | `mirror.gcr.io` | aucune |
| Mosquitto | `docker.io/library/eclipse-mosquitto` (`2.0.22`) | `mirror.gcr.io` | aucune |
| Loch S3 | `ghcr.io/loch-sh/s3` (`1.4.0`) | `ghcr.io` | aucune |

ElasticMQ, Mosquitto et Loch S3 utilisent des tags de correctif exacts : une version exécute son tag de correctif le plus élevé.

## Options des moteurs dédiés

Passez-les avec `--option clé=valeur` dans la CLI. « Modifiable » signifie modifiable ensuite (bouton **Modifier**, `loch services update`) ; les autres sont fixées à la création.

| Moteur | Option | Valeurs autorisées | Défaut | Modifiable |
|---|---|---|---|---|
| Redis, Valkey | `memory` (Mo du conteneur ; les données en ont la moitié) | 128, 256, 512, 1024, 2048, 4096 | 256 | oui |
| | `policy` (quand la mémoire est pleine) | `noeviction`, `allkeys-lru`, `allkeys-lfu`, `volatile-lru`, `volatile-lfu`, `volatile-ttl` | `noeviction` | oui |
| | `persistence` | `aof`, `rdb`, `none` | `aof` | non |
| | `scripting` (Lua) | `on`, `off` | `on` | oui |
| Redis seul | `modules` (JSON, recherche, séries temporelles… ; Redis 8 et suivants) | `off`, `on` | `off` | oui |
| NATS | `memory` (Mo du conteneur ; les flux en mémoire en ont un quart) | 128, 256, 512, 1024 | 256 | oui |
| | `storage` (disque JetStream, Mo) | 1024, 5120, 10240, 51200 | 1024 | oui |
| | `payload` (plus gros message, Mo) | 1, 8, 64 | 1 | oui |
| ElasticMQ | `memory` (Mo du conteneur) | 128, 256, 512, 1024 | 256 | oui |
| | `limits` (`strict` : limites d'Amazon SQS ; `relaxed` : messages plus gros, délais plus longs) | `strict`, `relaxed` | `strict` | oui |
| Mosquitto | `memory` (Mo du conteneur) | 64, 128, 256, 512 | 128 | oui |
| | `persistence` (messages retenus, sessions persistantes) | `on`, `off` | `on` | oui |
| | `message-size` (plus gros message, Mo) | 1, 10, 100 | 1 | oui |
| | `queued` (messages conservés par client hors ligne ou lent) | 1000, 10000, 100000 | 1000 | oui |
| Loch S3 | `memory` (Mo du conteneur) | 128, 256, 512, 1024 | 256 | oui |
| | `quota` (Mo) | 1024, 5120, 10240, 51200, 102400, 512000 | 10240 | oui |
| | `encryption` (SSE-S3 sur chaque objet ; Loch S3 1.4 et suivants) | `off`, `on` | `off` | non |

### Tailles personnalisées

En plus des valeurs listées, ces options acceptent tout multiple du pas dans la plage (carte **Personnalisé** en Go, `--option memory=3G` dans la CLI) :

| Moteur | Option | Plage | Pas |
|---|---|---|---|
| Redis, Valkey | `memory` | 128 Mo à 64 Go | 128 Mo |
| NATS | `memory` | 128 Mo à 16 Go | 128 Mo |
| | `storage` | 1 Go à 1 To | 1 Go |
| ElasticMQ | `memory` | 128 Mo à 8 Go | 128 Mo |
| Mosquitto | `memory` | 64 Mo à 4 Go | 64 Mo |
| Loch S3 | `memory` | 128 Mo à 8 Go | 128 Mo |
| | `quota` | 1 Go à 10 To | 1 Go |

## Moteurs partagés

Les moteurs partagés n'ont pas d'options. Un réglage se choisit par base :

| Réglage | Moteurs | Effet |
|---|---|---|
| **Authentification legacy** (`--legacy-auth`) | MySQL 8.4 à 8.x, PostgreSQL | `mysql_native_password` (MySQL) ou `md5` (PostgreSQL) pour les anciens clients. Fixé à la création |

## Noms et limites

| Élément | Règle |
|---|---|
| Nom d'une ressource partagée | `[a-z][a-z0-9_]`, 32 caractères au plus (16 sur MySQL 5.6) |
| Nom d'une instance dédiée | `[a-z][a-z0-9]`, 24 caractères au plus (il devient un nom d'hôte) |
| Noms réservés (tous moteurs) | `admin`, `all`, `default`, `healthcheck`, `loch`, `none`, `root`, `test`, `user`, et le préfixe `loch_` |
| Ressources par instance partagée | `SERVICES_MAX_RESOURCES_PER_INSTANCE` (50 par défaut) |
| Instances dédiées par moteur | `SERVICES_MAX_DEDICATED_INSTANCES` (20 par défaut) |

## Remarques par moteur

| Moteur | Remarque |
|---|---|
| ElasticMQ | Aucune authentification. Refusé sur le réseau `services`, publication limitée au loopback |
| MySQL 5.6, MongoDB 6.0 | Hors support : publication limitée au loopback |
| MongoDB | Ne peut pas exiger TLS : publication limitée au loopback tant que `SERVICES_TLS=auto` |
| Loch S3 | URL de type chemin uniquement ; pas de TLS (publier sur une adresse publique exige `SERVICES_TLS=off`). `SERVICES_S3_ADMIN_API_KEY` (mode partagé) n'est pas encore disponible et désactive le moteur |
| Mosquitto | Un seul utilisateur MQTT, pas d'accès anonyme |
