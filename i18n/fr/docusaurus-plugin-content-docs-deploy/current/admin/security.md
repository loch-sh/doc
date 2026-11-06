---
sidebar_position: 2
title: Modèle de sécurité
description: À qui Loch Deploy fait confiance, pourquoi il tourne en root avec le socket Docker, les risques résiduels et ce qu'il ne faut jamais faire.
---

# Modèle de sécurité

Loch Deploy détient le socket Docker et lance des stacks compose pour les pipelines GitLab CI. Lisez cette page avant de l'exposer.

## Modèle de confiance

| Acteur | Confiance | Ce qu'il peut faire |
|---|---|---|
| Instance GitLab | Totale | Signe les jetons. Qui la contrôle, ou contrôle sa clé de signature, contrôle toutes les stacks |
| Pipeline d'un projet autorisé | Pour ses propres stacks | Déployer tout fichier compose qui respecte la politique, n'importe quelle image, n'importe quelle commande via `/exec`, n'importe quel nom d'environnement |
| Conteneurs d'une stack | Aucune | Lancer des images arbitraires, écrire dans les répertoires de bind de la stack |
| Clients réseau | Aucune | Atteindre le serveur uniquement via le reverse proxy |

Le serveur est conçu pour que le contrôle d'un pipeline ne s'étende ni à l'hôte ni aux stacks des autres projets : l'identité vient du jeton signé, les commandes compose sont limitées à la stack, la propriété est enregistrée par `project_id`, et la politique refuse les fonctionnalités compose qui donnent accès à l'hôte. Cette frontière n'est pas complète ; voir les risques ci-dessous.

## Root avec le socket Docker

Le processus tourne en root dans son conteneur, volontairement : le socket équivaut déjà à root sur l'hôte, et `/directories` doit faire des `chown` vers des uid arbitraires. Le déploiement de référence retire toutes les capacités sauf `CHOWN`, `FOWNER` et `DAC_OVERRIDE`, active `no-new-privileges` et un système de fichiers racine en lecture seule. Cela limite le conteneur, pas ce qui passe par le socket.

**Toute faille exploitable du serveur, de sa politique ou de ses dépendances est une compromission root de l'hôte.**

## Risques résiduels {#residual-risks}

En supposant que la [liste de contrôle de durcissement](./configuration.md#hardening-checklist) est respectée :

| ID | Risque | Niveau |
|---|---|---|
| A1 | Collision de slugs : deux projets peuvent aboutir à la même clé de stack ; le premier déploiement la possède | Moyen |
| A2 | Course aux liens symboliques sur les sources de bind entre la validation et `up` (anciens conteneurs invisibles pour le serveur) | Faible |
| A3 | L'interpolation `${VAR}` lit l'environnement du serveur | Faible à moyen |
| A4 | Les `ports:` publiés sont autorisés et contournent le proxy | Moyen |
| A5 | Une stack peut router le nom d'hôte d'une autre stack dans Traefik, ou casser ses routeurs | Moyen |
| A6 | Accaparement de `container_name` entre clés partageant un préfixe (déni de service seulement) | Faible |
| A7 | Aucun quota de CPU, de mémoire, de disque ou de nombre de stacks | Moyen |
| A8 | L'attente d'un créneau docker est hors du budget de temps : un déploiement peut dépasser 16 minutes | Faible |
| A9 | La politique est une liste de refus : les nouveaux attributs compose sont autorisés par défaut | Faible |
| A10 | Une compromission du serveur donne root sur l'hôte | Impact élevé |
| A11 | Les routeurs des projets peuvent s'attacher à l'entrypoint de déploiement `:8443` | Faible |

Mécanismes et atténuations de chaque risque : [SECURITY.md](https://github.com/loch-sh/deploy/blob/v1.0.0/SECURITY.md#residual-risks).

Atténuations hors du serveur : un pare-feu sur l'hôte pour les ports publiés (A4), tous les hôtes sensibles dans `FORBIDDEN_TRAEFIK_HOSTS` (A5), et une revue de la politique à chaque mise à jour de Compose (A9).

## À ne jamais faire

:::warning
- Publier `:8080`, ou attacher deploy-server à un réseau que les stacks peuvent rejoindre.
- Ajouter `deploy-internal` ou `socket-proxy` à `ALLOWED_EXTERNAL_NETWORKS`.
- Élargir `TRUSTED_PROXIES` au-delà de l'adresse exacte du proxy.
- Mettre des secrets dans l'environnement du serveur.
- Lancer `-import-registry` pendant que le serveur tourne.
- Ajouter un `USER` non root à l'image : le serveur a besoin de root par conception.
- Compter sur `:ro` pour le socket Docker : il protège le fichier, pas l'API.
:::

## Bon à savoir

- Les jetons sont refusés 10 minutes après leur émission ; 30 secondes de décalage d'horloge sont tolérées.
- Le journal d'audit ne contient jamais l'e-mail de l'utilisateur, seulement son login GitLab.
- Les outils de l'hôte qui parcourent `WEBSITES_BASE` (sauvegardes, `chown -R`) ne doivent pas suivre les liens symboliques : les conteneurs peuvent en créer dans leurs propres répertoires.
- Signalez les problèmes de sécurité en privé aux mainteneurs, pas dans des issues publiques.
