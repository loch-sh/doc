---
sidebar_position: 1
title: Architecture
description: Les packages Go de deploy-server et le chemin d'une requête à travers ses middlewares et ses handlers.
---

# Architecture

`deploy-server` est un binaire Go unique qui utilise `net/http`, `log/slog`, `go-oidc` et `yaml.v3`. Chaque appel docker est une liste d'arguments passée à `exec.CommandContext`, jamais un shell.

## Chemin d'une requête

Des middlewares enveloppent chaque endpoint protégé, de l'extérieur vers l'intérieur (`main.go`, `newMux`) :

1. Audit (`middleware/audit.go`) : une entrée par requête, refus compris.
2. Liste d'IP autorisées (`middleware/ipallow.go`) : `403`.
3. Vérification du jeton (`middleware/oidc.go`) : `401`.
4. Liste de namespaces autorisés (`middleware/authz.go`) : `403`.
5. Règle des environnements protégés (`middleware/authz.go`) : `403`.
6. Handler : identité de la stack, propriété, validation des entrées, opération.

## Packages

| Package | Rôle |
|---|---|
| `main.go` | Démarrage, options (`-version`, `-import-registry`), routes, limites HTTP, arrêt propre |
| `config` | Variables d'environnement et leur validation |
| `middleware` | Vérification OIDC, règles d'autorisation, liste d'IP autorisées avec IP client tenant compte du proxy, audit |
| `handlers` | Endpoints ; identité de la stack depuis les claims (`stack.go`), verrou par stack (`lock.go`), contrôle préalable (`legacy.go`), aides à la validation (`validate.go`) |
| `compose` | Exécution docker (épinglage `-p`, délais, plafonds de sortie, sémaphore à 4 créneaux), inspection et suppression des conteneurs, politique de déploiement |
| `registry` | Stockage de la propriété, détection des collisions, import |
| `scheduler` | Boucle d'arrêt automatique (au démarrage, puis toutes les 5 minutes) |
| `internal/slug` | Transformation en slug GitLab partagée par config, middleware et handlers |
| `internal/atomicfile` | Écritures de fichiers atomiques avec fsync |
| `internal/testutil` | Faux binaire `docker` et faux émetteur OIDC GitLab pour les tests |

## Choix de conception

- L'identité est dérivée des claims signés ; la requête ne nomme jamais de stack.
- La validation se fait dans un répertoire de staging : un déploiement refusé laisse la stack en cours intacte.
- La politique est une liste de refus sur le modèle compose : relisez-la à chaque mise à jour de Compose.
- `/directories` passe par un `os.Root` confiné à `WEBSITES_BASE/<key>`.
- Le serveur tourne en root volontairement ; voir [Modèle de sécurité](../admin/security.md).
