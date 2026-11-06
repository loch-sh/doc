---
sidebar_position: 3
title: Releases
description: Comment une release est construite de façon reproductible, décrite par un SBOM, signée avec cosign et attestée par GitHub.
---

# Releases

Une release comprend deux binaires statiques (`linux/amd64`, `linux/arm64`), un SBOM CycloneDX par binaire, `SHA256SUMS` sur ces quatre fichiers, et une signature cosign de `SHA256SUMS`. Pour en vérifier une, voir [Installation](../install.md#download-and-verify).

## Build reproductible

Deux builds du même arbre et de la même version donnent les mêmes octets.

- Toolchain exacte : `GOTOOLCHAIN=go1.27.3`.
- `CGO_ENABLED=0`, `GOAMD64=v1`, `GOARM64=v8.0`, un `GOFLAGS` vide, `-trimpath`, `-buildvcs=false`, `-ldflags '-s -w -buildid= -X main.version=<VERSION>'` : ni chemin, ni build id, ni empreinte VCS, ni date dans le binaire.
- Sommes des modules vérifiées auprès de `sum.golang.org`.

Pour le vérifier :

```bash
make reproducible VERSION=v1.0.1
```

## SBOM

`make sbom` lance syft (fixé par digest, sans réseau) sur chaque binaire et écrit `<binary>.cdx.json`. Son numéro de série et son horodatage sont retirés : les SBOM sont reproductibles eux aussi. La version du module y apparaît comme `UNKNOWN`, à cause de `-buildvcs=false` : la version de la release figure dans le nom du fichier.

## Signature et provenance

Sur un tag `vX.Y.Z`, GitHub Actions construit la release, puis :

- signe `SHA256SUMS` avec cosign, en keyless : un certificat de courte durée délivré par Fulcio pour l'identité du workflow, inscrit dans Rekor (`SHA256SUMS.cosign.bundle`) ;
- atteste la provenance du build de chaque fichier (`actions/attest-build-provenance`), qui le lie au workflow, au commit et au tag ;
- publie la release GitHub après avoir vérifié les sommes de contrôle et la signature.

Pour accepter toutes les releases d'une version majeure, vérifiez avec une expression régulière ancrée au lieu de l'identité exacte :

```bash
cosign verify-blob SHA256SUMS --bundle SHA256SUMS.cosign.bundle \
  --certificate-identity-regexp '^https://github\.com/loch-sh/lambda-runtime/\.github/workflows/ci\.yml@refs/tags/v1\.[0-9]+\.[0-9]+$' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

## Bon à savoir

- `make release` refuse une version qui n'a pas la forme `vX.Y.Z[-suffix]`, des fichiers non commités ou non suivis, et un HEAD qui ne porte pas le tag de la version.
- La CI refuse un tag dont le commit n'est pas sur `main`.

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
