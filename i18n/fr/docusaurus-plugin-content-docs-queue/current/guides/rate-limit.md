---
sidebar_position: 4
title: Limite de débit et IP du client
description: Comment le plugin limite les requêtes sans le cookie de la file, quelle adresse IP il utilise et comment configurer Traefik derrière un proxy.
---

# Limite de débit et IP du client

Le plugin limite les requêtes qui arrivent **sans le cookie de la file**, par adresse IP. Il protège la file des clients qui créent un nouveau visiteur à chaque requête.

## Fonctionnement

- Chaque requête sans le cookie est comptée pour son adresse IP, sur une fenêtre glissante d'une minute, même quand le service a des places libres.
- Au-delà de `rateLimitTimes` requêtes (`5` par défaut), la requête reçoit une réponse JSON avec le code `httpResponseCode` (`429`) :

  ```json
  {"error": "capacity overload", "handler": "Loch.sh Queue Manager"}
  ```

- Le plugin vérifie la présence du cookie, pas sa valeur. Un navigateur qui garde le cookie n'est compté que sur sa première requête.

## Qui peut être limité

| Client | Pourquoi | Que faire |
|---|---|---|
| `curl`, sondes de disponibilité, webhooks, robots | Ils ne gardent pas les cookies | Utilisez un fichier de cookies (`curl -c jar -b jar`), ou augmentez `rateLimitTimes` |
| Nombreux visiteurs derrière une même IP (réseau d'entreprise, NAT) | Leurs premières requêtes viennent toutes de la même adresse | Augmentez `rateLimitTimes` |
| Tous les visiteurs, avec `useCookies=false` | Aucun cookie n'est posé, donc chaque requête est comptée | Gardez `useCookies=true`, ou fixez `rateLimitTimes` bien au-dessus du nombre de requêtes par minute d'une page |

Aucune option ne désactive la limite : fixez une valeur élevée de `rateLimitTimes` pour l'assouplir.

```yaml
labels:
  - traefik.http.middlewares.queue.plugin.queuemanager.rateLimitTimes=60
```

## Adresse IP du client

Le plugin prend le premier en-tête trouvé, dans cet ordre :

1. `X-Forwarded-For`, première entrée
2. `X-Real-IP`
3. `Fly-Client-IP`
4. `CF-Connecting-IP`
5. L'adresse de la connexion TCP

La valeur est utilisée telle quelle : un client qui peut définir ces en-têtes peut choisir son IP pour la limite de débit et, avec `useCookies=false`, son identité. Derrière un proxy ou un CDN, n'acceptez les en-têtes transmis que de lui, avec `forwardedHeaders.trustedIPs` sur le point d'entrée Traefik, et n'activez pas `forwardedHeaders.insecure`.

```yaml title="traefik.yml"
entryPoints:
  websecure:
    address: ":443"
    forwardedHeaders:
      trustedIPs:
        - "10.0.0.0/8" # votre proxy ou répartiteur de charge
```
