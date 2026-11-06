---
sidebar_position: 6.5
title: Module Fonctions
description: Activez le module Fonctions, fournissez le binaire de Loch Lambda Runtime, réglez les limites et les budgets, et comprenez les réseaux, l'accès sortant et les identifiants des fonctions.
---

# Module Fonctions

:::caution Travail en cours
Les fonctions sont en cours de développement : l'API, l'interface et la CLI existent, mais la fonctionnalité peut encore changer. Les mises à jour du runtime, les gestionnaires de secrets externes, l'accès HTTP public et un quota disque par fonction ne sont pas encore disponibles.
:::

Le module Fonctions exécute des handlers écrits pour AWS Lambda™ (Node.js, Python, ou un `bootstrap` compilé) sur l'hôte Docker, dans les images de base AWS Lambda publiées par AWS, avec [Loch Lambda Runtime](/lambda-runtime/) comme point d'entrée. Cette page met le module en place. Pour créer et exécuter des fonctions, voir [Fonctions](../user-guide/functions.md).

:::note
Réservé aux admins. Nécessite `FUNCTIONS_ENABLED=true` et `HOSTING_STACKS_DIRECTORY` (les fichiers compose y sont écrits, même quand le module Hosting est désactivé).
:::

## Activer le module

Ajoutez les variables au `.env` de l'API, puis redémarrez l'API :

| Variable | Rôle | Défaut |
|---|---|---|
| `FUNCTIONS_ENABLED` | Active le module | `false` |
| `FUNCTIONS_DATA_DIRECTORY` | Code, binaires du runtime, secrets et références. Même chemin sur l'hôte et dans le conteneur de l'API | `/data/functions` |
| `FUNCTIONS_RUNTIME_DOWNLOAD` | Télécharge le binaire du runtime depuis GitHub quand il manque | `true` |
| `FUNCTIONS_RUNTIME_SOURCE_DIR` | Répertoire contenant le binaire du runtime, pour les installations hors ligne | vide |

`FUNCTIONS_DATA_DIRECTORY` n'accepte que lettres, chiffres et `_ . / -`. Il doit être en dehors de `HOSTING_STACKS_DIRECTORY`, `HOSTING_SITES_DIRECTORY`, `SFTP_DIRECTORY`, `SERVICES_DATA_DIRECTORY` et `API_LOG_DIR`. Un sous-répertoire de `DATA_DIR` convient, pas `DATA_DIR` lui-même. L'API le vérifie au démarrage. Chaque répertoire qu'il contient doit appartenir au panel et n'être modifiable par personne d'autre.

Le menu **Serverless → Fonctions** apparaît pour les admins. Si les vérifications d'installation échouent (répertoires, Docker), seul le module est désactivé : les journaux de l'API en donnent la raison, et `GET /functions/config` répond `FUNCTIONS_MISCONFIGURED`.

