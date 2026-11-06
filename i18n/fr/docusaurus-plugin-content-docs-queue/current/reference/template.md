---
sidebar_position: 2
title: Référence du modèle
description: Variables, fonction et clés de traduction disponibles dans le modèle de la page d'attente.
---

# Référence du modèle

La page d'attente est un modèle Go `html/template` avec `[[` et `]]` comme délimiteurs. Les valeurs sont échappées en HTML, sauf si elles passent par `safeHtml`. Guide : [Page d'attente et traductions](../guides/waiting-page.md).

## Données de la file

| Variable | Type | Contenu |
|---|---|---|
| `.QueueData.Position` | int | Position dans la file, à partir de 1 |
| `.QueueData.QueueSize` | int | Nombre de visiteurs dans la file |
| `.QueueData.EstimatedWaitTime` | int | Attente approximative, en minutes, au moins `minWaitTimeMinutes` |
| `.QueueData.RefreshInterval` | int | `refreshIntervalSeconds` |
| `.QueueData.ProgressPercentage` | int | Part de la file derrière le visiteur, de 0 à 100 |
| `.QueueData.DebugInfo` | string | État interne ; vide sauf avec `debug=true` |

Le temps d'attente est une approximation : le nombre de visiteurs devant multiplié par un facteur compris entre 0,3 et 0,62 minute qui dépend de la position, arrondi au supérieur.

## Traductions

| Variable | Clé JSON | Usage dans la page par défaut |
|---|---|---|
| `.Translations.PageTitle` | `pageTitle` | `<title>` |
| `.Translations.Title` | `title` | Titre |
| `.Translations.Introduction` | `introduction` | Paragraphe sous le titre |
| `.Translations.YourPosition` | `yourPosition` | Libellé de la position |
| `.Translations.ETA` | `eta` | Libellé du temps d'attente |
| `.Translations.RefreshTime` | `refreshTime` | Message de rechargement : un format `printf` avec `%d`, peut contenir du HTML |
| `.Translations.Mins` | `mins` | Unité après le temps d'attente |

Quand la langue est absente du fichier, toutes les traductions sont vides, et `printf` sur un `refreshTime` vide affiche `%!(EXTRA int=20)`.

## Fonction

| Fonction | Rôle |
|---|---|
| `safeHtml` | Affiche une chaîne sans l'échapper. À réserver à vos propres textes |

```html
[[ printf .Translations.RefreshTime .QueueData.RefreshInterval | safeHtml ]]
```

## Page intégrée

Quand le fichier du modèle est absent ou ne peut pas être analysé, le plugin sert une page intégrée en anglais avec les mêmes données, sans traductions.
