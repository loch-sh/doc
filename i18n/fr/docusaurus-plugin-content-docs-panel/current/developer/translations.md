---
sidebar_position: 5
title: Traductions
description: Modifiez un texte de l'interface de Loch Panel, ajoutez une clé de traduction ou une nouvelle langue.
---

# Traductions

L'interface est traduite avec i18next (react-i18next). L'anglais est la source : les autres langues doivent avoir exactement les mêmes clés.

| Code | Langue |
|---|---|
| `en` | Anglais (source) |
| `fr` | Français |
| `de` | Allemand |
| `es` | Espagnol |
| `it` | Italien |
| `nl` | Néerlandais |
| `pt-PT` / `pt-BR` | Portugais (Portugal / Brésil) |
| `ja` | Japonais |
| `zh-CN` | Chinois simplifié |

## Fichiers

Les traductions sont dans `host-panel-interface/src/i18n/locales/<langue>/<namespace>.json`, un namespace par partie de l'application : `common`, `layout`, `home`, `containers`, `domains`, `cron`, `users`, `sftp`, `hosting`, `databases`, `networks`, `functions`, `apikeys`, `audit`, `errors`.

## Ajouter ou modifier un texte

1. Ajoutez ou modifiez la clé dans le fichier anglais. Les clés sont typées à partir des fichiers anglais : une clé inconnue fait échouer la vérification des types.
2. Ajoutez la même clé dans le même fichier des 9 autres langues.
3. Utilisez-la dans le code avec `t("namespace:key")`. Hors d'un composant, appelez `i18n.t("ns:key")` au moment où le texte est nécessaire, pas au chargement du module.
4. Lancez `yarn i18n:check`.

## Règles vérifiées par `yarn i18n:check`

La vérification tourne aussi en CI.

| Règle | Exemple |
|---|---|
| Mêmes clés que l'anglais dans chaque langue | — |
| Mêmes `{{variables}}` | `"{{count}} containers"` |
| Mêmes balises `<Trans>` | `<code>…</code>`, `<br/>` |
| Les pluriels utilisent les suffixes i18next et définissent au moins `_other` | `_one` / `_other` ; `_many` en `fr`, `es`, `it`, `pt-*` ; `_other` seul en `ja` et `zh-CN` |
| Chaque langue de `SUPPORTED_LANGUAGES` a un dossier, et chaque dossier est déclaré | — |

`{{count}}` peut être omis dans une forme du pluriel (« un élément »).

## Ajouter un namespace

1. Créez `locales/en/<namespace>.json` et le même fichier dans chaque autre langue.
2. Importez le fichier anglais dans `src/i18n/index.ts` et ajoutez-le à l'objet `en`. Les autres langues sont chargées automatiquement.

## Ajouter une langue

Exemple pour le coréen (`ko`) :

1. Copiez `src/i18n/locales/en/` vers `src/i18n/locales/ko/` et traduisez les valeurs. Gardez les clés, les `{{variables}}` et les balises inchangées.
2. Ajoutez `"ko"` à `SUPPORTED_LANGUAGES` dans `src/i18n/index.ts`. Ajoutez une entrée `fallbackLng` si un code de navigateur sans région doit pointer vers un code régional (comme `pt` vers `pt-PT`).
3. Ajoutez les locales date-fns, antd et cronstrue dans `src/i18n/useLocales.ts`.
4. Ajoutez le nom de la langue, écrit dans cette langue, sous `language` dans chaque `common.json`.
5. Lancez `yarn i18n:check` et `yarn build`.

## Bon à savoir

- N'utilisez un code régional que si les variantes diffèrent (`pt-PT` / `pt-BR`) ou si l'écriture compte (`zh-CN`).
- Les codes du navigateur sont rapprochés de la langue la plus proche (`fr-CA` → `fr`) ; les langues non prises en charge basculent sur l'anglais.
- La langue choisie est enregistrée dans `localStorage` (`lang`).
- Les traductions assistées par machine sont acceptées ; l'anglais est obligatoire.
