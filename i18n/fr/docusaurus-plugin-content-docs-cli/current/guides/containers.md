---
sidebar_position: 2
title: Conteneurs
description: Lister, inspecter, démarrer, arrêter, redémarrer, tuer et supprimer des conteneurs, agir sur une stack entière et suivre la consommation en direct.
---

# Conteneurs

Ces commandes agissent sur les conteneurs du namespace actif (voir [Endpoints et namespaces](./endpoints-and-namespaces.md)). Désignez un conteneur par son nom de service Compose, par exemple `php`. Un utilisateur restreint ne voit que les conteneurs qu'un admin lui a attribués.

## Commandes

| Commande | Rôle |
|---|---|
| `loch ps` | Liste les conteneurs du namespace actif (`-a` : tous les namespaces). |
| `loch inspect <service>` | Affiche le détail complet d'un conteneur. |
| `loch start <service...>` | Démarre un ou plusieurs conteneurs. |
| `loch stop <service...>` | Arrête un ou plusieurs conteneurs. |
| `loch restart <service...>` | Redémarre un ou plusieurs conteneurs. |
| `loch kill <service...>` | Tue un ou plusieurs conteneurs. |
| `loch rm <service...>` | Supprime un ou plusieurs conteneurs. |
| `loch stack start\|stop\|restart [stack]` | Agit sur tous les conteneurs d'une stack, dans l'ordre des dépendances (`depends_on`). Par défaut : le namespace actif. |
| `loch stats [service...]` | CPU, mémoire, réseau et PID en direct. Par défaut : tous les conteneurs démarrés du namespace. |

```bash
loch ps
loch inspect php
loch restart php worker
loch stack restart blog
loch stats
```

## Droits

| Commande | Scope |
|---|---|
| `ps`, `inspect` | `containers:read` |
| `start`, `stop`, `restart`, `kill`, `rm`, `stack` | `containers:actions` |
| `stats` | `containers:stats` |

Les commandes qui prennent un nom de service demandent aussi `containers:read`, pour trouver le conteneur.

## Bon à savoir

- `loch stack` refuse le namespace `default` : elle ne fonctionne que sur des stacks Docker Compose.
- Les admins listent les domaines Traefik avec `loch domains`.
