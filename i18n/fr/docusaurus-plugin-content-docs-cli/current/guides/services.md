---
sidebar_position: 7
title: Bases de données et services
description: Créer des bases de données, caches, brokers de messages, files d'attente et stockages objet, réinitialiser leurs mots de passe, les redimensionner, les mettre à jour et les publier.
---

# Bases de données et services

`loch services` (alias `loch db`) gère le module services. Réservé aux admins ; le module doit être activé sur le serveur. Côté panel : [Services](/panel/services/overview/).

- **Moteurs partagés** (MySQL, MariaDB, PostgreSQL, MongoDB, RabbitMQ) : une instance par version. Vous créez une base (ou un vhost) avec un utilisateur du même nom. La première démarre l'instance.
- **Moteurs dédiés** (Redis, Valkey, NATS, Loch S3, ElasticMQ, Mosquitto) : un conteneur par ressource, dimensionné par des options.

## Commandes

| Commande | Rôle |
|---|---|
| `loch services engines` | Liste les moteurs, versions, options et la politique de publication des ports. |
| `loch services instances` | Liste les instances et leur état. |
| `loch services ls` | Liste les ressources (`--instance` pour filtrer). |
| `loch services create <nom> --engine <e> --version <v>` | Crée une ressource. Affiche le mot de passe une seule fois. |
| `loch services reset-password <instance> <nom>` | Génère un nouveau mot de passe. L'affiche une seule fois. |
| `loch services delete <instance> <nom>` | Supprime une ressource et ses données. |
| `loch services update <instance> --option k=v` | Redimensionne une instance dédiée (la redémarre). |
| `loch services updates` | Liste les mises à jour des instances dédiées (`--check` : vérifier maintenant). |
| `loch services upgrade <instance>` | Met à jour une instance dédiée vers la dernière image de sa version (`--version` : passer à une version plus récente). |
| `loch services networks <instance> --network <r>` | Remplace les réseaux d'une instance. |
| `loch services expose <instance> <adresse>:<port>` | Publie le port d'une instance sur l'hôte. |
| `loch services unexpose <instance>` | Ferme le port publié. |
| `loch services retire <instance>` | Retire une instance vide. |
| `loch services purge <instance>` | Supprime une instance modifiée à la main, avec toutes ses données. |

```bash
loch services create shop --engine postgres --version 17
loch services create cache --engine redis --version 8.4 --option memory=512
loch services reset-password postgres-17 shop
loch services expose postgres-17 127.0.0.1:5417
```

## Droits

| Commande | Scope | Admin |
|---|---|---|
| `engines`, `instances`, `ls`, `updates` | `services:read` | Oui |
| `create`, `reset-password`, `delete`, `update`, `upgrade`, `retire`, `purge`, `updates --check` | `services:write` | Oui |
| `networks` | `networks:write` | Oui |
| `expose`, `unexpose` | `services:expose` (non inclus dans `services:write`) | Oui |

## Bon à savoir

- Le mot de passe n'est affiché que dans un terminal. Dans un pipe ou un log de CI, ajoutez `--show-password`.
- `update`, `upgrade`, `networks` et `expose` recréent l'instance : ses clients sont déconnectés quelques secondes. Les données sont conservées.
- `upgrade` ne fait aucune sauvegarde et ne revient jamais à une version plus ancienne. Sauvegardez d'abord si c'est important.
- ElasticMQ n'a pas d'authentification : il est refusé sur le réseau partagé `services`. Donnez-lui un réseau privé avec `--network` (voir [Réseaux privés](./networks.md)).
- La suppression d'une ressource, la publication d'un port et le passage à une autre version se font uniquement avec la CLI ou le panel : le serveur MCP ne les propose pas.
