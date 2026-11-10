---
sidebar_position: 4
title: Messagerie
description: Créez des hôtes virtuels RabbitMQ sur un broker partagé et des instances NATS dédiées avec stockage JetStream.
---

# Messagerie

Le menu **Messagerie** propose **RabbitMQ** (broker AMQP, partagé) et **NATS** (publication-abonnement et flux JetStream, dédié).

:::note
Réservé aux admins. Nécessite le [module services](./overview.md).
:::

## RabbitMQ

Chaque version fait tourner un broker partagé par tous les sites. Une ressource est un **hôte virtuel** et un utilisateur du même nom, isolé des autres et borné en connexions, en files et en taille de file.

1. Ouvrez **Messagerie → RabbitMQ**, puis cliquez sur **Nouvel hôte virtuel**.
2. Choisissez la **Version** et les **Réseaux**, saisissez le **Nom** (lettres minuscules, chiffres et `_`), puis cliquez sur **Créer**.
3. Copiez le mot de passe dans **Informations de connexion** : **Hôte** (`svc-rabbitmq-4-2`), **Port** (5672), **Hôte virtuel**, **Utilisateur**, **Mot de passe**, **URI de connexion**.

<Screenshot id="services-rabbitmq" alt="La page RabbitMQ avec le broker 4.2 déplié sur ses hôtes virtuels" />

```bash
loch services create shop --engine rabbitmq --version 4.2
```

Supprimer un hôte virtuel supprime ses files et ses messages. Supprimer le dernier retire le broker, avec ses données. L'interface de gestion de RabbitMQ n'est pas disponible.

## NATS

Chaque instance tourne dans son propre conteneur, avec un utilisateur.

1. Ouvrez **Messagerie → NATS**, puis cliquez sur **Nouvelle instance**.
2. Choisissez la **Version**, les réglages, les **Réseaux** et le **Nom** (lettres minuscules et chiffres), puis cliquez sur **Créer**.

| Réglage | Valeurs | Défaut |
|---|---|---|
| **Mémoire** | 128 Mo à 1 Go, ou **Personnalisé** jusqu'à 16 Go. Les flux en mémoire en ont le quart | 256 Mo |
| **Stockage des flux** | Espace disque JetStream : 1 Go à 50 Go, ou **Personnalisé** jusqu'à 1 To | 1 Go |
| **Taille maximale d'un message** | 1, 8 ou 64 Mo | 1 Mo |

Tous les réglages se modifient ensuite avec **Modifier**. Gardez des messages courts : les gros coûtent de la mémoire pour chaque client.

```bash
loch services create events --engine nats --version 2.12 --option storage=5120
```

**Informations de connexion** : **Hôte** (`svc-nats-<nom>`), **Port** (4222), **Utilisateur**, **Mot de passe**, **URI de connexion**.

## Bon à savoir

- Les comptes, sujets et flux sont gérés par vos applications, pas par le panel.
- Mise à jour (NATS uniquement), redimensionnement, port publié et suppression : [services managés](./overview.md).
