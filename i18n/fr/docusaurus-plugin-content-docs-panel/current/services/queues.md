---
sidebar_position: 5
title: Files d'attente
description: Créez des files ElasticMQ compatibles Amazon SQS sur un réseau privé, et des brokers MQTT Eclipse Mosquitto.
---

# Files d'attente

Le menu **Files d'attente** propose **ElasticMQ** (compatible avec l'API Amazon SQS) et **Eclipse Mosquitto** (broker MQTT). Chaque instance tourne dans son propre conteneur.

:::note
Réservé aux admins. Nécessite le [module services](./overview.md).
:::

## ElasticMQ

Les applications écrites pour Amazon SQS envoient et reçoivent des messages sans compte AWS.

:::warning
ElasticMQ n'a **aucune authentification** : tout site présent sur le même réseau peut utiliser, purger ou supprimer ses files. N'y stockez pas de données sensibles.
:::

1. Créez un [réseau privé](../network/private-networks.md) pour les sites autorisés à utiliser les files. Le réseau partagé `services` est refusé.
2. Ouvrez **Files d'attente → ElasticMQ**, puis cliquez sur **Nouvelle instance**.
3. Choisissez la **Version**, les **Limites SQS**, les **Réseaux** privés et le **Nom**, puis cliquez sur **Créer**.

| Réglage | Valeurs | Défaut |
|---|---|---|
| **Mémoire** | 128 Mo à 1 Go, ou **Personnalisé** jusqu'à 8 Go | 256 Mo |
| **Limites SQS** | **Strictes** : les mêmes limites qu'Amazon SQS, ce qui fonctionne ici fonctionne sur AWS. **Assouplies** : messages plus gros et délais plus longs (développement, migrations) | **Strictes** |

```bash
loch services create jobs --engine elasticmq --version 1.7 --network shop
```

Les **Informations de connexion** donnent le **Point d'accès** (`http://svc-elasticmq-<nom>:9324`), la **Région** (`us-east-1`) et le **Préfixe des URL de file**. N'importe quels identifiants sont acceptés, mais les SDK en exigent (par exemple `x`). Il n'y a pas de **Nouveau mot de passe**, et le port ne peut être publié que sur `127.0.0.1`.

## Eclipse Mosquitto

Un broker MQTT pour objets connectés, capteurs et tableaux de bord. Un utilisateur MQTT, pas d'accès anonyme.

1. Ouvrez **Files d'attente → Eclipse Mosquitto**, puis cliquez sur **Nouvelle instance**.
2. Choisissez la **Version**, les réglages, les **Réseaux** et le **Nom**, puis cliquez sur **Créer**.

| Réglage | Valeurs | Défaut |
|---|---|---|
| **Mémoire** | 64 à 512 Mo, ou **Personnalisé** jusqu'à 4 Go | 128 Mo |
| **Persistance** | **Sur disque** : les messages retenus et les sessions persistantes survivent à un redémarrage. **En mémoire seulement** | **Sur disque** |
| **Taille maximale d'un message** | 1, 10 ou 100 Mo | 1 Mo |
| **Messages en attente par client** | Gardés pour un client déconnecté ou lent (QoS 1 et 2) : 1 000, 10 000 ou 100 000 | 1 000 |

```bash
loch services create sensors --engine mosquitto --version 2.0
```

**Informations de connexion** : **Hôte** (`svc-mosquitto-<nom>`), **Port** (1883), **Utilisateur**, **Mot de passe** et **URI de connexion** (`mqtt://<utilisateur>:<mot de passe>@svc-mosquitto-<nom>:1883`). Les topics ne sont pas gérés par le panel.

## Bon à savoir

- Tous les réglages des deux moteurs se modifient ensuite avec **Modifier**.
- Mise à jour, redimensionnement, port publié et suppression : [services managés](./overview.md).
