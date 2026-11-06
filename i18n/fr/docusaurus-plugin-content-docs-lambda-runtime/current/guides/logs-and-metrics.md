---
sidebar_position: 5
title: Logs et métriques
description: Lisez les lignes de log START, END et REPORT de la fonction, passez-les en JSON, vérifiez la santé et collectez les métriques Prometheus.
---

# Logs et métriques

## Logs

Les sorties stdout et stderr de la fonction vont vers la sortie du conteneur, sans mise en tampon. Autour de chaque invocation, le runtime écrit les lignes de plateforme qu'écrit AWS Lambda™ :

```text
START RequestId: 3f2a… Version: $LATEST
END RequestId: 3f2a…
REPORT RequestId: 3f2a…	Duration: 12.34 ms	Billed Duration: 13 ms	Memory Size: 256 MB	Max Memory Used: 61 MB	
```

| Champ | Contenu |
|---|---|
| `Init Duration` | Sur le premier `REPORT` après une init |
| `Status: timeout` | L'invocation a dépassé son timeout ; une ligne `Task timed out after N seconds` précède `END` |
| `Status: error`, `Error Type` | L'invocation a échoué |
| `Max Memory Used` | Le pic du conteneur depuis son démarrage, pas celui de l'invocation |

Avec `AWS_LAMBDA_LOG_FORMAT=JSON`, ces lignes deviennent des enregistrements JSON (`platform.start`, `platform.runtimeDone`, `platform.report`). Les runtimes des images AWS formatent aussi les logs applicatifs d'après cette variable.

Les logs propres au runtime sont en JSON sur stderr. Réglez leur niveau avec `LOCH_RUNTIME_LOG_LEVEL` (`debug`, `info`, `warn`, `error`). Ils ne contiennent jamais d'événement ni de secret.

```bash
docker logs -f fn
```

## Santé

`GET /_loch/health` ne demande aucun identifiant. Il répond 200 `{"status":"ready","queueDepth":0}` quand la fonction est prête, 503 avec `initializing`, `error` ou `stopping` sinon. Dans le conteneur, `/loch/lambda-runtime health` l'interroge et renvoie 0 ou 1.

## Métriques

`GET /_loch/metrics` renvoie le format texte Prometheus. Il demande l'identifiant, sauf depuis la loopback.

```bash
curl -s -H "Authorization: Bearer $TOKEN" localhost:8080/_loch/metrics
```

Séries principales : `loch_lambda_invocations_total{outcome}`, `loch_lambda_invocation_duration_seconds`, `loch_lambda_queue_depth`, `loch_lambda_state{state}`. Liste complète : [référence des métriques](../reference/metrics.md).

## Bon à savoir

- Le code de la fonction peut afficher de fausses lignes `START`, `END` ou `REPORT`. Ne déduisez jamais facturation ni santé des logs : utilisez les métriques, l'enveloppe d'`invoke` ou `/_loch/health`.
- Le runtime ne limite pas le débit des logs : bornez leur volume avec les options du pilote de logs Docker (`max-size`, `max-file`).
- `X-Amz-Log-Type: Tail` (`--log-type Tail` dans l'AWS CLI) renvoie les 4 derniers Ko de logs de l'invocation dans `X-Amz-Log-Result`.

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
