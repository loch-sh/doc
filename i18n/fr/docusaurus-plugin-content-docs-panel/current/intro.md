---
sidebar_position: 1
slug: /
title: Loch Panel
description: Gérez des conteneurs Docker, des sites web, des services managés et des fonctions depuis une interface web, une CLI ou un assistant IA.
---

# Loch Panel

Loch Panel gère un serveur Docker depuis une interface web, la CLI `loch` ou un assistant IA (MCP).

| Composant | Rôle |
|---|---|
| API | API REST et WebSocket, dialogue avec Docker (port 2538) |
| Interface | Interface web, en 10 langues |
| [CLI `loch`](/cli/) | Ligne de commande et serveur MCP |

## Fonctionnalités

| Fonctionnalité | Qui | Activée par |
|---|---|---|
| Conteneurs et stacks : logs, shell, copie de fichiers, stats, actions | Chaque utilisateur, sur les conteneurs qui lui sont attribués | Toujours active |
| Tâches planifiées | Chaque utilisateur | Toujours active |
| Clés API | Chaque utilisateur, pour ses propres clés | Toujours active |
| Utilisateurs et droits | Admin | Toujours active |
| Sites web (PHP, Nginx, Apache) | Admin | `HOSTING_ENABLED` |
| Comptes SFTP des sites | Admin | `SFTP_ENABLED` |
| Services managés : bases de données, cache, messagerie, stockage | Admin | `SERVICES_ENABLED` |
| Fonctions : handlers écrits pour AWS Lambda™ (travail en cours) | Admin | `FUNCTIONS_ENABLED` |
| Réseaux privés | Admin | Toujours active (le réseau partagé `services` nécessite le module services) |
| Journal d'audit | Admin | Toujours active |

Une entrée de menu n'apparaît que si sa fonctionnalité est activée.
