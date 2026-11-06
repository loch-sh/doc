---
sidebar_position: 2
title: Waiting page and translations
description: Replace the waiting page with your own HTML template and add or edit the languages it is shown in.
---

# Waiting page and translations

The waiting page is an HTML template read by Traefik, with texts taken from a JSON translations file. Start from the files of the repository: `public/queue-page.html` and `public/translations.json`.

## Customize the template

1. Copy `public/queue-page.html` and edit it (style, logo, texts).
2. Mount it in the Traefik container, at `/var/public/queue-page.html` or at the path set in `queuePageFile`.
3. Restart Traefik.

The template uses Go `html/template` syntax with `[[ ]]` delimiters, so that `{{ }}` stays free for your own scripts:

```html
<p>[[.Translations.YourPosition]]: [[.QueueData.Position]] / [[.QueueData.QueueSize]]</p>
<meta http-equiv="refresh" content="[[.QueueData.RefreshInterval]]">
<div>[[ printf .Translations.RefreshTime .QueueData.RefreshInterval | safeHtml ]]</div>
```

Keep an automatic reload based on `[[.QueueData.RefreshInterval]]`: a visitor only gets in by sending a new request.

| Variable | Content |
|---|---|
| `.QueueData.Position` | Position in the queue, from 1 |
| `.QueueData.QueueSize` | Number of visitors in the queue |
| `.QueueData.EstimatedWaitTime` | Approximate wait, in minutes |
| `.QueueData.ProgressPercentage` | Progress, from 0 to 100 |

Every variable: [Template reference](../reference/template.md).

The template is read when the middleware starts. If the file is missing or invalid, visitors get a built-in English page; a missing file is read again on the next waiting page, so mounting it later is enough.

## Edit or add a language

The translations file has one entry per two-letter language code. It ships `en`, `fr`, `es`, `de`, `pt` and `it`.

```json
{
  "nl": {
    "pageTitle": "Wachtrij - even geduld",
    "title": "U staat in de wachtrij",
    "introduction": "Er is momenteel veel vraag naar onze diensten. U wordt automatisch doorgestuurd zodra u aan de beurt bent.",
    "yourPosition": "Uw positie",
    "eta": "Geschatte wachttijd",
    "refreshTime": "Deze pagina wordt over <span id=\"countdown\">%d</span> seconden vernieuwd",
    "mins": "min."
  }
}
```

- The language comes from the first entry of the browser's `Accept-Language` header (`fr-FR` gives `fr`). Without the header, `en` is used.
- A language missing from the file gives a page with empty texts: there is no fallback to `en`. Keep every language your visitors may use.
- `refreshTime` contains `%d` (the number of seconds) and may contain HTML. The `countdown` element is the one the default page counts down.
- The file is read when the middleware starts: restart Traefik after editing it.

## Response code and content type

The waiting page is sent with the `httpResponseCode` status (`429` by default) and the `httpContentType` header (`text/html; charset=utf-8`).
