---
sidebar_position: 2
title: Référence de la ligne de commande
description: Les sous-commandes de loch-lambda-runtime (run, health, invoke, version), leurs options et leurs codes de sortie.
---

# Référence de la ligne de commande

```text
loch-lambda-runtime [run] [flags] -- <command> [args...]
loch-lambda-runtime [run] [flags] <handler>     (= /lambda-entrypoint.sh <handler>)
loch-lambda-runtime health [flags]
loch-lambda-runtime invoke [flags] [--timeout <s>] [--log-tail] [--watch-stdin] < event.json
loch-lambda-runtime version
```

`-h` affiche l'usage et toutes les options. Les options `LOCH_RUNTIME_*` (`--queue-size`, …) sont listées dans la [référence de configuration](./configuration.md) ; `health` et `invoke` les acceptent aussi, pour trouver les adresses et les limites.

## run {#run}

La sous-commande par défaut : elle exécute la fonction et sert les API. C'est le point d'entrée du conteneur.

| Forme | Lance |
|---|---|
| `<handler>` | `/lambda-entrypoint.sh <handler>` (ou `LOCH_RUNTIME_BOOTSTRAP`). Un seul argument |
| `-- <command> [args...]` | Cette commande, par exemple l'ENTRYPOINT et le CMD de l'image |

```bash
loch-lambda-runtime --queue-size 32 index.handler
```

Écrivez `run` explicitement si le handler s'appelle littéralement `health`, `invoke` ou `version`. Codes de sortie : 0 après un arrêt propre (SIGTERM, SIGINT), 2 pour une ligne de commande ou une configuration invalide.

## health {#health}

Interroge l'écoute de santé sur la loopback. Affiche le document de santé ; renvoie 0 quand la fonction est prête, 1 sinon. Aucun identifiant nécessaire.

```yaml
healthcheck:
  test: ["CMD", "/loch/lambda-runtime", "health"]
```

Utilisez uniquement cette forme exec, jamais `CMD-SHELL`.

## invoke {#invoke}

Lit un événement sur stdin (6 Mio au plus, en 10 s maximum), invoque la fonction par la loopback sans identifiant, et affiche une enveloppe JSON sur stdout.

| Option | Description |
|---|---|
| `--timeout <s>` | Échéance de l'appel complet, attente en file comprise. Par défaut : timeout de la fonction + `LOCH_RUNTIME_QUEUE_TIMEOUT` + 5 s |
| `--log-tail` | Remplit `logTail` avec les 4 derniers Ko de logs de l'invocation |
| `--watch-stdin` | L'événement est la première valeur JSON sur stdin, terminée par un saut de ligne ; la fermeture de stdin ensuite signifie que l'appelant est parti |

```bash
echo '{"hello":"world"}' | docker exec -i fn /loch/lambda-runtime invoke --log-tail
```

| Champ de l'enveloppe | Contenu |
|---|---|
| `statusCode` | Statut HTTP de l'API Invoke |
| `functionError` | `Unhandled` en cas d'erreur de la fonction, vide sinon |
| `requestId` | Identifiant de requête de l'invocation |
| `durationMs` | Durée de l'appel |
| `payload` | Corps de la réponse, en base64 |
| `logTail` | Logs, en base64 ; vide s'ils ne sont pas demandés |

Codes de sortie : 0 livré (quel que soit le résultat de la fonction), 1 erreur de transport, échéance dépassée ou appelant parti, 2 événement inutilisable.

Docker ne peut pas tuer un processus `docker exec` et garde sa sortie stdout ouverte quand le client s'en va, mais ferme son stdin. Avec `--watch-stdin`, gardez stdin ouvert jusqu'au résultat : `invoke` se termine en moins d'une seconde après sa fermeture.

## version {#version}

Affiche la version du binaire.

```bash
docker exec fn /loch/lambda-runtime version
```

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
