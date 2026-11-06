---
sidebar_position: 6
title: Fonctions
description: Créez une fonction à partir d'un handler écrit pour AWS Lambda, déployez son code, testez-la, réglez ses secrets, identifiants et réseaux, et planifiez des invocations.
---

# Fonctions

:::caution Travail en cours
Les fonctions sont en cours de développement : l'API, l'interface et la CLI existent, mais la fonctionnalité peut encore changer. Les mises à jour du runtime, les gestionnaires de secrets externes, l'accès HTTP public et un quota disque par fonction ne sont pas encore disponibles.
:::

Une fonction exécute un handler écrit pour AWS Lambda™ (Node.js, Python, ou un `bootstrap` compilé pour Go, Rust…) dans son propre conteneur sur le serveur, démarré par [Loch Lambda Runtime](/lambda-runtime/). Le même code tourne aussi tel quel sur AWS Lambda.

:::note
Réservé aux admins. L'administrateur active d'abord le module : voir [Module Fonctions](../admin/functions.md). La page est **Serverless → Fonctions**.
:::

<Screenshot id="functions-list" alt="La page Fonctions avec trois fonctions, leur runtime, leur état, leurs réseaux et leur accès à Internet" />

## Créer une fonction

1. Cliquez sur **Nouvelle fonction**.
2. Remplissez les sections :

   | Section | Ce que vous choisissez |
   |---|---|
   | **Nom** | 1 à 21 lettres minuscules, chiffres ou tirets, commençant par une lettre. C'est aussi le nom d'hôte `fn-<name>`. Non modifiable |
   | **Runtime** | **Node.js**, **Python** ou **Go, Rust… (runtime personnalisé)**, et la **Version** |
   | **Code** | Le **Handler** et, si vous voulez, le **Code (zip)** à déployer tout de suite |
   | **Ressources** | **Mémoire**, **CPU**, **Délai**, **Taille de /tmp** |
   | **Variables et secrets** | **Variables** (écrites dans le fichier compose) et **Secrets** (conservés à part, jamais réaffichés) |
   | **Accès réseau** | Le **Réseau dédié** `fn-<name>`, les **Autres réseaux privés**, l'**Accès à Internet** |
   | **Invocation** | **Appelants SigV4 (AWS SDK)**, en plus du jeton bearer |

3. Cliquez sur **Créer la fonction**.
4. Copiez les identifiants d'invocation, puis cliquez sur **J'ai copié les identifiants**. Ils ne s'affichent qu'une fois.

<Screenshot id="functions-create" alt="La page Nouvelle fonction avec les sections nom, runtime, code et ressources, et le récapitulatif" />

Rien ne tourne tant qu'aucun code n'est déployé. Toutes les options de la CLI : [guide CLI des fonctions](/cli/guides/functions/).

### Handler

| Runtime | Handler | Exemple |
|---|---|---|
| Node.js | `<fichier>.<export>` | `index.handler` (exporté par `index.js` ou `index.mjs`) |
| Python | `<module>.<fonction>` | `lambda_function.lambda_handler`, `app.main.handler` |
| Runtime personnalisé | Facultatif, transmis au bootstrap dans `_HANDLER` | Vide : `bootstrap` |

### Ressources

| Réglage | Plage | Défaut |
|---|---|---|
| **Mémoire** | 128 Mo jusqu'au maximum du serveur | 512 Mo |
| **CPU** | 0,1 à 16, par pas de 0,01 | 1 |
| **Délai** | 1 à 900 secondes par invocation | 30 s |
| **Taille de /tmp** | 16 Mo à 10 Go | Fixée par le serveur (512 Mo par défaut) |

Les fichiers de `/tmp` comptent dans la limite de mémoire. La page de liste indique la part du budget du serveur déjà utilisée par les fonctions.

## Déployer du code

Le code est un zip contenant le handler et ses dépendances à sa racine (`node_modules`, paquets installés avec `pip install -t .`). Rien n'est compilé sur le serveur.

1. Ouvrez la fonction, onglet **Code**.
2. Déposez le zip sous **Déployer un nouveau code**.

Le zip devient un nouveau déploiement, actif aussitôt. S'il ne démarre pas, le précédent est relancé. Le tableau **Déploiements** garde les derniers (3 par défaut) : cliquez sur **Revenir** (ou **Activer**) pour en retrouver un.

