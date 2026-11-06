---
sidebar_position: 1
title: Référence de configuration
description: Chaque réglage LOCH_RUNTIME_* avec son option et sa valeur par défaut, les variables de la fonction et l'environnement que reçoit le bootstrap.
---

# Référence de configuration

Chaque réglage `LOCH_RUNTIME_*` se lit dans l'environnement ou dans son option ; l'option l'emporte. Les trois variables qui contiennent la valeur d'un identifiant n'ont pas d'option, pour qu'elle n'apparaisse jamais dans la liste des processus. Chaque valeur est vérifiée au démarrage : une valeur invalide arrête le runtime (code de sortie 2) avec un message qui nomme le réglage, toutes les erreurs listées en une fois.

Les durées acceptent la syntaxe Go (`1m30s`) ou des secondes (`2.5`), jusqu'à 24 h. Les tailles acceptent des octets ou un suffixe `KiB`, `MiB` ou `GiB`. Les interrupteurs acceptent `on`/`true` et `off`/`false`.

## Réglages du runtime {#runtime}

| Variable | Option | Défaut | Description |
|---|---|---|---|
| `LOCH_RUNTIME_INVOKE_ADDR` | `--invoke-addr` | `0.0.0.0:8080` | Adresse d'écoute de l'API Invoke (IP et port) |
| `LOCH_RUNTIME_API_ADDR` | `--runtime-api-addr` | `127.0.0.1:9001` | Adresse d'écoute de l'API Runtime. Loopback IPv4 uniquement |
| `LOCH_RUNTIME_HEALTH_ADDR` | `--health-addr` | `127.0.0.1:8081` | Écoute dédiée à la santé, utilisée par `health`. Loopback IPv4 uniquement |
| `LOCH_RUNTIME_BOOTSTRAP` | `--bootstrap` | `/lambda-entrypoint.sh` | Programme lancé avec le handler dans la forme `<handler>`. Chemin absolu |
| `LOCH_RUNTIME_WORKDIR` | `--workdir` | répertoire courant (le `WORKDIR` de l'image) | Répertoire de travail du bootstrap. Chemin absolu |
| `LOCH_RUNTIME_INIT_TIMEOUT` | `--init-timeout` | `10s` | Budget de l'init. Une init plus longue continue, et sa durée est imputée au timeout de la première invocation |
| `LOCH_RUNTIME_SHUTDOWN_GRACE` | `--shutdown-grace` | `8s` | Temps laissé à l'invocation en cours sur SIGTERM. `0` accepté |
| `LOCH_RUNTIME_MAX_PAYLOAD` | `--max-payload` | `6MiB` | Limite des requêtes, de 1 Kio à 1 Gio. Réponses : cette limite + 100 octets, comme sur AWS Lambda™ |
| `LOCH_RUNTIME_QUEUE_SIZE` | `--queue-size` | `16` | Invocations en attente (0 à 100000) |
| `LOCH_RUNTIME_QUEUE_BYTES` | `--queue-bytes` | `min(32MiB, memory/8)`, au moins `LOCH_RUNTIME_MAX_PAYLOAD` | Taille totale des invocations en mémoire. Une valeur définie inférieure à `LOCH_RUNTIME_MAX_PAYLOAD` est refusée |
| `LOCH_RUNTIME_QUEUE_TIMEOUT` | `--queue-timeout` | `30s` | Attente maximale dans la file ; au-delà, 429 |
| `LOCH_RUNTIME_MAX_CONNS` | `--max-conns` | 8 × (taille de file + 1), 768 au plus | Connexions ouvertes vers l'API Invoke. Une IP source peut en tenir un huitième, au moins 4 |
| `LOCH_RUNTIME_AUTH` | `--auth` | `on` | `off` désactive l'authentification (développement uniquement) |
| `LOCH_RUNTIME_ALLOW_BROWSER` | `--allow-browser` | `false` | `true` accepte les requêtes de navigateurs web (en-têtes `Origin`, `Sec-Fetch-Site`, `Sec-Fetch-Dest`, `Sec-Fetch-User`) |
| `LOCH_RUNTIME_LOG_LEVEL` | `--log-level` | `info` | `debug`, `info`, `warn`, `error` |

## Identifiants {#credentials}

Définissez une seule source de jeton bearer au plus, et une seule source pour la paire SigV4. Authentification activée, au moins un identifiant est obligatoire. Voir [Authentification](../guides/authentication.md).

| Variable | Option | Description |
|---|---|---|
| `LOCH_RUNTIME_TOKEN_SHA256` | aucune | SHA-256 hexadécimal du jeton bearer, 64 caractères (recommandé) |
| `LOCH_RUNTIME_TOKEN_SHA256_FILE` | `--token-sha256-file` | Fichier qui le contient |
| `LOCH_RUNTIME_TOKEN` | aucune | Jeton bearer en clair, au moins 32 caractères ASCII imprimables, sans espace (lisible par la fonction) |
| `LOCH_RUNTIME_TOKEN_FILE` | `--token-file` | Fichier qui contient le jeton bearer en clair |
| `LOCH_RUNTIME_ACCESS_KEY` | aucune | `<access key id>:<secret>` pour SigV4 (lisible par la fonction) |
| `LOCH_RUNTIME_ACCESS_KEY_FILE` | `--access-key-file` | Fichier qui contient `<access key id>:<secret>` |

Fichiers : chemins absolus, fichiers ordinaires de 4 Kio au plus, relus sur SIGHUP, refusés si l'utilisateur du runtime pourrait les modifier.

## Variables de la fonction {#function}

La fonction se configure avec les variables AWS.

| Variable | Défaut | Description |
|---|---|---|
| `AWS_LAMBDA_FUNCTION_NAME` | `function` | Nom accepté dans l'URL d'Invoke. 1 à 64 lettres, chiffres, `-` ou `_` |
| `AWS_LAMBDA_FUNCTION_VERSION` | `$LATEST` | Version transmise à la fonction |
| `AWS_LAMBDA_FUNCTION_TIMEOUT` | `300` | Timeout en secondes, jusqu'à 86400. Une convention du RIE, pas une variable AWS |
| `AWS_LAMBDA_FUNCTION_MEMORY_SIZE` | la limite mémoire du cgroup, sinon `3008` | Mémoire en Mo, indiquée dans `REPORT` et à la fonction |
| `AWS_REGION` | `AWS_DEFAULT_REGION`, sinon `us-east-1` | Région de l'ARN de la fonction |
| `AWS_LAMBDA_LOG_FORMAT` | `Text` | `JSON` écrit les lignes de log de plateforme en JSON |

## Environnement du bootstrap {#child-env}

Le bootstrap hérite de l'environnement du conteneur, avec ces changements :

| Variables | Changement |
|---|---|
| `AWS_LAMBDA_RUNTIME_API` | Toujours fixée à l'adresse de l'API Runtime |
| `AWS_LAMBDA_MAX_CONCURRENCY` | Toujours retirée, avec un avertissement |
| `LOCH_RUNTIME_*` | Toujours retirées |
| `AWS_LAMBDA_FUNCTION_NAME`, `AWS_LAMBDA_FUNCTION_VERSION`, `AWS_LAMBDA_FUNCTION_MEMORY_SIZE`, `AWS_LAMBDA_LOG_GROUP_NAME`, `AWS_LAMBDA_LOG_STREAM_NAME`, `AWS_REGION`, `AWS_DEFAULT_REGION`, `AWS_LAMBDA_INITIALIZATION_TYPE`, `AWS_XRAY_CONTEXT_MISSING`, `LAMBDA_TASK_ROOT`, `LAMBDA_RUNTIME_DIR` | Définies si absentes |

Aucun identifiant n'est jamais inventé : `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` et `AWS_SESSION_TOKEN` viennent uniquement de votre environnement.

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
