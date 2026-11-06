---
sidebar_position: 5
title: Clés API
description: Créez une clé API pour la Loch CLI ou un script, limitez ses permissions et révoquez-la.
---

# Clés API

Une clé API permet à la [CLI `loch`](/cli/), à son serveur MCP ou à un script d'agir sur le panel en votre nom. Chaque utilisateur gère ses propres clés sur la page **Clés API** (menu **Administration**).

## Créer une clé

1. Cliquez sur **Nouvelle clé**.
2. Remplissez le formulaire :

| Champ | Valeur |
|---|---|
| **Nom** | Un nom pour reconnaître la clé, par exemple `CLI MacBook Pro` |
| **Durée de validité (jours)** | De 1 à 365 jours (90 par défaut) |
| **Permissions** | **Toutes les permissions**, ou seulement celles dont la clé a besoin |

3. Cliquez sur **Créer**.
4. Copiez la clé, puis cliquez sur **J'ai copié ma clé**.

<Screenshot id="apikey-created" alt="La fenêtre de clé API créée avec la clé et les commandes de la CLI" />

:::warning
La clé n'est affichée qu'une seule fois. Si vous la perdez, révoquez-la et créez-en une nouvelle.
:::

La fenêtre affiche aussi les commandes pour configurer la CLI :

```bash
loch config mon-serveur --url https://panel-api.example.com
loch login
```

Collez la clé quand `loch login` la demande. Voir [Installer la CLI](/cli/install/).

## Permissions

Une clé ne donne jamais plus que votre profil : une permission d'administration sur la clé d'un utilisateur ne donne rien. Choisissez le minimum, par exemple **Lecture (lister, inspecter)** et **Logs (télécharger, streaming)** pour un script de supervision.

Liste complète : [Scopes des clés API](../reference/scopes.md).

## La liste des clés

<Screenshot id="apikeys-list" alt="La page Clés API avec le préfixe, les permissions et l'expiration de chaque clé" />

| Colonne | Contenu |
|---|---|
| **Préfixe** | Les premiers caractères de la clé, pour l'identifier |
| **Permissions** | Les permissions accordées, ou **Toutes** |
| **Expire le** | Date d'expiration ; **(expirée)** une fois passée |
| **Dernière utilisation** | Dernière requête faite avec la clé |

Pour révoquer une clé, cliquez sur **Révoquer** sur sa ligne et confirmez. Cette action est irréversible.

## Bon à savoir

- 20 clés au maximum par utilisateur.
- Une clé créée avec une clé limitée ne peut pas avoir plus de permissions que celle-ci.
- La suppression de votre utilisateur révoque toutes vos clés.
- Conservez la clé comme un mot de passe : quiconque la détient agit en votre nom.