Limites et budgets : [référence de configuration](../reference/configuration.md#functions).

## Binaire du runtime

Chaque fonction exécute le binaire de Loch Lambda Runtime. Le build du panel fait confiance à des versions précises (aujourd'hui v1.0.1, amd64 et arm64) et ne conserve qu'un binaire dont la taille et le SHA-256 correspondent.

| Mode | Comment |
|---|---|
| **Téléchargement** (défaut) | Au démarrage, le panel télécharge depuis GitHub, en HTTPS, la version pour l'architecture de l'hôte. Autorisez le HTTPS sortant vers `github.com`, `release-assets.githubusercontent.com` et `objects.githubusercontent.com`. `HTTPS_PROXY` est pris en compte |
| **Hors ligne** | Réglez `FUNCTIONS_RUNTIME_DOWNLOAD=false` et `FUNCTIONS_RUNTIME_SOURCE_DIR` sur un répertoire contenant `loch-lambda-runtime-linux-<arch>`, monté en lecture seule dans le conteneur de l'API |

```bash
# Sur une machine avec accès à Internet, puis copiez les fichiers sur l'hôte
gh release download v1.0.1 -R loch-sh/lambda-runtime -p 'loch-lambda-runtime-linux-*' -p 'SHA256SUMS*'
shasum -a 256 -c SHA256SUMS --ignore-missing
```

Le répertoire source et ses fichiers doivent appartenir à l'utilisateur du panel ou à root, n'être modifiables par personne d'autre et être des fichiers ordinaires (pas de liens symboliques). Sinon l'API refuse de démarrer.

Tant qu'aucun binaire de confiance n'est installé, la page de liste indique **Aucun runtime de fonction de confiance n'est encore installé sur le serveur**, et créer ou démarrer une fonction échoue avec `FUNCTION_RUNTIME_UNAVAILABLE` : la raison est dans les journaux de l'API. Un binaire installé n'est jamais remplacé. S'il échoue à la vérification, supprimez-le à la main. Vérifier une version : [Versions](/lambda-runtime/developer/releases/).

## Ce que crée le panel

| Objet | Nom |
|---|---|
| Projet compose | `fn-<name>` dans `HOSTING_STACKS_DIRECTORY`. Il démarre avec `docker compose up -d` sans le panel |
| Réseau privé | `fn-<name>`, créé avec la fonction |
| Image | `mirror.gcr.io/amazon/aws-lambda-nodejs`, `…-python` ou `…-provided`, épinglée par digest |
| Code | Déploiements en lecture seule dans `FUNCTIONS_DATA_DIRECTORY`, montés sur `/var/task` |
| Secrets | Un fichier du répertoire privé, jamais dans `compose.yaml` |

Un fichier compose modifié à la main n'est plus jamais exécuté : la fonction s'affiche **Modifiée hors du panel** et ne peut plus qu'être purgée.

## Réseaux et accès sortant

- Une fonction ne rejoint jamais le réseau `services`. Elle rejoint son propre réseau `fn-<name>` et les réseaux privés que vous lui rattachez.
- Elle ne publie aucun port. Les membres de ses réseaux la joignent sur le port 8080, avec ses identifiants d'invocation.
- L'**Accès à Internet** est désactivé par défaut. Activé, il permet aussi de joindre la passerelle de l'hôte, le réseau local et les points de métadonnées cloud, sauf si des règles de pare-feu `DOCKER-USER` les bloquent. Son activation est consignée comme avertissement.
- Les conteneurs des fonctions sont protégés comme celui de l'API : ni shell, ni copie de fichiers, ni lecture de fichiers, ni tunnel de port, ni action sur le conteneur, ni tâche planifiée `exec`. Leur sortie standard reste lisible par les admins. Les utilisateurs restreints ne les voient jamais, et les conteneurs `fn-*` ne peuvent pas leur être attribués.

## Scopes des clés d'API

| Scope | Permet |
|---|---|
| `functions:read` | Lire les fonctions et la configuration du module |
| `functions:write` | Créer, redimensionner, démarrer, arrêter, redémarrer, supprimer |
| `functions:deploy` | Code, déploiements, secrets, identifiants, variables, handler, réseaux, accès sortant, autorisation MCP |
| `functions:invoke` | Invoquer. Implicite seulement avec `*` |

Le formulaire de clé de l'interface ne propose pas encore ces scopes : utilisez une clé avec **Toutes les permissions**, ou créez-la via l'API. Détails : [scopes des clés d'API](../reference/scopes.md).

## Audit

Chaque modification est consignée (`function created`, `function code deployed`, `function secret set` avec le nom seulement, `function egress toggled`…). Les invocations sont comptées par fonction et par minute dans `function invoked`, jamais avec leur contenu. Liste complète : [journal d'audit](./audit.md).

## Bon à savoir

- La mémoire et les CPU cumulés de toutes les fonctions sont plafonnés par `FUNCTIONS_MAX_TOTAL_MEMORY` et `FUNCTIONS_MAX_TOTAL_CPUS` (par défaut : la mémoire de l'hôte et 4 × ses CPU).
- Les déploiements conservés bornent le disque utilisé par fonction : `FUNCTIONS_DEPLOYMENTS_KEPT` × 250 Mo au plus.
- Supprimer le répertoire compose ne supprime ni le code ni les secrets.
- Au démarrage, le panel supprime les envois interrompus et signale dans ses journaux les fonctions modifiées hors du panel.
- AWS et AWS Lambda sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Loch.sh n'est ni affilié à Amazon ni approuvé par Amazon.
