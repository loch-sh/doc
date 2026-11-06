---
sidebar_position: 3
title: Exploitation
description: Lire le journal d'audit de Loch Deploy, sauvegarder son état et ses données, et mettre le serveur à jour.
---

# Exploitation

## Journaux et audit

Le serveur écrit des lignes JSON sur stderr. Chaque requête protégée, refus compris, produit exactement une entrée avec `"msg":"audit"`. `GET /health` n'est pas audité.

```bash
docker compose logs deploy-server | grep '"msg":"audit"'
```

| Champ | Contenu |
|---|---|
| `method`, `path`, `status`, `client_ip`, `duration_ms` | Toujours présents |
| `error` | Les 256 premiers octets de la réponse d'erreur |
| `auth_error` | Raison précise du refus du jeton (expiré, mauvaise audience, trop ancien), jamais envoyée au client |
| `authz_error` | Raison d'un `403` lié au namespace ou à l'environnement protégé |
| `project_path`, `namespace_path`, `project_id`, `environment`, `ref`, `ref_protected`, `user_login`, `sha` | Identité issue du jeton |
| `auto_stop_days`, `env_files` | Sur `/deploy` : arrêt automatique demandé et noms des fichiers d'environnement, jamais leur contenu |
| `legacy_mounts` | Sur un `409` : les bind mounts refusés, avec les chemins complets sur l'hôte |
| `service`, `command` | Sur `/exec` : cible et commande complète |
| `directories` | Sur `/directories` : `service/name` de chaque entrée |

Le niveau est `INFO` en cas de succès, `WARN` pour les 4xx, `ERROR` pour les 5xx. Le serveur n'expose aucune métrique.

## Sauvegarde

| Chemin | Contenu | Remarque |
|---|---|---|
| `DATA_DIR` (`./data` dans le déploiement de référence) | `registry.json` (propriété), `autostop.json` (arrêts programmés) | Petits fichiers, écrits de façon atomique |
| `COMPOSE_BASE` (`/data/compose`) | Un répertoire par stack : fichier compose et fichiers d'environnement | Les fichiers d'environnement contiennent des secrets applicatifs |
| `WEBSITES_BASE` (`/data/websites`) | Données applicatives des bind mounts | Jamais supprimées par le serveur |

Sauvegardez `WEBSITES_BASE` sans suivre les liens symboliques : les conteneurs peuvent en créer dans leurs propres répertoires. Restaurez `DATA_DIR` serveur arrêté.

## Mise à jour

1. Lisez les notes de version sur [GitHub](https://github.com/loch-sh/deploy/releases).
2. Attendez qu'aucun pipeline ne soit en train de déployer : sur `SIGTERM`, le serveur n'attend que 30 secondes les requêtes en cours, un déploiement peut durer plus longtemps.
3. Tirez la nouvelle image et redémarrez :

   ```bash
   docker compose pull deploy-server
   docker compose up -d deploy-server
   ```

4. Vérifiez que le conteneur est `healthy` et que le journal affiche la nouvelle version dans `deploy-server starting`.

Chaque image embarque une version donnée de la CLI docker et de Compose. La politique est une liste de refus : relisez-la au regard de la version de Compose de chaque nouvelle release.

```bash
docker run --rm ghcr.io/loch-sh/deploy:1.0 -version
```
