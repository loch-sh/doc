---
sidebar_position: 2
title: Authentification
description: Protégez l'API Invoke avec un jeton bearer stocké sous forme de SHA-256, un jeton en clair ou AWS SigV4, et changez les identifiants sans redémarrer.
---

# Authentification

Les appelants réseau doivent s'authentifier. Le runtime refuse de démarrer sans identifiant, sauf avec `LOCH_RUNTIME_AUTH=off` (développement local uniquement). Les appelants sur la loopback du conteneur (la fonction elle-même, `docker exec … invoke`, `health`) n'en ont pas besoin.

## Choisir un identifiant

| Identifiant | Variables | Les appelants envoient | Lisible par la fonction |
|---|---|---|---|
| Jeton bearer, sous forme de SHA-256 (recommandé) | `LOCH_RUNTIME_TOKEN_SHA256` (64 hex) ou `LOCH_RUNTIME_TOKEN_SHA256_FILE` | `Authorization: Bearer <token>` | Non : le jeton n'est jamais dans le conteneur |
| Jeton bearer en clair | `LOCH_RUNTIME_TOKEN` ou `LOCH_RUNTIME_TOKEN_FILE` (32 octets au moins, ASCII imprimable) | `Authorization: Bearer <token>` | Oui |
| Paire de clés AWS SigV4 (facultative) | `LOCH_RUNTIME_ACCESS_KEY` ou `LOCH_RUNTIME_ACCESS_KEY_FILE` (`<access key id>:<secret>`) | Une signature SigV4 (AWS CLI, SDK AWS) | Oui |

Définissez une seule source de jeton bearer au plus, et une seule source pour la paire de clés. Un jeton bearer et une paire de clés peuvent coexister.

Créez un jeton et son empreinte :

```bash
TOKEN=$(openssl rand -hex 32)
printf %s "$TOKEN" | openssl dgst -sha256 -r | cut -d' ' -f1   # valeur de LOCH_RUNTIME_TOKEN_SHA256
```

## Pourquoi la fonction peut lire certains secrets

Le code de la fonction tourne sous l'uid du runtime, dans le même conteneur. Il peut lire l'environnement des processus lancés par `docker exec` : un jeton en clair est donc réservé à un usage autonome. SigV4 a besoin du secret lui-même pour vérifier les signatures, donc **la fonction peut lire son propre secret SigV4**. Cela lui permet seulement de s'invoquer elle-même, ce qu'elle peut déjà faire par la loopback. Ne présentez jamais ce secret comme protégé du code de la fonction.

Générez l'access key id au hasard et gardez-le privé lui aussi.

## Utiliser des fichiers d'identifiants

Montez les fichiers en lecture seule (secrets Docker, ou bind mount `:ro`) :

```bash
docker run … \
  -v "$PWD/secrets:/run/fn-secrets:ro" \
  -e LOCH_RUNTIME_TOKEN_SHA256_FILE=/run/fn-secrets/token.sha256 \
  …
```

La fonction peut envoyer SIGHUP au runtime : le runtime refuse donc un fichier qu'il pourrait modifier. Le fichier et chaque répertoire au-dessus doivent se trouver sur un montage en lecture seule, ou appartenir à un autre utilisateur sans être modifiables par le runtime. Un fichier modifiable par tous est refusé. En root, tout le chemin, rootfs compris, doit être en lecture seule : utilisez un utilisateur non root.

## Changer les identifiants

Les variantes `*_FILE` sont relues sur SIGHUP.

1. Écrivez le nouveau fichier complet à côté de l'ancien, puis renommez-le par-dessus.
2. Envoyez SIGHUP : `docker kill --signal HUP fn`.

Un rechargement qui échoue garde les identifiants en vigueur : écrire un identifiant invalide ne révoque rien. Pour révoquer, redémarrez avec de nouveaux identifiants. Les variables sont lues une fois au démarrage, puis retirées de l'environnement du runtime.

## Bon à savoir

- N'utilisez jamais `--network host` : l'exemption de la loopback suppose que le conteneur a son propre espace de noms réseau.
- Une requête SigV4 peut être rejouée dans la tolérance d'horloge de ±5 min, et l'API Invoke est en HTTP clair : exposez-la sur des réseaux privés uniquement.
- Les requêtes de navigateurs web (en-tête `Origin`, `Sec-Fetch-Site`, `Sec-Fetch-Dest` ou `Sec-Fetch-User`) reçoivent 403, même authentification désactivée. `LOCH_RUNTIME_ALLOW_BROWSER=true` les accepte.
- `/_loch/health` ne demande aucun identifiant ; `/_loch/metrics` en demande un, sauf depuis la loopback.
- Modèle de menace : [Modèle de sécurité](../reference/security-model.md).

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
