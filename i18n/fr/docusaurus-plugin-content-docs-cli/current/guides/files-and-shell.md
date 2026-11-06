---
sidebar_position: 3
title: Fichiers, shell, logs et tunnels
description: Copier des fichiers depuis ou vers un conteneur, ouvrir un shell, lire les logs et les fichiers de log, et joindre un port d'un conteneur depuis votre machine.
---

# Fichiers, shell, logs et tunnels

Ces commandes agissent sur un conteneur du namespace actif. Tout le trafic passe par le panel en HTTPS (WebSocket) : elles fonctionnent derrière un pare-feu ou un proxy d'entreprise.

## Copier des fichiers

Écrivez `service:chemin` pour le côté conteneur. Les fichiers et dossiers sont copiés sous forme de flux tar.

```bash
loch cp php:/var/www/html ./html      # conteneur vers local
loch cp ./file.txt php:/tmp/file.txt  # local vers conteneur
```

## Ouvrir un shell

```bash
loch shell php
```

Le terminal suit le redimensionnement et transmet Ctrl+C au conteneur.

## Lire les logs

| Commande | Affiche |
|---|---|
| `loch logs <service>` | La sortie du conteneur (stdout/stderr), puis rend la main. |
| `loch logs -f <service>` | Suit la sortie en temps réel. |
| `loch logs <service> <fichier>` | Les 1000 dernières lignes d'un fichier du conteneur. |
| `loch logs -f <service> <fichier>` | Suit le fichier. |

`-n <lignes>` limite le nombre de lignes (`0` = toutes).

```bash
loch logs -n 200 php
loch logs -f php /var/log/app.log
```

La lecture d'un fichier demande la commande `tail` dans le conteneur.

## Ouvrir un tunnel vers un port

`loch proxy` redirige un port du conteneur vers un port local, même si ce port n'est pas publié.

```bash
loch proxy postgres 5432:15432        # port 5432 du conteneur sur localhost:15432
psql -h 127.0.0.1 -p 15432 -U myuser mydb
```

Donnez plusieurs paires `distant:local` pour ouvrir plusieurs ports sur une seule connexion. Arrêtez le tunnel avec Ctrl+C.

## Droits

| Commande | Scope |
|---|---|
| `cp` | `containers:cp` |
| `shell` | `containers:shell` |
| `logs` | `containers:logs` |
| `proxy` | `containers:proxy` |

Chaque commande demande aussi `containers:read`, pour trouver le conteneur.

## Bon à savoir

- Un tunnel accepte au plus 10 redirections de ports et 256 connexions simultanées.
- `loch cp` vers un conteneur échoue si le dossier de destination n'existe pas.
- Un shell exécute n'importe quelle commande dans le conteneur : réservez `containers:shell` aux clés qui en ont besoin.
