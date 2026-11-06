---
sidebar_position: 2
title: Template reference
description: Variables, function and translation keys available in the waiting page template.
---

# Template reference

The waiting page is a Go `html/template` with `[[` and `]]` as delimiters. Values are HTML-escaped unless passed to `safeHtml`. Guide: [Waiting page and translations](../guides/waiting-page.md).

## Queue data

| Variable | Type | Content |
|---|---|---|
| `.QueueData.Position` | int | Position in the queue, from 1 |
| `.QueueData.QueueSize` | int | Number of visitors in the queue |
| `.QueueData.EstimatedWaitTime` | int | Approximate wait, in minutes, at least `minWaitTimeMinutes` |
| `.QueueData.RefreshInterval` | int | `refreshIntervalSeconds` |
| `.QueueData.ProgressPercentage` | int | Share of the queue behind the visitor, from 0 to 100 |
| `.QueueData.DebugInfo` | string | Internal state; empty unless `debug=true` |

The wait time is an approximation: the number of visitors ahead multiplied by a factor between 0.3 and 0.62 minute that depends on the position, rounded up.

## Translations

| Variable | JSON key | Default page use |
|---|---|---|
| `.Translations.PageTitle` | `pageTitle` | `<title>` |
| `.Translations.Title` | `title` | Heading |
| `.Translations.Introduction` | `introduction` | Paragraph under the heading |
| `.Translations.YourPosition` | `yourPosition` | Label of the position |
| `.Translations.ETA` | `eta` | Label of the wait time |
| `.Translations.RefreshTime` | `refreshTime` | Reload message: a `printf` format with `%d`, may contain HTML |
| `.Translations.Mins` | `mins` | Unit after the wait time |

When the language is missing from the file, every translation is empty, and `printf` on an empty `refreshTime` prints `%!(EXTRA int=20)`.

## Function

| Function | Role |
|---|---|
| `safeHtml` | Outputs a string without escaping. Use it only on your own texts |

```html
[[ printf .Translations.RefreshTime .QueueData.RefreshInterval | safeHtml ]]
```

## Built-in page

When the template file is missing or cannot be parsed, the plugin serves a built-in English page with the same data, without translations.
