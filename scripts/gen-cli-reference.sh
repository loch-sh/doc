#!/usr/bin/env sh
# Regenerate the loch command reference from the CLI's Cobra tree.
# LOCH_CLI_DIR: a host-panel-cli checkout (release tag or main) that has `loch docs gen`.
set -eu
cd "$(dirname "$0")/.."
LOCH_CLI_DIR="${LOCH_CLI_DIR:-../../host-panel-group/host-panel-cli}"
OUT="docs/cli/reference/commands"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
(cd "$LOCH_CLI_DIR" && go build -o "$tmp/loch" .)
find "$OUT" -name 'loch*.md' -delete 2>/dev/null || true
mkdir -p "$OUT"
"$tmp/loch" docs gen "$OUT"
# Flat sidebar: label each page with its command path ("hosting create"), not just "create".
for f in "$OUT"/loch*.md; do
  label="$(sed -n 's/^title: "loch \(.*\)"$/\1/p' "$f" | head -1)"
  [ -n "$label" ] && sed -i.bak "s/^sidebar_label: .*/sidebar_label: \"$label\"/" "$f" && rm "$f.bak"
done
echo "$(ls "$OUT"/loch*.md | wc -l | tr -d ' ') command pages in $OUT"
