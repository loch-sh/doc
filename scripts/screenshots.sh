#!/usr/bin/env sh
# Capture the panel screenshots against the interface's mocked API.
# INTERFACE_DIR: a host-panel-interface checkout with its dependencies installed
# (use the release tag or master, not a feature branch, for published images).
set -eu
cd "$(dirname "$0")/.."
INTERFACE_DIR="${INTERFACE_DIR:-../../host-panel-group/host-panel-interface}"
[ -d "$INTERFACE_DIR/tests/mocks" ] || { echo "No interface checkout at $INTERFACE_DIR (set INTERFACE_DIR)" >&2; exit 1; }
ln -sfn "$(cd "$INTERFACE_DIR" && pwd)" screenshots/.interface
exec npx playwright test -c screenshots/playwright.config.ts "$@"
