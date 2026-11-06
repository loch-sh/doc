---
sidebar_position: 1
title: Capacité et délais
description: Choisissez combien de visiteurs utilisent le service en même temps, quand un visiteur inactif perd sa place et à quel rythme la file avance.
---

# Capacité et délais

Le plugin compte des **visiteurs**, pas des requêtes : un navigateur qui garde le cookie compte une seule fois, quel que soit le nombre de requêtes qu'il envoie.

## Options

| Option | Défaut | Rôle |
|---|---|---|
| `maxEntries` | `100` | Nombre de visiteurs admis en même temps |
| `inactivityTimeoutSeconds` | `60` | Un visiteur actif sans requête pendant cette durée perd sa place |
| `hardSessionLimitSeconds` | `0` (désactivé) | Durée maximale dans le service, même pour un visiteur actif |
| `cleanupIntervalSeconds` | `30` | Fréquence à laquelle le plugin libère les places et fait entrer la tête de la file |
| `refreshIntervalSeconds` | `20` | Fréquence de rechargement de la page d'attente |
| `cookieMaxAgeSeconds` | `3600` | Durée de vie du cookie dans le navigateur |

Exemple : 300 visiteurs, 5 minutes d'inactivité, 1 heure au maximum.

```yaml
labels:
  - traefik.http.middlewares.queue.plugin.queuemanager.maxEntries=300
  - traefik.http.middlewares.queue.plugin.queuemanager.inactivityTimeoutSeconds=300
  - traefik.http.middlewares.queue.plugin.queuemanager.hardSessionLimitSeconds=3600
```

## Choisir les valeurs

- **`maxEntries`** : commencez sous ce que le service supporte en charge, puis augmentez.
- **`inactivityTimeoutSeconds`** : chaque requête passant par le routeur conserve la place. Trop court, un visiteur qui lit une longue page retourne dans la file. Trop long, des visiteurs partis gardent des places.
- **`hardSessionLimitSeconds`** : compte à partir de l'entrée, ou de la sortie de la file. Une fois atteinte, le visiteur retourne dans la file, sauf si une place est libre.
- **`cleanupIntervalSeconds`** : la file avance surtout à chaque nettoyage. Une attente peut durer jusqu'à cette valeur après la libération d'une place.
- **`refreshIntervalSeconds`** : gardez-la bien en dessous de `inactivityTimeoutSeconds`. Un visiteur admis doit envoyer une requête avant le délai d'inactivité, sinon il perd sa place avant de l'avoir vue.
- **`cookieMaxAgeSeconds`** : le cookie n'est pas renouvelé. À son expiration, le visiteur devient un nouveau visiteur, en fin de file. Prévoyez plus long qu'une attente suivie d'une session.

Le temps d'attente affiché est une approximation calculée d'après la position, pas une mesure. Son minimum est `minWaitTimeMinutes` (`1`).

## Désactiver la file

Passez `enabled=false` pour laisser passer toutes les requêtes sans retirer le middleware. La limite de débit est alors désactivée elle aussi.

Liste complète : [Référence de la configuration](../reference/configuration.md).
