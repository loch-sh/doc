---
sidebar_position: 1
title: Architecture
description: L'organisation du code source de Loch Lambda Runtime et le rôle de chaque package.
---

# Architecture

Loch Lambda Runtime est un module Go (`github.com/loch-sh/lambda-runtime`) sans dépendance hors de la bibliothèque standard. Source : [github.com/loch-sh/lambda-runtime](https://github.com/loch-sh/lambda-runtime).

## Organisation

| Chemin | Rôle |
|---|---|
| `cmd/loch-lambda-runtime` | `main` : rend d'abord le processus non dumpable, puis lance la sous-commande |
| `internal/app` | Assemble les composants dans les sous-commandes (`run`, `health`), les limites de connexions et le rechargement des identifiants |
| `internal/config` | Analyse et valide la ligne de commande, les réglages `LOCH_RUNTIME_*`, les variables de la fonction et l'environnement du bootstrap |
| `internal/engine` | Exécute le bootstrap et lui transmet une invocation à la fois : init, timeouts, résultats, réinitialisation, arrêt |
| `internal/runtimeapi` | L'API Runtime d'AWS Lambda™ (`2018-06-01`) servie au bootstrap |
| `internal/invokeapi` | L'API Invoke, les points d'accès de santé et de métriques, le filtre navigateur, les plafonds par IP, les formes d'erreur |
| `internal/auth` | Authentification bearer et SigV4, fichiers d'identifiants et leurs vérifications |
| `internal/queue` | La file FIFO bornée des invocations en attente |
| `internal/process` | Lance le bootstrap comme processus enfant, devoirs du PID 1 |
| `internal/cgroup` | Lit le cgroup du conteneur (limite mémoire, pic, OOM kills) |
| `internal/logs` | Relaie la sortie du bootstrap, écrit les lignes de plateforme, conserve les fins de logs |
| `internal/metrics` | Collecte les chiffres et écrit le format Prometheus |
| `internal/invokecli` | La sous-commande `invoke` |
| `internal/ids`, `internal/netutil` | Identifiants de requête et de trace ; utilitaires réseau |
| `internal/release` | Tests de l'outillage de release (le Makefile) |
| `integration/` | Tests d'intégration contre les vraies images AWS, sous Docker |

## Parcours d'une requête

1. Un appelant envoie `POST /2015-03-31/functions/{name}/invocations` à `invokeapi`.
2. `invokeapi` filtre les navigateurs, applique les plafonds, authentifie, lit le corps et met l'invocation en file.
3. `engine` la dépile quand le bootstrap demande l'invocation suivante à `runtimeapi`.
4. Le bootstrap poste la réponse ou l'erreur ; `engine` détermine le résultat (erreur, timeout, OOM, arrêt) et répond à l'appelant.
5. `logs` écrit `START`, `END` et `REPORT` ; `metrics` compte le résultat.

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
