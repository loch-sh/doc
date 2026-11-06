---
sidebar_position: 4
title: Référence des métriques
description: Chaque métrique Prometheus servie sur /_loch/metrics, avec son type et ses labels.
---

# Référence des métriques

`GET /_loch/metrics` sert le format texte Prometheus sur le port de l'API Invoke. Il demande l'identifiant, sauf depuis la loopback. En SigV4, signez le `GET` sur un corps vide. Les labels ne portent que des valeurs fixes, jamais le contenu d'un événement ni un secret.

| Métrique | Type | Labels | Description |
|---|---|---|---|
| `loch_lambda_runtime_info` | gauge | `version` | Version du runtime, toujours 1 |
| `loch_lambda_invocations_total` | counter | `outcome` : `success`, `error`, `timeout`, `exit`, `oom`, `too_large`, `init_error`, `throttled` | Invocations par résultat. `throttled` compte les réponses 429 |
| `loch_lambda_invocation_duration_seconds` | histogram | | Durée des invocations exécutées par le bootstrap, intervalles de 1 ms à 15 min |
| `loch_lambda_auth_failures_total` | counter | | Requêtes refusées à cause de leur identifiant |
| `loch_lambda_inits_total` | counter | `result` : `success`, `failure` | Inits du bootstrap |
| `loch_lambda_init_duration_seconds` | histogram | | Durée des inits |
| `loch_lambda_queue_depth` | gauge | | Invocations en attente |
| `loch_lambda_queue_depth_max` | gauge | | Plus grand nombre d'invocations en attente depuis le démarrage |
| `loch_lambda_memory_peak_bytes` | gauge | | Pic mémoire du conteneur (`memory.peak` du cgroup) ; absente si illisible |
| `loch_lambda_state` | gauge | `state` : `initializing`, `ready`, `error`, `stopping` | 1 pour l'état courant, 0 pour les autres |

Chaque valeur d'`outcome` et de `state` est exposée dès le démarrage, à 0.

Exemple d'alerte : `increase(loch_lambda_invocations_total{outcome=~"timeout|oom"}[5m]) > 0`.

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
