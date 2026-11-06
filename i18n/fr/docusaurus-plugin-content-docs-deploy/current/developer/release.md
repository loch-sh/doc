---
sidebar_position: 3
title: Processus de release
description: Comment une release de deploy-server est construite et publiée - image GHCR, binaires, SBOM et attestations de provenance.
---

# Processus de release

Pousser un tag `v<major>.<minor>.<patch>[-suffix]` lance `.github/workflows/release.yml` : tests, `go vet` et `govulncheck`, puis l'image et les binaires.

```bash
git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

## Artefacts

| Artefact | Détails |
|---|---|
| Image `ghcr.io/loch-sh/deploy` | `linux/amd64` et `linux/arm64` ; tags `v1.0.0`, `1.0`, `1`, `latest`. Labels et annotations OCI, SBOM, provenance SLSA (`mode=max`) et attestation de provenance GitHub poussées dans le registre |
| `deploy-server_<tag>_linux_amd64.tar.gz`, `..._linux_arm64.tar.gz` | Binaire statique (`CGO_ENABLED=0`), `LICENSE`, `README.md`, `SECURITY.md`, `docker-compose.example.yml`, `examples/`. Chacun avec un fichier `.sha256` et une attestation de provenance, joints à la release GitHub |

Un tag de pré-version (`v1.1.0-rc1`) n'est publié que sous son propre tag : `latest`, `1.1` et `1` ne bougent pas, et la release GitHub est marquée comme pré-version. Les notes de version sont générées à partir des pull requests fusionnées.

## Vérification

```bash
sha256sum -c deploy-server_v1.0.0_linux_amd64.tar.gz.sha256
gh attestation verify deploy-server_v1.0.0_linux_amd64.tar.gz --repo loch-sh/deploy
gh attestation verify oci://ghcr.io/loch-sh/deploy:v1.0.0 --repo loch-sh/deploy
```

## Bon à savoir

- Les actions sont épinglées par SHA de commit ; Dependabot propose chaque semaine des mises à jour des actions, des modules Go et des images de base.
- Les workflows n'ont besoin d'aucun secret : GHCR utilise le `GITHUB_TOKEN` du workflow.
