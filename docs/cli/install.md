---
sidebar_position: 2
title: Install
description: Install the loch binary on macOS or Linux, or build it from source.
---

# Install

## macOS

The universal binary runs on Intel and Apple Silicon. It is signed and notarized.

```bash
curl -L -o loch https://lab.nitrique.net/api/v4/projects/299/packages/generic/loch/v1.5.0/loch-darwin-universal
chmod +x loch
sudo mv loch /usr/local/bin/
```

If macOS blocks a binary downloaded with a browser:

```bash
xattr -d com.apple.quarantine /usr/local/bin/loch
```

## Linux

```bash
ARCH=amd64   # or arm64
curl -L -o loch https://lab.nitrique.net/api/v4/projects/299/packages/generic/loch/v1.5.0/loch-linux-$ARCH
chmod +x loch
sudo mv loch /usr/local/bin/
```

## Updates

`loch` updates itself every 12 hours. To update now:

```bash
loch update
```

## Build from source

```bash
go build -ldflags "-X loch/cmd.Version=1.5.0" -o loch .
```
