---
sidebar_position: 1
slug: /
title: Loch Queue Manager
description: Un plugin middleware Traefik qui limite le nombre de visiteurs simultanés d'un service et place les autres dans une salle d'attente, dans leur ordre d'arrivée.
---

# Loch Queue Manager

Loch Queue Manager est un plugin middleware pour Traefik v3 (testé avec Traefik v3.6). Il laisse un nombre fixé de visiteurs utiliser un service en même temps et affiche aux autres une page d'attente jusqu'à ce qu'une place se libère.

![La page d’attente : position 12 sur 40, environ 5 minutes d’attente](/img/screenshots/queue/next/fr/queue-page.png)

## Fonctionnement

1. Chaque visiteur reçoit un identifiant : un cookie (`loch-queue-id` par défaut) ou une empreinte de son adresse IP et de son User-Agent.
2. Tant que moins de `maxEntries` visiteurs sont actifs, un nouveau visiteur passe directement et devient actif.
3. Quand le service est plein, le visiteur rejoint une file FIFO et reçoit la page d'attente avec le code HTTP `429`. La page se recharge toute seule toutes les 20 secondes.
4. Toutes les 30 secondes, le plugin retire les visiteurs actifs inactifs depuis plus de 60 secondes et fait entrer la tête de la file.

Toutes ces valeurs se configurent : [Référence de la configuration](./reference/configuration.md).

## Fonctionnalités

- Plafond de visiteurs simultanés, avec délai d'inactivité et durée maximale de session facultative.
- Page d'attente construite depuis votre propre modèle HTML, avec la position, la taille de la file, un temps d'attente approximatif et une barre de progression.
- Textes de la page en anglais, français, espagnol, allemand, portugais et italien, choisis d'après l'en-tête `Accept-Language` du navigateur.
- Réponse JSON au lieu du HTML pour les clients qui envoient `Accept: application/json`.
- Limite de débit par IP pour les requêtes sans le cookie de la file.

## Étapes suivantes

1. [Installez le plugin](./install.md) et ajoutez le middleware à un routeur.
2. [Dimensionnez la capacité et les délais](./guides/capacity.md).
3. [Personnalisez la page d'attente](./guides/waiting-page.md).
4. Lisez les [limites](./guides/good-to-know.md) avant la mise en production.

## À propos et licence

Loch Queue Manager est publié sous licence Apache 2.0. Code source : [github.com/loch-sh/traefik-queue](https://github.com/loch-sh/traefik-queue).

Extrait du fichier `NOTICE` (texte original en anglais) :

> Loch Queue Manager
> Copyright 2025 Loch.sh
>
> This product is a derivative work of Traefik Queue Manager
> (https://github.com/hhftechnology/traefik-queue-manager),
> developed by HHF Technology and licensed under the Apache License, Version 2.0.
>
> The original source files have been modified by Loch.sh. Changes include,
> among others: renaming of the Go package and module, split of the code into
> multiple files, JSON API responses and rate limiting.

En résumé : Loch Queue Manager est une œuvre dérivée de Traefik Queue Manager, développé par HHF Technology sous licence Apache 2.0, et modifiée par Loch.sh (renommage du paquet et du module Go, découpage du code en plusieurs fichiers, réponses JSON et limite de débit).
