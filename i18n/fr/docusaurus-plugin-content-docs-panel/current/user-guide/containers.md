---
sidebar_position: 2
title: Gérer les conteneurs
description: Trouvez un conteneur, démarrez-le ou arrêtez-le, lisez ses logs, ouvrez un terminal et suivez sa consommation.
---

# Gérer les conteneurs

La page **Conteneurs** (menu **Compute**) liste les conteneurs auxquels vous avez accès, regroupés par stack compose. Chaque utilisateur peut l'utiliser, sur les conteneurs qui lui sont attribués.

<Screenshot id="containers-list" alt="La page Conteneurs avec ses filtres et une stack dépliée" />

## Trouver un conteneur

| Contrôle | Effet |
|---|---|
| **Rechercher un conteneur, une stack...** | Filtre par nom de conteneur ou de stack |
| **Type de stack** | **Tous**, **Hébergements**, **Services** ou **Autres** |
| **Actifs** / **Tous** | Masque ou affiche les stacks sans conteneur démarré |
| **Erreurs** | N'affiche que les stacks dont un conteneur s'est arrêté anormalement |

Cliquez sur la ligne d'une stack pour la déplier et voir ses conteneurs. Les conteneurs sans projet compose sont regroupés sous **Sans stack**.

## Actions sur un conteneur

La colonne **Actions** affiche les boutons qui correspondent à l'état du conteneur.

| Bouton | Affiché quand | Confirmation |
|---|---|---|
| **Démarrer** | Le conteneur ne tourne pas | Non |
| **Relancer** | Le conteneur tourne | Non |
| **Arrêter** | Le conteneur n'est pas arrêté | Oui |
| **Tuer** | Le conteneur n'est pas arrêté | Oui : arrêt immédiat, sans arrêt propre |
| **Supprimer** | Le conteneur est arrêté | Oui |
| **Terminal détaché** | Le conteneur tourne | Non : ouvre un terminal dans une fenêtre popup |
| **Détail et terminal** | Toujours | Non : ouvre le panneau de détail |

Pour voir une stack entière ou agir sur tous ses conteneurs d'un coup, voir [Stacks](./stacks.md).

## Détail d'un conteneur

Cliquez sur **Détail et terminal** pour ouvrir le panneau du conteneur. Son en-tête affiche l'état, le nom et l'image, puis des tags (état, santé, code de sortie, stack) et quatre chiffres : durée de fonctionnement (ou d'arrêt), redémarrages, ports publiés et montages.

<Screenshot id="container-details" alt="Le panneau d'un conteneur sur l'onglet Aperçu" />

| Onglet | Contenu |
|---|---|
| **Aperçu** | Identifiant, image et digest, dates de démarrage et de création, chemin physique ; **Télécharger** le log complet du conteneur |
| **Réseau** | Réseaux connectés avec l'adresse du conteneur, puis les ports et leurs liaisons sur l'hôte |
| **Montages** | Type, source et destination de chaque montage |
| **Logs** | Les 100 dernières lignes, puis les nouvelles au fil de l'eau |
| **Terminal** | **Ouvrir un terminal** lance `/bin/sh` dans le conteneur ; **Détacher dans une popup** le déplace dans sa propre fenêtre |

Les logs et le terminal ne se chargent qu'à l'ouverture de leur onglet.

**Console uniquement** (en haut à droite) masque tout sauf le terminal ; la session shell est conservée quand vous revenez en arrière. **Plein écran** élargit le panneau.

<Screenshot id="container-terminal" alt="Le panneau d'un conteneur en mode Console uniquement, avec un shell ouvert" />

## Consommation des ressources

Dans une stack dépliée, cliquez sur **Monitoring** pour afficher en direct le CPU, la RAM, le réseau et les PIDs de ses conteneurs. Cliquez sur **Fermer le monitoring** pour arrêter.

<Screenshot id="stack-monitoring" alt="Le tableau de monitoring d'une stack avec CPU, RAM, réseau et PIDs" />

## Bon à savoir

- Le terminal a besoin d'un TTY. Si le panel indique qu'il n'est pas disponible, ajoutez `tty: true` au service dans le fichier compose, ou lancez le conteneur avec `-t`.
- Les conteneurs marqués comme conteneurs système sont masqués pour tout le monde, et personne ne peut ouvrir de shell dans le conteneur de l'API du panel.
- Les conteneurs des fonctions (`fn-*`) se gèrent depuis **Serverless → Fonctions** : shell, copie de fichiers et actions y sont refusés.
- Un profil utilisateur ne voit que les conteneurs listés dans ses permissions ; demandez-en d'autres à votre administrateur.
- Les mêmes actions existent dans la [CLI `loch`](/cli/) : `loch ps`, `loch logs`, `loch shell`, `loch stats`, `loch inspect`, `loch start` / `stop` / `restart`. La CLI copie aussi des fichiers (`loch cp`) et ouvre des tunnels de ports (`loch proxy`).
