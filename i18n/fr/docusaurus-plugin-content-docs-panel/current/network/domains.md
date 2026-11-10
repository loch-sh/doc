---
sidebar_position: 1
title: Domaines
description: Voyez chaque domaine routé par Traefik sur le serveur, en tableau ou en graphe, avec son routeur, son TLS, ses middlewares et son conteneur.
---

# Domaines

**Réseau → Domaines** ouvre la **Cartographie des domaines** : chaque domaine routé par Traefik sur le serveur, quel que soit son déploiement (site hébergé, stack CI, fichier compose écrit à la main). La page est en lecture seule : les domaines se règlent dans les [paramètres du site](../hosting/sites.md) ou dans les labels Traefik d'une stack.

:::note
Réservé aux admins.
:::

## Vue tableau

| Colonne | Contenu |
|---|---|
| **Domaine** | Le nom d'hôte |
| **Routeur** | Le routeur Traefik qui le prend en charge |
| **Entrypoints** | `web`, `websecure`… |
| **TLS** | HTTPS activé ou non |
| **Middlewares** | Redirections, authentification, en-têtes… |
| **Service** et **Conteneur** | Où va le trafic |
| **État** et **Image** | De ce conteneur |

<Screenshot id="domains-table" alt="La cartographie des domaines en vue tableau avec chaque domaine, routeur, TLS, service et conteneur" />

## Vue graphe

**Graphe** dessine chaque chemin : entrypoint → domaine → routeur → service → conteneur. Utilisez-la pour voir quel conteneur répond à un domaine, ou quels domaines pointent vers le même conteneur.

<Screenshot id="domains-graph" alt="La cartographie des domaines en vue graphe, de l'entrypoint aux conteneurs" />

## Filtres

- Recherchez un domaine ou un conteneur.
- **Filtrer par TLD**.
- **Actifs** n'affiche que les domaines dont le conteneur tourne ; **Tous** affiche aussi les autres.

```bash
loch domains
```

## Bon à savoir

- La carte est construite à partir des routeurs Traefik : un domaine absent ici n'est pas routé. Vérifiez le DNS et les labels Traefik.
- La page d'accueil affiche les 5 derniers domaines.
