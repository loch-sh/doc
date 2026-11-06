---
sidebar_position: 6
title: Limites
description: Limites de taille, de durée et de connexions appliquées par Loch S3 1.4.1.
---

# Limites

| Élément | Limite |
|---|---|
| Nom de bucket | 3 à 63 caractères : `a-z`, `0-9`, `-`, `.` ; commence et finit par une lettre ou un chiffre ; pas de `..` |
| Clé d'objet | 1 024 octets, 64 niveaux séparés par `/` ; aucun segment `.`, `..` ou vide (un seul `/` final est permis). Une clé ne peut pas être aussi le « dossier » d'une autre clé (`a` et `a/b`) |
| Taille d'objet | Aucune limite hors quota et disque : les corps sont écrits en flux |
| Métadonnées utilisateur (`x-amz-meta-*`) | 2 Kio au total |
| En-têtes conservés (`Content-Type`, `Cache-Control`, `Content-Disposition`, `Content-Encoding`, `Content-Language`, `Expires`) | 8 Kio au total |
| Multipart | Numéros de partie de 1 à 10 000 ; pas de limite de taille de partie ; envois inachevés supprimés après `S3_UPLOAD_TTL` (24 h) |
| Listage | 1 000 clés par page |
| Corps de requête | Politique de bucket 20 Kio ; configuration CORS et chiffrement 64 Kio ; ACL 16 Kio ; configuration du versionnage 4 Kio ; `CompleteMultipartUpload` 10 Mio ; API d'administration 64 Kio |
| URL présignée | De 1 seconde à 7 jours |
| Décalage d'horloge | 15 minutes |
| En-têtes de requête (HTTP/1) | Reçus en 30 secondes |
| Nouvelle connexion inactive | Fermée après 30 secondes sans un octet |
| Corps d'envoi | Interrompu après 60 secondes sans données, ou sous `S3_MIN_UPLOAD_RATE` (4096 octets/s) sur 60 secondes |
| Connexions | `S3_MAX_CONNECTIONS` (1024) |
| HTTP/2 | Ping toutes les 30 secondes, coupure après 20 secondes sans réponse ; 128 flux par connexion |
| En-tête de chunk `aws-chunked` | 4 096 octets |
| Bloc de chiffrement | 1 Mio ; chaque bloc ajoute 16 octets sur disque |

Au-delà d'une limite de taille, le serveur répond `413 EntityTooLarge`.
