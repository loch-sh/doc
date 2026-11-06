---
sidebar_position: 1
slug: /
title: Loch Deploy
description: Loch Deploy est un serveur HTTP minimal qui permet aux pipelines GitLab CI de déployer des stacks docker compose avec un jeton OIDC de courte durée, sans SSH.
---

# Loch Deploy

Loch Deploy remplace le déploiement par SSH depuis GitLab CI. Les pipelines s'authentifient avec un jeton d'identité OIDC GitLab de courte durée et envoient des requêtes HTTP ciblées ; le serveur exécute `docker compose` sur le démon Docker de l'hôte. Aucun secret de longue durée, aucun accès shell.

Le programme serveur s'appelle `deploy-server` (nom du binaire, module Go et titre de l'image OCI). Il est publié depuis [github.com/loch-sh/deploy](https://github.com/loch-sh/deploy) sous forme d'image `ghcr.io/loch-sh/deploy`.

## Fonctionnement

1. Un job GitLab CI demande un jeton avec `id_tokens` et l'envoie en `Authorization: Bearer`.
2. Le serveur vérifie le jeton avec les clés de l'instance GitLab, puis applique la liste d'IP autorisées, la liste de namespaces autorisés et la règle des environnements protégés.
3. Il déduit la stack cible des claims signés : `<slug du chemin du projet>-<slug de l'environnement>`. La requête ne nomme jamais la stack.
4. Il vérifie le fichier compose envoyé avec la politique de déploiement, puis lance `docker compose pull` et `up`, limités à cette stack.

| Avant (SSH) | Avec Loch Deploy |
|---|---|
| Le runner ouvre une session SSH sur l'hôte | Le runner envoie des requêtes HTTPS à quatre endpoints |
| Clé SSH de longue durée dans les variables CI | Jeton par job, refusé 10 minutes après son émission |
| `sudo` pour créer les répertoires et lancer compose | `POST /directories`, `POST /deploy`, `POST /exec`, `DELETE /stack` |
| Le job déclare son projet et son environnement | Projet et environnement viennent du jeton signé |
| N'importe quel fichier compose est exécuté tel quel | Le modèle compose rendu doit respecter la politique |

## Contre quoi il protège

- Un pipeline qui agirait sur les stacks d'un autre projet : l'identité vient du jeton, la propriété est enregistrée par `project_id` GitLab.
- Un fichier compose qui prendrait le contrôle de l'hôte : `privileged`, `cap_add`, périphériques, namespaces de l'hôte, `build`, ressources externes et bind mounts hors du répertoire de données de la stack sont refusés.
- Un jeton divulgué réutilisé plus tard : les jetons de plus de 10 minutes sont refusés.

## Contre quoi il ne protège pas

- Un pipeline d'un projet autorisé contrôle entièrement ses propres stacks : n'importe quelle image, n'importe quelle commande via `/exec`, n'importe quel nom d'environnement.
- Le serveur tourne en root avec le socket Docker : une faille dans le serveur est une compromission root de l'hôte.
- Les ports publiés, les quotas de ressources et les noms d'hôte Traefik partagés entre stacks ne sont pas restreints.

Détails et liste complète des risques : [Modèle de sécurité](./admin/security.md).

## Prérequis

| Élément | Prérequis |
|---|---|
| CI | GitLab 15.7 ou plus récent, avec `id_tokens`. Les autres systèmes de CI ne sont pas pris en charge |
| Hôte | Docker ; l'image embarque la CLI docker et le plugin Compose |
| Reverse proxy | Terminaison TLS devant le serveur (Traefik recommandé). Le port `8080` n'est jamais exposé |
| Compose | 2.23.1 ou plus récent pour le déploiement de référence (`configs.content` en ligne) |
| Chemins | `/data/compose` et `/data/websites` montés au même chemin sur l'hôte et dans le conteneur |

## Étape suivante

[Installez Loch Deploy](./install.md), puis [déployez depuis GitLab CI](./guides/gitlab-ci.md).
