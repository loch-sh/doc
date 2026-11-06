---
sidebar_position: 3
title: Référence de la réponse JSON
description: Champs et en-têtes des réponses JSON envoyées aux clients en file d'attente et aux clients limités.
---

# Référence de la réponse JSON

Guide : [Clients JSON et applications monopages](../guides/json-api.md).

## Client en file d'attente

Envoyée quand la requête porte `Accept: application/json` (valeur exacte) et que le visiteur est dans la file.

| Champ | Type | Contenu |
|---|---|---|
| `error` | string | Toujours `capacity overload` |
| `handler` | string | Toujours `Loch.sh Queue Manager` |
| `detail.position` | int | Position dans la file, à partir de 1 |
| `detail.queueSize` | int | Nombre de visiteurs dans la file |
| `detail.estimatedWaitTime` | int | Attente approximative, en minutes |
| `detail.refreshInterval` | int | Secondes à attendre avant de réessayer (`refreshIntervalSeconds`) |
| `detail.progressPercentage` | int | Progression, de 0 à 100 |
| `detail.debugInfo` | string | État interne ; vide sauf avec `debug=true` |

## Client limité

Envoyée à une requête sans cookie au-delà de `rateLimitTimes` par minute, quel que soit son en-tête `Accept`. Mêmes `error` et `handler`, sans `detail`.

```json
{"error": "capacity overload", "handler": "Loch.sh Queue Manager"}
```

## Code et en-têtes

| Élément | Valeur |
|---|---|
| Code | `httpResponseCode` (`429` par défaut) |
| `Content-Type` | `application/json` |
| `X-Loch-sh` | `Loch Queue` |
| `Set-Cookie` | Le cookie de la file, à la première requête d'un visiteur (avec `useCookies=true`) |
