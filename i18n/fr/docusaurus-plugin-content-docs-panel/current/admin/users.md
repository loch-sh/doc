---
sidebar_position: 3
title: Utilisateurs et accès
description: Comprenez les profils admin et restreint, attribuez des conteneurs, promouvez, rétrogradez ou supprimez des utilisateurs.
---

# Utilisateurs et accès

Les utilisateurs viennent de votre fournisseur OIDC : un compte est créé à sa première connexion. Seuls les admins gèrent les utilisateurs, depuis **Administration → Utilisateurs**.

## Profils

| Profil | Conteneurs | Fonctions d'administration |
|---|---|---|
| **Admin** | Tous | Utilisateurs, domaines, sites web, SFTP, services managés, réseaux privés, audit trail |
| **Restreint** | Uniquement ceux attribués par un admin | Aucune (403) |

- Le **premier utilisateur** qui se connecte devient admin.
- Les suivants démarrent **restreints, sans aucun conteneur**.

Chaque utilisateur, quel que soit son profil, gère ses propres clés API et peut utiliser les tâches planifiées.

<Screenshot id="admin-users-list" alt="La page Utilisateurs avec des administrateurs, des utilisateurs restreints et les boutons d'action" />

## Attribuer des conteneurs

1. Dans **Utilisateurs**, cliquez sur **Modifier** sur la ligne de l'utilisateur.
2. Dans le panneau latéral, faites passer les conteneurs dans la liste de droite (filtrez avec **Rechercher un conteneur**).
3. Cliquez sur **Valider**.

La colonne **Permissions** liste alors les conteneurs attribués. Un utilisateur restreint ne voit et n'agit que sur ces conteneurs (logs, shell, copie de fichiers, stats, actions, tâches planifiées).

<Screenshot id="admin-users-grant" alt="Le panneau de modification des permissions avec la liste de transfert des conteneurs" />

## Actions

| Bouton | Effet |
|---|---|
| **Modifier** | Choisir les conteneurs d'un utilisateur restreint |
| **Transformer en admin** | Promouvoir : accès à tous les conteneurs et à toutes les fonctions d'administration |
| **Transformer en utilisateur restreint** | Rétrograder en restreint |
| **Interdire tous les conteneurs** | Passer en restreint et retirer tous les conteneurs attribués |
| **Supprimer** | Supprimer l'utilisateur et révoquer toutes ses clés API |

Votre propre ligne affiche **Utilisateur courant** à la place des boutons : un autre admin doit modifier votre profil.

## Depuis la CLI

```bash
loch users ls
loch users grant alice@example.com web-1 db-1
loch users revoke alice@example.com db-1
loch users promote alice@example.com
loch users demote alice@example.com
loch users rm alice@example.com
```

Voir la documentation de la [Loch CLI](/cli/).

## Bon à savoir

- Les accès portent sur le **nom du conteneur** : un conteneur recréé sous le même nom garde ses utilisateurs, un conteneur renommé les perd.
- Les conteneurs des fonctions (`fn-*`) ne peuvent jamais être attribués à un utilisateur restreint.
- Les conteneurs portant le label `system` ne sont pas listés dans le panel.
- Une clé API porte le profil de son utilisateur : la clé d'un utilisateur restreint n'atteint jamais les routes d'administration, quels que soient ses scopes ([scopes](../reference/scopes.md)).
- Supprimer un utilisateur ne bloque pas son compte OIDC : il obtient un nouveau compte restreint à sa prochaine connexion. Bloquez-le chez le fournisseur.
- Chaque modification est enregistrée dans l'[audit trail](./audit.md).
