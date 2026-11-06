---
sidebar_position: 8
title: Audit trail
description: Ce qu'enregistre l'audit trail de Loch Panel, comment le consulter et le protéger contre toute altération.
---

# Audit trail

L'API enregistre chaque action effectuée sur le panel dans `<API_LOG_DIR>/audit.log`. Seuls les admins peuvent le consulter, et personne ne peut le modifier depuis le panel.

## Ce qui est enregistré

| Type | Exemples |
|---|---|
| Authentification | Connexions, déconnexions, échecs de connexion, comptes créés à la première connexion |
| Conteneurs | Actions sur les conteneurs et les stacks, shell, logs, suivi de fichier, proxy de ports, copies de fichiers |
| Administration | Utilisateurs, clés API, tâches planifiées, utilisateurs SFTP, sites web, services managés, réseaux privés, fonctions |
| Invocations de fonctions | `function invoked` : une entrée par fonction et par minute, avec le nombre d'invocations, les erreurs et les utilisateurs ; jamais l'événement ni la réponse |
| Chaque requête d'écriture | `api request` : méthode, chemin, statut, utilisateur, identifiant de clé API, IP du client |
| Chaque requête refusée | `access denied` : 403, ou 401 avec une clé API |
| Lectures sensibles | Inspection de conteneur (elle montre les variables d'environnement), réglages d'un site, téléchargements et suivis de fichiers |
| Le journal lui-même | Chaque consultation (`audit trail viewed`) |

Ce qui n'est jamais écrit :

- **Aucun secret** : ni mot de passe, ni jeton, ni en-tête, ni corps de requête.
- Les valeurs texte sont tronquées à 2 Ko.
- Les refus anonymes sont regroupés en une entrée par IP et par minute ; les routes inconnues sont ignorées. Un client anonyme ne peut pas saturer le journal.

Chaque ligne est un objet JSON : `time`, `level`, `msg` (l'événement) et des champs structurés.

## Le consulter

### Dans l'interface

1. Ouvrez **Sécurité → Audit trail**.
2. Filtrez par **Plage de dates** (raccourcis : **Dernière heure**, **Dernières 24 heures**, **7 derniers jours**, **30 derniers jours**), **Événements**, **Niveaux** et **Utilisateur (e-mail)**, ou saisissez du texte dans **Rechercher dans tous les champs**.
3. Cliquez sur **Charger les entrées plus anciennes** pour remonter dans le temps.

Les consultations du journal sont masquées par défaut : activez **Afficher les consultations de l'audit trail** pour les voir.

<Screenshot id="admin-audit-trail" alt="La page Audit trail avec ses filtres et quelques entrées" />

### Par l'API

`GET /audit`, réservé aux admins. Une clé API doit avoir le scope `audit:read`. Les entrées arrivent de la plus récente à la plus ancienne, avec un curseur pour les pages précédentes. Voir la [référence de l'API](../reference/api.md).

## Le protéger

- **Montez le répertoire des logs.** Dans l'image, `/app/log` est un volume. Montez-le (`-v /srv/loch/log:/app/log`), sinon le journal est perdu quand le conteneur est recréé.
- **Aucune route d'écriture** : le journal est en lecture seule depuis le panel.
- **Le conteneur de l'API est protégé** : shell, copie de fichiers, suivi de fichier et tâches planifiées `exec` y sont refusés, car ils donneraient accès à `audit.log`.
- **Root sur l'hôte peut toujours modifier le fichier.** Pour une intégrité plus forte, envoyez-le vers un syslog distant ou passez-le en ajout seul (`chattr +a`).
- **Rotation** : l'API ne fait pas tourner le fichier. Surveillez l'espace disque.

## Bon à savoir

- Derrière un reverse proxy, renseignez `TRUSTED_PROXIES`, sinon chaque entrée affiche l'IP du proxy.
- Une écriture qui échoue (disque plein, fichier supprimé) est signalée sur la sortie d'erreur de l'API.
