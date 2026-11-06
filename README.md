# Loch.sh documentation

Source of [docs.loch.sh](https://docs.loch.sh): one versioned documentation per product, in English (main language) and French. Built with Docusaurus 3.

| Product | Source (EN) | French | Versions |
|---|---|---|---|
| Loch Panel | `docs/panel/` | `i18n/fr/docusaurus-plugin-content-docs-panel/current/` | `panel_versioned_docs/` |
| loch CLI | `docs/cli/` | `i18n/fr/docusaurus-plugin-content-docs-cli/current/` | `cli_versioned_docs/` |

## Run locally

Requirements: Node.js 24 (`.nvmrc`) and Yarn 4 (`corepack enable`).

```bash
yarn install
yarn start          # English, http://localhost:3000
yarn start:fr       # French (one locale at a time in dev)
yarn build          # both locales; fails on broken links
yarn serve          # serve the build
```

## Writing rules

- **Short and clear for a human.** One task per page, short steps, one example. No long explanations.
- **Exhaustive detail goes to the reference**, generated from the code when possible (CLI commands, MCP tools, environment variables). It feeds `llms.txt`, `llms-full.txt` and context7.
- English first, then the same page in French, same file name and structure.
- Each page has a `title` and a one-sentence `description` (used by search, `llms.txt` and context7).
- Links between pages: relative paths to the `.md` file (`./install.md`).

## Versions

`docs/<product>/` is the next version ("Next"). At a product release, freeze it:

```bash
yarn version:cli 1.6      # or yarn version:panel 1.3
```

Then copy the French current docs to `i18n/fr/docusaurus-plugin-content-docs-<product>/version-1.6/`. One version per minor release; patches update the frozen version in place.

## Screenshots

Panel screenshots are captured against the interface's mocked API (no server, no real data), for each locale and color scheme:

```bash
INTERFACE_DIR=../../host-panel-group/host-panel-interface yarn screenshots   # all scenes
SCENES=home,hosting-create LOCALES=fr yarn screenshots                      # a subset
```

- Scenes: `screenshots/scenes.ts`; demo data: `screenshots/demo.ts`.
- Output: `static/img/screenshots/panel/next/<locale>/<id>-<light|dark>.png`.
- In a page: `<Screenshot id="hosting-create" alt="The website creation form" />` (no import needed; panel docs only).
- Capture from the release tag or master of the interface, not from a feature branch. When freezing a panel version, copy `panel/next/` to `panel/<version>/`.

## For AI assistants

The build generates `/llms.txt` (index), `/llms-full.txt` (all content) and a `.md` copy of each page. `context7.json` tells context7 what to index.

## CI and hosting

The repository is on GitHub (`loch-sh/doc`). GitHub Actions (`.github/workflows/docs.yml`):

| Job | When |
|---|---|
| Build and link check | Every push and pull request |
| GitHub Pages (`docs.loch.sh`) | Push to `main`, with the repository variable `DEPLOY_PAGES=true` |
| nginx image to `ghcr.io/loch-sh/doc` | Push to `main` |

The public URL comes from `DOCS_URL` and `DOCS_BASE_URL` (default `https://docs.loch.sh` and `/`).

Self-hosting: `docker build -t loch-doc . && docker run -p 8080:80 loch-doc`.
