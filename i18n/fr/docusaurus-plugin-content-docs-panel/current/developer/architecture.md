---
sidebar_position: 1
title: Architecture
description: Les trois projets de Loch Panel, comment ils communiquent et les principaux paquets de chacun.
---

# Architecture

Loch Panel se compose de trois projets, chacun dans son propre dépôt Git, regroupés dans un même répertoire de travail.

| Projet | Rôle | Technologies |
|---|---|---|
| `host-panel-api` | API REST et WebSocket, pilote Docker (port 2538) | Go 1.27, `net/http` standard, SDK Docker Moby |
| `host-panel-interface` | Interface web (port 5173 en développement), en 10 langues | React 19, TypeScript, Vite, Ant Design 6, TanStack Query |
| `host-panel-cli` | [CLI `loch`](/cli/) et serveur MCP | Go, Cobra, Viper |

## Communication entre les projets

| De | Vers | Canal | Authentification |
|---|---|---|---|
| Interface | API | REST (Axios, `withCredentials: true`) | Cookie de session |
| Interface | API | WebSocket `/ws` : shell, logs et statistiques en direct | Cookie de session |
| CLI | API | REST et WebSocket `/ws` (y compris le proxy de ports TCP) | En-tête `X-API-Key` |
| API | Docker | Socket Docker | — |
| API | SFTPGo | API REST d'administration de SFTPGo (si `SFTP_ENABLED`) | En-tête `X-SFTPGO-API-KEY` |

**Session (navigateur).** L'API gère elle-même la connexion OIDC (`/openid-connect/login`, puis `/openid-connect/redirect`). Elle stocke le jeton dans un cookie signé `authorization` et le vérifie à chaque requête avec les JWKS du fournisseur. Quand l'API répond `401`, l'interface redirige vers `/openid-connect/login`. Une session dispose de toutes les permissions de son utilisateur.

**Clé API (CLI, scripts, MCP).** L'en-tête `X-API-Key` est vérifié en premier. Une clé porte le profil de son utilisateur et peut être limitée par des scopes. Voir la [référence de l'API](../reference/api.md).

## Parcours d'une requête dans l'API

1. Middlewares globaux, dans cet ordre : `Recovery`, `Logging`, `AuditRequests`, `RateLimit` (120 requêtes par minute et par IP), `SecurityHeaders`, `CORS(FRONT_URL)`, `SameOrigin(FRONT_URL)` (CSRF).
2. Enveloppe de route : `authenticated` (clé API, sinon JWT et utilisateur) ou `adminOnly` (idem, plus la vérification admin). Les routes sont déclarées dans `cmd/server/main.go`.
3. Handler : vérifie le scope de la clé API avec `middleware.RequireScope`, puis répond avec `writeJSON` / `writeError`.

## Paquets de l'API

| Paquet | Rôle |
|---|---|
| `cmd/server` | Point d'entrée : configuration, assemblage, routes, enregistrement des moteurs de services (`serviceEngines()`) |
| `internal/config`, `internal/env` | Chargement, validation et contrôle de l'environnement |
| `internal/auth` | Fournisseurs OIDC, JWKS, cookies signés |
| `internal/middleware` | Authentification, CSRF, CORS, limitation de débit, audit, logs |
| `internal/handler` | Handlers HTTP et WebSocket, codes d'erreur |
| `internal/ws` | Hub WebSocket : logs, shell, statistiques, proxy de ports |
| `internal/docker` | Client Docker, cache des conteneurs (3 s), exec, réseaux |
| `internal/store`, `internal/model` | Persistance JSON atomique ; utilisateurs, clés API |
| `internal/cron` | Tâches planifiées : planificateur, exécuteur, stockage |
| `internal/audit` | Écriture et lecture du journal d'audit |
| `internal/hosting`, `internal/composekit` | Hébergement web ; outils pour écrire et lancer des projets compose |
| `internal/sftpgo` | Client d'administration SFTPGo |
| `internal/services` | Cœur des services managés ; un sous-paquet par moteur (`postgres`, `mysqlfamily`, `mongodb`, `redisfamily`, `nats`, `rabbitmq`, `elasticmq`, `mosquitto`, `s3`) |
| `internal/networks` | Réseaux privés : registre, vérification, membres |
| `internal/registry`, `internal/releases` | Références d'images (`mirror.gcr.io`, `ghcr.io`) ; découverte des versions |

L'API stocke son état dans des fichiers JSON sous `DATA_DIR` (`users.json`, `apikeys.json`, `cron.json`, `networks.json`) et écrit le journal d'audit dans `audit.log`, dans son répertoire de logs.

## Structure de l'interface

| Chemin | Contenu |
|---|---|
| `src/config.ts` | Configuration d'exécution : `window.__APP_CONFIG__`, puis variables `VITE_*`, puis valeurs par défaut |
| `src/i18n/` | Configuration i18next, clés typées, fichiers de langue |
| `src/Services/<Domaine>/` | Appels à l'API (`service.ts`), modèles, hooks React Query |
| `src/Pages/<Domaine>/` | Un dossier par page |
| `src/Components/` | Composants partagés ; menu dans `Components/Layout/MenuLayout.tsx` |
| `src/App.tsx` | Routes |
| `tests/` | API simulée, configuration Vitest, tests Playwright |

## Bon à savoir

- Chaque projet a son propre dépôt Git : committez dans le projet que vous avez modifié.
- La CLI n'accède pas à Docker : tout passe par l'API.
- Les notes de conception détaillées restent dans le dépôt de l'API (`host-panel-api/docs/`).
