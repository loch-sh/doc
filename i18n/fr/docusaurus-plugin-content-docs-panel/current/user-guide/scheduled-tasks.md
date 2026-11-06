---
sidebar_position: 4
title: Tâches planifiées
description: Lancez une action sur un conteneur, une commande dans un conteneur, une requête HTTP ou une invocation de fonction selon une planification cron.
---

# Tâches planifiées

La page **Tâches planifiées** (menu **Serverless**) exécute des tâches selon une planification. Chaque utilisateur peut l'utiliser.

<Screenshot id="cron-list" alt="La page Tâches planifiées avec des tâches de chaque type et une ligne dépliée" />

## Types de tâches

| Type | Ce qu'elle fait | Champs |
|---|---|---|
| **Action Docker** | Démarre, arrête, redémarre ou tue un conteneur | **Conteneur**, **Action** |
| **Commande Docker** | Exécute une commande dans un conteneur | **Conteneur**, **Commande**, **Répertoire de travail** |
| **HTTP** | Envoie une requête HTTP | **Méthode**, **URL**, **Corps de la requête**, **Timeout (secondes)** |
| **Invocation de fonction** | Invoque une [fonction](./functions.md) avec un événement fixe. Réservé aux admins, quand le module des fonctions est activé | **Fonction**, **Événement (JSON)** |

Une invocation de fonction conserve le statut, la durée et la taille de la réponse, jamais la réponse elle-même. L'événement fait 64 Ko au plus (`{}` s'il est vide), avec 5 tâches au plus par fonction. Quand la fonction est supprimée, ses tâches passent à **Désactivée par le panel** : pointez-les vers une autre fonction ou supprimez-les.

## Créer une tâche

1. Cliquez sur **Nouvelle tâche**.
2. Renseignez **Nom** et **Expression cron**.
3. Choisissez le **Type** et remplissez ses champs.
4. Laissez **Activé** coché. Cochez **Exécution unique** pour désactiver la tâche après sa première exécution.
5. Cliquez sur **Créer**.

<Screenshot id="cron-form" alt="Le formulaire de nouvelle tâche planifiée pour une commande Docker" />

L'expression cron a cinq champs, `minute heure jour mois jour-semaine`, ou un raccourci :

| Expression | Exécution |
|---|---|
| `0 3 * * *` | Tous les jours à 3 h |
| `@every 5m` | Toutes les 5 minutes (60 secondes minimum) |
| `@hourly`, `@daily`, `@weekly`, `@monthly`, `@yearly` | Toutes les heures, tous les jours, toutes les semaines, tous les mois ou tous les ans |

## Gérer les tâches

| Bouton | Effet |
|---|---|
| **Modifier** | Ouvre le formulaire de la tâche ; enregistrez avec **Mettre à jour** |
| **Exécuter maintenant** | Exécute la tâche tout de suite |
| **Suspendre** / **Activer** | Arrête ou reprend la planification |
| **Supprimer** | Supprime la tâche, après confirmation |

Dépliez une ligne pour voir l'**Erreur :** et la **Sortie :** de la dernière exécution. Une exécution ne chevauche jamais la précédente de la même tâche : elle est sautée, et la ligne indique quand la dernière exécution a été sautée.

## Ce que peut faire un profil utilisateur

- Créer des tâches HTTP, et des tâches Docker uniquement sur les conteneurs qui vous sont attribués.
- Voir, modifier et supprimer toutes les tâches HTTP, quel que soit leur auteur, et les tâches Docker de vos conteneurs.
- L'erreur et la sortie de la dernière exécution ne sont affichées qu'aux administrateurs.

## Bon à savoir

- La **Commande** est découpée sur les espaces et exécutée sans shell : guillemets, pipes et `&&` ne fonctionnent pas. Placez-les dans un script à l'intérieur du conteneur et lancez `sh /chemin/vers/script.sh`.
- Les tâches HTTP ne peuvent pas joindre d'adresses privées ou internes. Dans le formulaire, le **Timeout (secondes)** va de 1 à 300.
- La sortie conservée pour une exécution est limitée à 10 Ko.
- Les commandes Docker sont refusées sur le conteneur de l'API du panel, les actions et commandes Docker sur les conteneurs des fonctions.
- L'administrateur fixe le nombre maximal de tâches du serveur (`CRON_MAX_JOBS`). Dans la CLI : `loch cron`, voir la [CLI `loch`](/cli/).
