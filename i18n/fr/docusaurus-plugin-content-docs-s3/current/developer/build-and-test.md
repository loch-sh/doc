---
sidebar_position: 2
title: Compiler et tester
description: Compiler les binaires et l'image Docker de Loch S3 depuis les sources et lancer les tests.
---

# Compiler et tester

:::note
Nécessite une chaîne Rust stable récente (le crate utilise l'édition 2024). Docker est requis pour l'image, [`cross`](https://github.com/cross-rs/cross) pour les compilations croisées Linux et Windows.
:::

## Compiler

```bash
git clone https://github.com/loch-sh/s3.git && cd s3
cargo build --release
./target/release/s3
```

La compilation produit deux binaires : `s3` (le serveur) et `loch-s3` (la CLI des utilisateurs).

## Tester

```bash
cargo test                  # tests unitaires et d'intégration
cargo test test_name        # un seul test
```

Les tests d'intégration de `tests/integration.rs` démarrent un vrai serveur sur un port aléatoire et l'appellent avec `reqwest`.

## Compilations croisées

| Commande | Cible |
|---|---|
| `make linux-amd64` | `x86_64-unknown-linux-musl` |
| `make linux-arm64` | `aarch64-unknown-linux-musl` |
| `make windows-amd64` | `x86_64-pc-windows-gnu` |
| `make macos-amd64` | `x86_64-apple-darwin` (sur macOS) |
| `make macos-arm64` | `aarch64-apple-darwin` (sur macOS) |
| `make all` | Toutes les cibles ci-dessus |

Le binaire du serveur est déposé dans `dist/<platform>/`.

## Image Docker

```bash
make docker                  # image pour l'architecture locale
make docker-multiplatform    # amd64 + arm64, sans push
```

## Releases

La CI lance les tests sur chaque branche et chaque tag. Un tag compile les archives, publie la release GitHub et pousse l'image multi-arch sur `ghcr.io/loch-sh/s3`.