Pour le runtime personnalisé, le zip contient à sa racine un exécutable nommé `bootstrap`, compilé pour Linux et l'architecture du serveur. Voir [Runtimes personnalisés](/lambda-runtime/guides/custom-runtimes/).

## Tester

Dans l'onglet **Test**, saisissez un **Événement (JSON)**, puis cliquez sur **Invoquer**. Le **Résultat** affiche le statut, la durée, l'identifiant de requête, la réponse et la fin des journaux. La fonction doit être en marche.

<Screenshot id="functions-test" alt="L'onglet Test d'une fonction avec un événement JSON et le résultat de l'invocation" />

## Onglets de la page d'une fonction

| Onglet | Usage |
|---|---|
| **Aperçu** | État, runtime, image, limites, **URL interne** |
| **Code** | Déployer un zip, lister, activer ou revenir à un déploiement |
| **Test** | Invoquer avec un événement |
| **Configuration** | Ressources, handler et variables ; **Invocable par les clients MCP** |
| **Secrets** | Ajouter, remplacer ou supprimer un secret. Les valeurs ne sont jamais affichées |
| **Identifiants** | Renouveler les identifiants d'invocation, accepter ou refuser les appelants SigV4 |
| **Réseaux** | Connecter ou déconnecter des réseaux privés, autoriser l'**Accès à Internet** |
| **Déclencheurs** | Tâches planifiées qui invoquent la fonction : **Planifier une invocation** |

Modifier la configuration, un secret, un réseau ou l'accès à Internet recrée le conteneur d'une fonction en marche : une invocation en cours est interrompue. Une fonction arrêtée le reste : une nouvelle configuration s'applique à son prochain démarrage.

## Appeler une fonction depuis un site ou un service

La fonction ne répond qu'aux membres de ses réseaux, à son **URL interne** (`http://fn-<name>:8080/2015-03-31/functions/<name>/invocations`), avec ses identifiants :

- un jeton bearer (`Authorization: Bearer <token>`) ;
- avec **Appelants SigV4 (AWS SDK)** activé, une paire de clés pour les SDK AWS (`endpoint-url` `http://fn-<name>:8080`, région `us-east-1`). Le code de la fonction peut lire cette paire de clés.

Rattachez le site ou le service au réseau de la fonction : depuis son onglet **Réseaux**, ou depuis [Réseaux privés](../admin/networks.md). Les invocations du panel lui-même (**Test**, tâches planifiées) n'ont besoin d'aucun identifiant. Format des requêtes : [Invoke API](/lambda-runtime/reference/invoke-api/).

## États

| État | Signification |
|---|---|
| **Aucun code** | Créée, aucun code déployé |
| **En marche** | Répond aux invocations |
| **Arrêtée** | Démarrez-la pour l'invoquer |
| **Absente** | Code déployé, mais pas de conteneur : démarrez-la de nouveau |
| **Modifiée hors du panel** | Son projet compose a été modifié à la main : le panel ne l'exécute plus. **Purgez**-la |
| **Non vérifiée** | Un conteneur tourne, mais ce n'est pas celui créé par le panel : redémarrez la fonction |
| **Illisible** | Son fichier de référence est illisible : **Purgez**-la |

## Supprimer

Cliquez sur **Supprimer** et saisissez le nom de la fonction. Le conteneur, le code, les déploiements, les secrets, les identifiants et le réseau `fn-<name>` sont supprimés (le réseau est conservé tant que d'autres membres l'utilisent). Les tâches planifiées qui l'invoquaient sont désactivées, pas supprimées.

## Bon à savoir

- Avec l'**Accès à Internet**, le code peut envoyer ses données et ses secrets n'importe où, et joindre l'hôte, le réseau local et les points de métadonnées cloud, sauf si des règles de pare-feu les bloquent. Il est désactivé par défaut.
- Une fonction ne rejoint jamais le réseau `services`. Elle garde au moins un réseau.
- **Invocable par les clients MCP** est un garde-fou pour les assistants IA qui utilisent `loch mcp`, pas un contrôle d'accès : voir [Outils MCP](/cli/reference/mcp-tools/#functions).
- Ce qu'une fonction renvoie ou écrit dans ses journaux n'est pas fiable : le panel l'affiche uniquement comme texte.
- Les conteneurs des fonctions sont protégés : ni shell, ni copie de fichiers, ni action depuis la page **Conteneurs**. Passez par la page de la fonction.
