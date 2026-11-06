---
sidebar_position: 6
title: Dépannage
description: Corrigez les problèmes courants - démarrage refusé, 403 derrière un proxy, fichiers d'identifiants refusés, healthchecks en échec, bootstraps qui ne démarrent pas.
---

# Dépannage

| Symptôme | Cause et solution |
|---|---|
| Le démarrage échoue : `authentication is on: set LOCH_RUNTIME_TOKEN_SHA256 …` | Aucun identifiant. Définissez-en un ([Authentification](./authentication.md)). `LOCH_RUNTIME_AUTH=off` est réservé au développement local |
| Le démarrage échoue avec un message qui nomme un réglage (code de sortie 2) | Valeur invalide. Tous les réglages invalides sont listés en une fois |
| Un handler nommé `health`, `invoke` ou `version` lance la sous-commande | Ajoutez `run` : `loch-lambda-runtime run health` |
| 403 `AccessDeniedException` derrière un reverse proxy | Le proxy transmet l'en-tête `Origin` du navigateur. Supprimez-le au niveau du proxy, ou définissez `LOCH_RUNTIME_ALLOW_BROWSER=true` |
| Un fichier d'identifiants est refusé | L'utilisateur du runtime pourrait le modifier. Montez tout le chemin en lecture seule (`:ro`, secrets Docker), ou donnez-le à un autre utilisateur. En root sur un rootfs modifiable, il est toujours refusé : utilisez un utilisateur non root |
| Healthcheck écrit en `CMD-SHELL` ou avec `docker run --health-cmd` | Utilisez la forme exec `["CMD", "/loch/lambda-runtime", "health"]`, jamais `CMD-SHELL` : un shell garderait l'environnement du conteneur dans un processus que la fonction peut lire |
| `docker exec … invoke --watch-stdin` renvoie 1, ou attend l'événement | Gardez stdin ouvert (`docker exec -i`) jusqu'au résultat : sa fermeture signifie que l'appelant est parti. Terminez l'événement par un saut de ligne : un nombre, `true` ou `null` ne se termine qu'à l'octet suivant |
| provided.al2023 : `failed to exec /var/task/bootstrap` | Mettez le mode `0755` et compilez pour l'architecture de l'image. Docker Desktop sur macOS n'applique pas les propriétaires sur les bind mounts : `0700` y passe, mais échoue sous Linux |
| `docker pull` depuis `mirror.gcr.io` répond « not found » ou 429 | Les premiers pulls d'un tag peuvent échouer : réessayez |
| Les invocations reçoivent 429 | La file est pleine (`LOCH_RUNTIME_QUEUE_SIZE`, `LOCH_RUNTIME_QUEUE_BYTES`) ou une invocation a attendu plus de `LOCH_RUNTIME_QUEUE_TIMEOUT`. Les clients doivent réessayer après `Retry-After` |
| Les invocations reçoivent 400 avec `Event` | Les invocations asynchrones ne sont pas prises en charge |
| `REPORT` affiche un `Max Memory Used` qui augmente | C'est le pic du conteneur depuis son démarrage, pas celui de l'invocation |

## Bon à savoir

- Lancez avec `LOCH_RUNTIME_LOG_LEVEL=debug` pour voir davantage de logs du runtime.
- Vérifiez l'état : `docker exec fn /loch/lambda-runtime health` affiche le document de santé.

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
