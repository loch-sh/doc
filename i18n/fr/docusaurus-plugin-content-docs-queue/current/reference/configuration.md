---
sidebar_position: 1
title: Référence de la configuration
description: Toutes les options du middleware Loch Queue Manager, avec leur type, leur valeur par défaut et leur règle de validation.
---

# Référence de la configuration

Les options se placent sous le nom du plugin `queuemanager` dans la configuration du middleware :

- Labels Docker : `traefik.http.middlewares.<name>.plugin.queuemanager.<option>=<value>`
- Provider fichier : `http.middlewares.<name>.plugin.queuemanager.<option>`

Les valeurs sont vérifiées quand Traefik crée le middleware. Une valeur qui échoue à une vérification bloque le middleware avec `invalid QueueManager configuration: <reason>`.

## File

| Option | Type | Défaut | Vérification | Description |
|---|---|---|---|---|
| `enabled` | bool | `true` | | `false` laisse passer toutes les requêtes, sans file ni limite de débit |
| `maxEntries` | int | `100` | > 0 | Nombre de visiteurs admis en même temps |
| `inactivityTimeoutSeconds` | int | `60` | > 0 | Un visiteur actif sans requête pendant cette durée perd sa place |
| `hardSessionLimitSeconds` | int | `0` | ≥ 0 | Durée maximale dans le service, comptée depuis l'entrée ou la sortie de la file. `0` la désactive |
| `cleanupIntervalSeconds` | int | `30` | > 0 | Intervalle entre deux nettoyages : retrait des visiteurs expirés, entrée de la tête de la file |

La file est toujours « premier arrivé, premier servi ». L'option `queueStrategy` existe, avec `fifo` pour seule valeur.

## Page d'attente

| Option | Type | Défaut | Vérification | Description |
|---|---|---|---|---|
| `queuePageFile` | string | `/var/public/queue-page.html` | non vide | Modèle HTML de la page d'attente. Absent ou invalide : page intégrée en anglais |
| `queueTranslationsFile` | string | `/var/public/translations.json` | | Textes de la page par langue. Absent : textes vides |
| `refreshIntervalSeconds` | int | `20` | > 0 | Intervalle de rechargement de la page d'attente, en secondes |
| `minWaitTimeMinutes` | int | `1` | | Minimum du temps d'attente affiché, en minutes |
| `httpResponseCode` | int | `429` | | Code de la page d'attente, de la réponse JSON et de la réponse de limite de débit |
| `httpContentType` | string | `text/html; charset=utf-8` | | `Content-Type` de la page d'attente |

## Identification des visiteurs

| Option | Type | Défaut | Vérification | Description |
|---|---|---|---|---|
| `useCookies` | bool | `true` | | `true` : cookie aléatoire. `false` : empreinte SHA-256 de l'IP du client et de son User-Agent |
| `cookieName` | string | `loch-queue-id` | | Nom du cookie, vérifié aussi par la limite de débit |
| `cookieMaxAgeSeconds` | int | `3600` | | Durée de vie du cookie, non renouvelée |
| `rateLimitTimes` | int | `5` | | Requêtes sans cookie admises par IP et par minute. `0` refuse toute requête sans cookie |

Le cookie contient 16 octets aléatoires en hexadécimal, avec `Path=/`, `HttpOnly`, `SameSite=Lax`, et `Secure` quand la connexion TLS se termine sur Traefik.

## Journaux

| Option | Type | Défaut | Vérification | Description |
|---|---|---|---|---|
| `logLevel` | string | `info` | | `debug`, `info`, `warn` ou `error` |
| `debug` | bool | `false` | | Force le niveau `debug` et remplit `DebugInfo` dans la page d'attente et la réponse JSON |
| `logFile` | string | vide | | Fichier auquel ajouter les journaux. Vide : sortie d'erreur standard de Traefik. Si le fichier ne peut pas être ouvert, la sortie d'erreur standard est utilisée |

## Exemple complet

```yaml title="dynamic.yml"
http:
  middlewares:
    queue:
      plugin:
        queuemanager:
          enabled: true
          maxEntries: 300
          inactivityTimeoutSeconds: 300
          hardSessionLimitSeconds: 3600
          cleanupIntervalSeconds: 30
          refreshIntervalSeconds: 20
          minWaitTimeMinutes: 1
          queuePageFile: /var/public/queue-page.html
          queueTranslationsFile: /var/public/translations.json
          httpResponseCode: 429
          useCookies: true
          cookieName: loch-queue-id
          cookieMaxAgeSeconds: 7200
          rateLimitTimes: 5
          logLevel: warn
```
