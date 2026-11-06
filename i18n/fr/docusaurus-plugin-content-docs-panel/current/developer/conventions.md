---
sidebar_position: 4
title: Conventions
description: "Les règles à suivre quand vous modifiez le code de Loch Panel : images, langues, traductions, configuration et sécurité."
---

# Conventions

Suivez ces règles à chaque modification de l'API, de l'interface ou de la CLI.

## Images Docker

| Règle | Détail |
|---|---|
| Tirer depuis `mirror.gcr.io`, jamais directement depuis Docker Hub | `mirror.gcr.io/library/<nom>` pour les images officielles, `mirror.gcr.io/<org>/<nom>` pour les autres |
| En Go, construire les références avec les helpers | `registry.Hub("postgres:17")` ; `registry.GHCR(...)` pour nos propres images (Loch S3), seule autre exception |
| Image absente du miroir | Reste sur Docker Hub, listée dans `notMirrored` (`internal/hosting/catalog.go`) |

Cela s'applique aux catalogues des moteurs, aux modèles de sites, aux Dockerfiles, aux jobs de CI, au fichier compose de développement et aux tests d'intégration.

## Langues

| Quoi | Langue |
|---|---|
| Code, identifiants, commentaires techniques | Anglais |
| Erreurs de l'API, logs, aide et messages de la CLI | Anglais |
| Textes de l'interface | Traduits dans les 10 langues, l'anglais est la source. Voir [Traductions](./translations.md) |

## API

- Répondez avec `writeJSON` / `writeError` et un code d'erreur stable (`{"code": "...", "error": "..."}`). L'interface traduit le code (namespace `errors`).
- Lisez chaque variable d'environnement avec un `env.Reader`, jamais `os.Getenv`, pour que le contrôle au démarrage la voie. Ajoutez une nouvelle variable dans `config.go` et `.env.example` ; déclarez une variable supprimée avec `Reader.Removed` ; ajoutez un nouveau préfixe à `lintedPrefixes` (`internal/config`). Ne mettez jamais une valeur dans un message de contrôle.
- Les stockages écrivent de façon atomique (fichier temporaire, puis renommage) derrière un verrou lecture-écriture.
- Auditez tout ce qu'un utilisateur peut déclencher, jamais avec un secret (mot de passe, jeton, en-tête, corps de requête). Ajoutez chaque nouvel événement d'audit dans `AUDIT_EVENTS` (`Services/Audit/Models/audit.model.ts`) et traduisez-le dans les 10 langues.
- Un nouveau moteur de services : suivez « Adding a service engine » dans `host-panel-api/docs/development.md`, lisez d'abord `docs/services-security.md` et ajoutez un test d'intégration.

## Interface

- Aucun texte visible en dur : tout passe par `t()`.
- Ne lisez `import.meta.env` que dans `src/config.ts`.
- N'affichez jamais `State` / `Status` bruts de Docker : utilisez `useContainerLabels()`.
- Chargez les pages avec `lazyPage` et gardez-les dans l'`ErrorBoundary`.
- Ajoutez chaque nouvel appel à l'API dans l'API simulée (`tests/mocks/api.ts`). Voir [Tests](./testing.md).

## Règles de sécurité à connaître

| Règle | Pourquoi |
|---|---|
| Une nouvelle route qui lit ou modifie des données vérifie un scope de clé API (`middleware.RequireScope`) ; un nouveau scope va dans `ValidScopes` (`internal/model/apikey.go`) | Les clés peuvent être limitées ; une session a toujours toutes les permissions de son utilisateur |
| Les routes d'écriture restent en POST, PUT, PATCH ou DELETE | `SameOrigin(FRONT_URL)` bloque les écritures d'un navigateur venant d'une autre origine (CSRF, le cookie de session est `SameSite=None`) |
| Valider les chemins de conteneur côté API (absolu, sans caractère nul ni retour à la ligne, 4096 caractères au plus) | La copie de fichiers et la lecture de fichiers s'exécutent dans les conteneurs |
| Passer les commandes à `docker exec` en `[]string`, jamais via un shell | Pas d'injection |
| Ne jamais agir sur le conteneur de l'API lui-même (shell, copie, lecture de fichiers, tâches exec) | Il contient le journal d'audit (`SELF_CONTAINER_PROTECTED`) |
| Toute valeur insérée dans une configuration vient d'une liste fixe ou d'un identifiant validé | Les modèles et fichiers compose sont exécutés |
| Afficher un jeton ou un mot de passe généré une seule fois, ne jamais le journaliser | Les jetons de clé API ne sont stockés que sous forme de hash SHA-256 |

Liste complète des scopes : [scopes des clés API](../reference/scopes.md).

## Bon à savoir

- Documentez aussi chaque fonctionnalité dans `host-panel-api/docs/`.
- Chaque projet est un dépôt Git distinct.
