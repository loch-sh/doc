---
sidebar_position: 1
title: Connexion et page d'accueil
description: Connectez-vous à Loch Panel avec le compte de votre organisation et lisez la page d'accueil.
---

# Connexion et page d'accueil

Loch Panel n'a pas de mot de passe propre : vous vous connectez avec le compte de votre organisation (authentification unique).

## Se connecter

1. Ouvrez l'adresse du panel donnée par votre administrateur.
2. Le panel vous envoie vers la page de connexion de votre organisation. Connectez-vous.
3. Vous revenez sur le panel, sur la page **Accueil**.

Pour vous déconnecter, cliquez sur **Déconnexion** en bas du menu.

## Votre profil

| Profil | Ce que vous voyez |
|---|---|
| Administrateur | Tous les conteneurs, sauf les conteneurs système, et les menus d'administration |
| Utilisateur | Uniquement les conteneurs que votre administrateur vous a attribués |

La première personne qui se connecte devient administrateur. Les suivantes sont des utilisateurs sans conteneur, jusqu'à ce qu'un administrateur leur en attribue.

## La page d'accueil

<Screenshot id="home-user" alt="La page d'accueil d'un utilisateur, avec les conteneurs accordés dans la carte de profil" />

| Carte | Contenu |
|---|---|
| **Nombre de conteneurs** | Les conteneurs que vous voyez |
| **Profil utilisateur** / **Profil administrateur** | Votre profil et les conteneurs auxquels vous avez accès |
| **Aperçu des ressources** | Le nombre de vos conteneurs, stacks, tâches planifiées et clés API ; les admins voient aussi les sites, services, fonctions, réseaux privés, utilisateurs SFTP et domaines des modules activés. Cliquez sur une tuile pour ouvrir sa page |
| **Dernières stacks déployées** | Les 5 stacks les plus récentes, avec leur état |
| **Conteneurs en arrêt incorrect** | Jusqu'à 5 conteneurs arrêtés avec un code de sortie non nul ; cliquez sur l'un d'eux pour le retrouver dans **Conteneurs** |
| **Derniers domaines** | Admin uniquement : les 5 derniers domaines routés |
| **Support technique** | Admin uniquement, si votre organisation l'a configuré |
| **État des services** | Si votre organisation a configuré une page d'état |

## Bon à savoir

- **Aucun accès n'a pour l'instant été défini par votre administrateur.** signifie que votre profil n'a aucun conteneur : demandez à votre administrateur.
- Le menu n'affiche que ce que votre profil et les fonctionnalités activées permettent.
- Le sélecteur de langue change la langue de l'interface (10 langues).
- Une session de navigateur dure une heure. Ensuite, le panel vous fait repasser par la page de connexion.
