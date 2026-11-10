---
sidebar_position: 2
title: Comptes SFTP
description: Activez le module SFTP (SFTPGo) et donnez aux propriétaires de sites un accès SFTP à leurs fichiers.
---

# Comptes SFTP

Le module SFTP crée des utilisateurs SFTPGo pour que les propriétaires de sites déposent leurs fichiers. SFTPGo est la seule source de vérité : le panel ne stocke rien.

:::note
Réservé aux admins. Nécessite un [SFTPGo](https://github.com/drakkan/sftpgo) en fonctionnement et `SFTP_ENABLED=true`.
:::

## Activer le module

1. Dans l'interface d'administration de SFTPGo, créez une clé d'API admin.
2. Ajoutez les variables au `.env` de l'API :

   ```env
   SFTP_ENABLED=true
   SFTP_DIRECTORY=/data/websites/hosted
   SFTP_API_URL=http://sftpgo:8080
   SFTP_API_KEY=<la clé d'API admin>
   SFTP_DOMAIN=sftp.example.com
   SFTP_PORT=2222
   SFTP_WEB_USER_INTERFACE=https://sftp.example.com/web/client
   ```

3. Redémarrez l'API. **Hébergement → SFTP** apparaît pour les admins.

| Variable | Rôle | Défaut |
|---|---|---|
| `SFTP_DIRECTORY` | Répertoire de base des sites | obligatoire |
| `SFTP_API_URL` | URL interne de l'API d'administration SFTPGo | obligatoire |
| `SFTP_API_KEY` | Clé d'API admin SFTPGo | obligatoire |
| `SFTP_DOMAIN`, `SFTP_PORT` | Informations de connexion affichées aux utilisateurs | aucun |
| `SFTP_WEB_USER_INTERFACE` | URL du client web SFTPGo affichée aux utilisateurs | aucun |
| `SFTP_INIT_DIRS` | Répertoires créés dans le dossier d'un nouvel utilisateur (vide : aucun) | `web,logs` |

Utilisez le même répertoire que `HOSTING_SITES_DIRECTORY` pour que les utilisateurs SFTP modifient les fichiers des [sites web](./sites.md). Seuls les utilisateurs SFTPGo dont le dossier est sous `SFTP_DIRECTORY` sont affichés ; les autres sont ignorés.

## Sites et utilisateurs

- Un **site** est un répertoire sous `SFTP_DIRECTORY`. Il est créé avec son premier utilisateur et partagé par tous ses utilisateurs.
- Un **utilisateur** peut être limité à un **Sous-répertoire** du site (par exemple `clients/smith`). Laissez vide pour tout le site. Il est fixé à la création et ne peut plus changer.

<Screenshot id="sftp-sites-list" alt="La page Utilisateurs SFTP avec un site déplié et un utilisateur limité à un sous-dossier" />

## Créer un utilisateur

1. Ouvrez **Hébergement → SFTP** et cliquez sur **Nouvel utilisateur** (ou **Ajouter un utilisateur** sur la ligne d'un site).
2. Remplissez le formulaire :

   | Champ | Remarques |
   |---|---|
   | **Site** | Créé s'il n'existe pas |
   | **Sous-répertoire** | Facultatif, fixé après la création |
   | **Nom d'utilisateur** | |
   | **Mot de passe** | 8 caractères au moins. **Générer** en crée un robuste |
   | **Clé SSH publique** | Facultative : connexion sans mot de passe |
   | **Quota de taille**, **Quota de fichiers**, **Limite de bande passante** | Vide : illimité |
   | **Changement de mot de passe à la première connexion** | |
   | **Initialiser les répertoires** | Crée les répertoires de `SFTP_INIT_DIRS` dans le dossier de l'utilisateur |

3. Cliquez sur **Créer l'utilisateur**, puis sur **Copier la connexion** pour transmettre les informations au propriétaire.

```bash
loch sftp create client1 --site my-site --subpath clients/smith
```

Toutes les options : [guide CLI SFTP](/cli/guides/sftp/).

L'initialisation des répertoires se fait au mieux : si elle échoue, l'utilisateur est quand même créé et un avertissement s'affiche.

## Gérer les utilisateurs

| Action | Effet |
|---|---|
| **Modifier** | Change la clé SSH, les quotas, la bande passante et l'obligation de changer le mot de passe. Le site et le sous-répertoire restent fixes |
| **Réinitialiser le mot de passe** | Définit un nouveau mot de passe (8 caractères au moins) |
| **Activer** / **Désactiver** | Autorise ou bloque les connexions |
| **Supprimer** | Supprime le compte. Les fichiers restent sur le disque |

```bash
loch sftp reset-password client1
```

Sans `--password`, la CLI demande le nouveau mot de passe de façon interactive : il n'apparaît pas dans l'historique du shell.

## Client web

Quand `SFTP_WEB_USER_INTERFACE` est défini, la page affiche le lien **Interface web client** : les utilisateurs gèrent leurs fichiers depuis un navigateur, sans client SFTP.

## Bon à savoir

- Les mots de passe ne sont jamais journalisés ni renvoyés par le panel : transmettez-les vous-même au propriétaire, par un canal sûr.
- Via le serveur MCP, un mot de passe généré faute d'en fournir un est renvoyé **une seule fois**.
- Le dossier de l'utilisateur est construit par l'API : ni le site ni le sous-répertoire ne peuvent sortir de `SFTP_DIRECTORY` (pas de `.`, `..` ni de séparateur ; un point initial comme `.well-known` est autorisé).
- Chaque opération est enregistrée dans le journal d'audit.
