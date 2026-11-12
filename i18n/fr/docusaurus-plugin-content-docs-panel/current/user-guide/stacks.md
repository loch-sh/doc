---
sidebar_position: 3
title: Stacks
description: Voyez une stack compose dans son ensemble, et démarrez, arrêtez ou relancez tous ses conteneurs en un clic.
---

# Stacks

Une stack est un groupe de conteneurs lancés par le même projet compose. Sur la page **Conteneurs**, chaque ligne de stack porte un bouton **Détail de la stack** et les actions de la stack.

<Screenshot id="stack-actions" alt="Des lignes de stack avec le bouton Détail de la stack et les boutons Arrêter, Démarrer et Relancer la stack" />

## Détail d'une stack

Cliquez sur **Détail de la stack** (l'icône info) sur une ligne de stack pour ouvrir son panneau. L'en-tête affiche l'état de la stack (vert : tout tourne, orange : des conteneurs arrêtés, rouge : un conteneur s'est arrêté en erreur) et les actions de la stack.

<Screenshot id="stack-panel" alt="Le panneau d'une stack en plein écran, sur l'onglet Services" />

Sous les tags, quatre chiffres : conteneurs actifs, services, ports publiés et réseaux. Un site hébergé affiche **Ouvrir le site**, un service managé **Ouvrir le service**.

| Onglet | Contenu |
|---|---|
| **Services** | Une ligne par conteneur : service, état, image, ports, **Dépend de**. Cliquez sur l'icône info, ou double-cliquez sur la ligne, pour ouvrir le [détail du conteneur](./containers.md#détail-dun-conteneur) |
| **Compose** | Projet Compose, répertoire de travail, fichiers Compose et version de Compose |
| **Réseaux** | Chaque réseau avec les conteneurs de la stack qui y sont connectés et leurs adresses |
| **Montages** | Les montages de chaque conteneur ; ceux en lecture seule sont signalés |
| **Monitoring** | CPU, RAM, réseau et PIDs en direct des conteneurs démarrés |

Dans **Ports**, un tag vert est publié sur l'hôte (`8081→80/tcp`) ; un tag gris est seulement exposé aux autres conteneurs (`9000/tcp`).

<Screenshot id="stack-panel-compose" alt="L'onglet Compose du panneau d'une stack avec le projet, le répertoire de travail et les fichiers compose" />

Le panneau est construit à partir des labels compose des conteneurs : un conteneur lancé sans compose n'affiche que ce que Docker remonte.

## Agir sur une stack

Sur la ligne de la stack, ou en haut de son panneau, cliquez sur un bouton :

| Bouton | Affiché quand | Confirmation |
|---|---|---|
| **Démarrer la stack** | Au moins un conteneur ne tourne pas | Non |
| **Arrêter la stack** | Au moins un conteneur tourne | Oui |
| **Relancer la stack** | Au moins un conteneur tourne | Oui : ses services sont brièvement indisponibles |

Un message confirme le résultat. Si des conteneurs échouent, il indique combien : par exemple **2 conteneur(s) sur 5 n'ont pas pu être traités**.

## Fonctionnement

- Les conteneurs démarrent dans l'ordre des dépendances (`depends_on`) et s'arrêtent dans l'ordre inverse. Les conteneurs d'un même niveau sont traités en parallèle.
- **Démarrer** ignore les conteneurs déjà démarrés ; **Arrêter** ignore ceux déjà arrêtés.
- Un échec n'arrête pas le traitement des autres conteneurs.
- Avec un profil utilisateur, seuls les conteneurs qui vous sont attribués sont affichés et traités.

## Bon à savoir

- Les conteneurs sous **Sans stack** n'ont pas de projet compose : ils n'ont pas de panneau de stack, agissez sur eux un par un.
- Les conteneurs système et le conteneur de l'API du panel ne sont jamais traités.
- Dans la CLI : `loch stack start`, `loch stack stop` ou `loch stack restart`, avec le nom de la stack ou le namespace actif. Voir la [CLI `loch`](/cli/).
