---
sidebar_position: 3
title: Clients JSON et applications monopages
description: Obtenez l'état de la file en JSON au lieu de la page d'attente HTML, depuis une application monopage ou un client d'API.
---

# Clients JSON et applications monopages

Une requête avec l'en-tête `Accept: application/json` reçoit l'état de la file en JSON au lieu de la page d'attente. La valeur doit être exactement `application/json` : une liste comme `application/json, text/plain` reçoit la page HTML.

```json
{
  "error": "capacity overload",
  "handler": "Loch.sh Queue Manager",
  "detail": {
    "position": 12,
    "queueSize": 40,
    "estimatedWaitTime": 5,
    "refreshInterval": 20,
    "progressPercentage": 70,
    "debugInfo": ""
  }
}
```

Le code est `httpResponseCode` (`429` par défaut) et la réponse porte l'en-tête `X-Loch-sh: Loch Queue`. Quand le visiteur entre, la requête atteint le service normalement.

## Gérer la file dans le client

1. Envoyez les requêtes avec les cookies : le plugin identifie le visiteur par son cookie (`loch-queue-id`). Le cookie est `HttpOnly` : le navigateur l'envoie, les scripts ne peuvent pas le lire.
2. Sur une réponse portant l'en-tête `X-Loch-sh`, affichez la position et l'attente lues dans `detail`.
3. Réessayez après `detail.refreshInterval` secondes.

```js
async function callApi(url) {
  const res = await fetch(url, {
    headers: {Accept: 'application/json'},
    credentials: 'same-origin', // envoie le cookie de la file
  });
  if (res.headers.get('X-Loch-sh')) {
    const body = await res.json();
    if (body.detail) {
      showQueue(body.detail.position, body.detail.estimatedWaitTime);
      await new Promise((r) => setTimeout(r, body.detail.refreshInterval * 1000));
    } else {
      await new Promise((r) => setTimeout(r, 60_000)); // limite de débit
    }
    return callApi(url);
  }
  return res;
}
```

## Bon à savoir

- Un client qui ne garde pas le cookie devient un nouveau visiteur à chaque requête, en fin de file, et atteint la [limite de débit](./rate-limit.md) au bout de quelques requêtes.
- Une réponse sans `detail` vient de la limite de débit, pas de la file.
- `debugInfo` est vide sauf si l'option `debug` est activée.

Détail des champs : [Référence de la réponse JSON](../reference/json-response.md).
