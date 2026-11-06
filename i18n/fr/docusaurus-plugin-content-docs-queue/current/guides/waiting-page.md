---
sidebar_position: 2
title: Page d'attente et traductions
description: Remplacez la page d'attente par votre propre modèle HTML et ajoutez ou modifiez les langues dans lesquelles elle s'affiche.
---

# Page d'attente et traductions

La page d'attente est un modèle HTML lu par Traefik, dont les textes viennent d'un fichier de traductions JSON. Partez des fichiers du dépôt : `public/queue-page.html` et `public/translations.json`.

## Personnaliser le modèle

1. Copiez `public/queue-page.html` et modifiez-le (style, logo, textes).
2. Montez-le dans le conteneur Traefik, à `/var/public/queue-page.html` ou au chemin indiqué dans `queuePageFile`.
3. Redémarrez Traefik.

Le modèle utilise la syntaxe Go `html/template` avec les délimiteurs `[[ ]]`, ce qui laisse `{{ }}` libre pour vos propres scripts :

```html
<p>[[.Translations.YourPosition]]: [[.QueueData.Position]] / [[.QueueData.QueueSize]]</p>
<meta http-equiv="refresh" content="[[.QueueData.RefreshInterval]]">
<div>[[ printf .Translations.RefreshTime .QueueData.RefreshInterval | safeHtml ]]</div>
```

Gardez un rechargement automatique basé sur `[[.QueueData.RefreshInterval]]` : un visiteur n'entre qu'en envoyant une nouvelle requête.

| Variable | Contenu |
|---|---|
| `.QueueData.Position` | Position dans la file, à partir de 1 |
| `.QueueData.QueueSize` | Nombre de visiteurs dans la file |
| `.QueueData.EstimatedWaitTime` | Attente approximative, en minutes |
| `.QueueData.ProgressPercentage` | Progression, de 0 à 100 |

Toutes les variables : [Référence du modèle](../reference/template.md).

Le modèle est lu au démarrage du middleware. Si le fichier est absent ou invalide, les visiteurs reçoivent une page intégrée en anglais ; un fichier absent est relu à la page d'attente suivante, il suffit donc de le monter plus tard.

## Modifier ou ajouter une langue

Le fichier de traductions contient une entrée par code de langue à deux lettres. Il fournit `en`, `fr`, `es`, `de`, `pt` et `it`.

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

- La langue vient de la première entrée de l'en-tête `Accept-Language` du navigateur (`fr-FR` donne `fr`). Sans cet en-tête, `en` est utilisé.
- Une langue absente du fichier donne une page aux textes vides : il n'y a pas de repli sur `en`. Gardez toutes les langues que vos visiteurs peuvent utiliser.
- `refreshTime` contient `%d` (le nombre de secondes) et peut contenir du HTML. L'élément `countdown` est celui que la page par défaut décompte.
- Le fichier est lu au démarrage du middleware : redémarrez Traefik après l'avoir modifié.

## Code de réponse et type de contenu

La page d'attente est envoyée avec le code `httpResponseCode` (`429` par défaut) et l'en-tête `httpContentType` (`text/html; charset=utf-8`).
