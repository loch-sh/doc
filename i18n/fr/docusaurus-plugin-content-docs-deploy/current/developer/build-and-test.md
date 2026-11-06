---
sidebar_position: 2
title: Compilation et tests
description: Compiler deploy-server et son image de conteneur depuis les sources, et lancer la suite de tests.
---

# Compilation et tests

:::note
Nécessite Go 1.27.3 ou plus récent (directive `go` de `go.mod` ; `GOTOOLCHAIN=auto` le télécharge). Docker avec buildx est nécessaire pour l'image.
:::

## Compilation

```bash
git clone https://github.com/loch-sh/deploy.git && cd deploy
CGO_ENABLED=0 go build -trimpath -ldflags="-s -w -X main.version=dev" -o deploy-server .
./deploy-server -version
```

## Tests

```bash
go test -race -cover ./...
```

La suite n'a besoin ni de Docker ni de GitLab : `internal/testutil` fournit un faux binaire `docker` (placé en tête du `PATH`, il enregistre ses arguments et affiche des fixtures pour `docker ps` et `docker inspect`) et un faux émetteur OIDC GitLab (découverte, JWKS, jetons RS256). Chaque package est maintenu à 80 % de couverture ou plus.

La CI (`.github/workflows/ci.yml`) tourne sur les pushs vers `main` et sur les pull requests : `gofmt`, `go vet`, `go test -race`, `govulncheck`, puis une compilation de l'image `linux/amd64` qui n'est pas publiée.

## Image Docker

```bash
docker build --build-arg VERSION=dev -t deploy-server:dev .
```

| Argument de build | Effet |
|---|---|
| `VERSION` | Version embarquée, affichée par `-version` et dans le journal `deploy-server starting`. Par défaut `dev` |
| `TARGETARCH` | Défini par `docker buildx` pour `linux/amd64` et `linux/arm64` |

L'image d'exécution est une Alpine 3.24.3 avec la CLI docker et le plugin Compose copiés depuis `docker:29.9.2-cli` ; buildx n'est pas installé. Chaque image de base est épinglée par tag et par digest. Pour en mettre une à jour, changez le tag et rafraîchissez le digest :

```bash
docker buildx imagetools inspect <image>:<tag> --format '{{json .Manifest.Digest}}'
```
