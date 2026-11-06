---
sidebar_position: 5
title: Translations
description: Update a text of the Loch Panel interface, add a translation key or add a new language.
---

# Translations

The interface is translated with i18next (react-i18next). English is the source: the other languages must have exactly the same keys.

| Code | Language |
|---|---|
| `en` | English (source) |
| `fr` | French |
| `de` | German |
| `es` | Spanish |
| `it` | Italian |
| `nl` | Dutch |
| `pt-PT` / `pt-BR` | Portuguese (Portugal / Brazil) |
| `ja` | Japanese |
| `zh-CN` | Simplified Chinese |

## Files

Translations live in `host-panel-interface/src/i18n/locales/<language>/<namespace>.json`, one namespace per area of the app: `common`, `layout`, `home`, `containers`, `domains`, `cron`, `users`, `sftp`, `hosting`, `databases`, `networks`, `apikeys`, `audit`, `errors`.

## Add or change a text

1. Add or change the key in the English file. Keys are typed from the English files: an unknown key fails the type-check.
2. Add the same key to the same file in the 9 other languages.
3. Use it in the code with `t("namespace:key")`. Outside a component, call `i18n.t("ns:key")` when the text is needed, not when the module loads.
4. Run `yarn i18n:check`.

## Rules checked by `yarn i18n:check`

The check also runs in CI.

| Rule | Example |
|---|---|
| Same keys as English in every language | — |
| Same `{{placeholders}}` | `"{{count}} containers"` |
| Same `<Trans>` tags | `<code>…</code>`, `<br/>` |
| Plurals use i18next suffixes and define at least `_other` | `_one` / `_other`; `_many` in `fr`, `es`, `it`, `pt-*`; `_other` only in `ja` and `zh-CN` |
| Every language of `SUPPORTED_LANGUAGES` has a folder, and every folder is declared | — |

`{{count}}` may be left out of one plural form ("one item").

## Add a namespace

1. Create `locales/en/<namespace>.json` and the same file in every other language.
2. Import the English file in `src/i18n/index.ts` and add it to the `en` object. The other languages are loaded automatically.

## Add a language

Example for Korean (`ko`):

1. Copy `src/i18n/locales/en/` to `src/i18n/locales/ko/` and translate the values. Keep the keys, `{{placeholders}}` and tags unchanged.
2. Add `"ko"` to `SUPPORTED_LANGUAGES` in `src/i18n/index.ts`. Add a `fallbackLng` entry if a bare browser code must map to a regional one (as `pt` maps to `pt-PT`).
3. Add the date-fns, antd and cronstrue locales in `src/i18n/useLocales.ts`.
4. Add the language name, written in that language, under `language` in every `common.json`.
5. Run `yarn i18n:check` and `yarn build`.

## Good to know

- Use a regional code only when variants differ (`pt-PT` / `pt-BR`) or the script matters (`zh-CN`).
- Browser codes resolve to the closest match (`fr-CA` → `fr`); unsupported languages fall back to English.
- The chosen language is stored in `localStorage` (`lang`).
- Machine-assisted translations are accepted; English is required.
