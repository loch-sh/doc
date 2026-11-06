---
sidebar_position: 2
title: Compiler et tester
description: Compilez loch-lambda-runtime depuis les sources et lancez ses tests unitaires et d'intégration.
---

# Compiler et tester

Il vous faut Go et make. Le Makefile fixe la toolchain (`GOTOOLCHAIN=go1.27.3`) ; la commande go la télécharge si besoin. Les tests d'intégration et `make test-linux` nécessitent Docker.

## Compiler

```bash
git clone https://github.com/loch-sh/lambda-runtime.git
cd lambda-runtime
make binaries   # dist/loch-lambda-runtime-linux-amd64 et -arm64
```

## Cibles make

| Cible | Ce qu'elle fait |
|---|---|
| `make build` | Binaire pour la plateforme courante dans `dist/loch-lambda-runtime` |
| `make binaries` | Binaires Linux statiques pour amd64 et arm64 dans `dist/` |
| `make vet` | `go vet`, aussi pour Linux et les tests d'intégration |
| `make test` | Tests unitaires avec le détecteur de concurrence |
| `make test-linux` | Tests unitaires dans un conteneur Linux (groupes de processus, `/proc`) |
| `make cover` | Couverture |
| `make integration` | Tests d'intégration contre les vraies images AWS |
| `make release VERSION=vX.Y.Z` | Binaires, SBOM et `SHA256SUMS` |
| `make reproducible` | Deux builds dans deux répertoires ; échoue si les sommes de contrôle diffèrent |

## Tests d'intégration

`make integration` lance `go test -tags integration` contre les images de base AWS (Node.js, Python, `provided.al2023` avec un bootstrap Go), sous le durcissement de production : invocations concurrentes, timeouts, erreurs, erreurs d'init, OOM, limites de payload, SIGTERM, authentification avec l'AWS CLI et le SDK AWS pour JavaScript. La CI les exécute en amd64 et en arm64.

Les premiers pulls depuis `mirror.gcr.io` peuvent répondre « not found » ou 429 : les tests réessaient.

## CI

GitHub Actions (`.github/workflows/ci.yml`) lance gofmt, vet et les tests unitaires, le build reproductible et les tests d'intégration, en amd64 et en arm64. Les tags de release déclenchent aussi build, attestation, signature et publication : voir [Releases](./releases.md).

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
