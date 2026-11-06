# Writing guide

Rules for every page of this repository, written by a human or an agent.

## Audience and tone

- Two readers: the **user** of the panel or CLI, and the **admin** who installs and configures it. Developer pages are for contributors to the Loch Panel code.
- **Short and clear.** One goal per page. The reader should finish the task without scrolling through explanations.
- Second person, imperative: "Create a key", not "The user can create a key".
- Present tense, active voice, short sentences. No marketing words ("powerful", "seamless", "simply").
- Explain *why* only when the reader would otherwise make a mistake (one sentence).

## Page shape

```md
---
sidebar_position: 2
title: Create a website
description: One sentence saying what the page lets the reader do.
---

# Create a website

One or two sentences: what it is, who can do it (admin?), what must be enabled.

## Steps / sections
Numbered steps for a task. A table for options. One example per command.

## Good to know
Up to 5 bullets: limits, pitfalls, security notes.
```

- `title` and `description` are mandatory (search, `llms.txt`, context7).
- Prefer tables for options, scopes, variables. Prefer numbered lists for procedures.
- Code blocks have a language (`bash`, `yaml`, `json`, `toml`, `env`).
- Use admonitions sparingly: `:::warning` only for data loss or security, `:::note` for prerequisites.
- Name UI elements in **bold**, exactly as the interface shows them (English source strings from `host-panel-interface/src/i18n/locales/en`, French from `.../fr`).
- Screenshots (panel only): `<Screenshot id="<scene-id>" alt="..." />`, the scene being declared in `screenshots/scenes.ts` (see README). Only when the picture saves words: a form, a page layout, not every page.

## Exhaustive detail

Human pages stay short. Full lists (every flag, every variable, every scope, every MCP tool) go in a `reference/` page of the same product, linked from the guide ("Full list: [Configuration reference](../reference/configuration.md)"). Reference pages may be long, but stay as tables.

## Accuracy

- Write only what the code or the existing docs confirm. Sources: `host-panel-api/docs/`, the READMEs, `host-panel-cli/cmd/`, `host-panel-interface/src/`.
- The docs describe the `master` branch. Features only on `feature/*` branches (Functions, `function_invoke` jobs, `loch functions`) are out of scope for now.
- Never invent a default value, a flag or a limit. If unsure, leave it out.

## Links

- Within a product: relative path to the file, `./install.md`, `../admin/hosting.md`.
- To another product: absolute route, `/cli/`, `/panel/admin/hosting/`.

## French

- Same file name and same structure under `i18n/fr/docusaurus-plugin-content-docs-<product>/current/`.
- Natural French, not a word-for-word translation. Use the interface's French labels.
- Keep in English: commands, flags, variables, scopes, code identifiers, product names (Loch Panel, Loch CLI).
- Correct French typography: every accent, « » for quotes.

## Versions

`docs/<product>/` is the next version. Frozen versions are created with `yarn version:<product> X.Y` at a release (see README).
