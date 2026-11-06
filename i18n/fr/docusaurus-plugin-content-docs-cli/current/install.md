---
sidebar_position: 2
title: Installation
description: Installer le binaire loch sur macOS ou Linux, ou le compiler depuis les sources.
---

# Installation

## macOS

Le binaire universel fonctionne sur Intel et Apple Silicon. Il est signé et notarisé.

```bash
curl -L -o loch https://lab.nitrique.net/api/v4/projects/299/packages/generic/loch/v1.5.0/loch-darwin-universal
chmod +x loch
sudo mv loch /usr/local/bin/
```

Si macOS bloque un binaire téléchargé avec un navigateur :

```bash
xattr -d com.apple.quarantine /usr/local/bin/loch
```

## Linux

```bash
ARCH=amd64   # ou arm64
curl -L -o loch https://lab.nitrique.net/api/v4/projects/299/packages/generic/loch/v1.5.0/loch-linux-$ARCH
chmod +x loch
sudo mv loch /usr/local/bin/
```

## Mises à jour

`loch` se met à jour toute seule toutes les 12 heures. Pour mettre à jour tout de suite :

```bash
loch update
```

## Compiler depuis les sources

```bash
go build -ldflags "-X loch/cmd.Version=1.5.0" -o loch .
```
