---
sidebar_position: 5
title: Modèle de sécurité
description: Ce que le code de la fonction, un appelant réseau et une page web peuvent faire ou non, et les protections qui en découlent.
---

# Modèle de sécurité

Le code de la fonction n'est pas fiable. Il tourne sous l'uid du runtime, dans le même conteneur, et les uid ne peuvent pas être séparés sans capabilities. D'où la règle : **aucun secret exploitable dans le conteneur**.

## Ce que peut faire le code de la fonction

| Action | Conséquence | Protection |
|---|---|---|
| Lire l'environnement des processus `docker exec` (`/proc/<pid>/environ`) | Un jeton en clair ou un secret SigV4 est lisible | Utilisez le jeton bearer sous forme de SHA-256 (`LOCH_RUNTIME_TOKEN_SHA256`) : le jeton n'entre jamais dans le conteneur. Le runtime est non dumpable et retire les variables d'identifiants de son propre environnement |
| Lire son propre secret SigV4 | Elle peut s'invoquer elle-même, ce qu'elle peut déjà faire par la loopback | Ne présentez jamais le secret SigV4 comme protégé de la fonction |
| Envoyer SIGHUP au PID 1 | Les fichiers d'identifiants sont relus | Les fichiers que l'utilisateur du runtime pourrait modifier sont refusés |
| Envoyer SIGTERM, SIGQUIT, … au PID 1 | Elle arrête son propre conteneur | Sans effet au-delà d'elle-même |
| Baisser son `oom_score_adj` (1000 au démarrage) | Un OOM peut tuer le PID 1 au lieu du bootstrap | Sans effet au-delà d'elle-même |
| Forger des lignes `START`, `END`, `REPORT` | Les logs ne sont pas fiables | Ne facturez et n'alertez jamais à partir des logs : utilisez `/_loch/metrics`, l'enveloppe d'`invoke` ou `/_loch/health` |
| S'invoquer par la loopback | Aucun identifiant nécessaire | Bornée par le plafond global de connexions |

Un healthcheck en forme shell (`CMD-SHELL`) laisse un shell qui contient tout l'environnement du conteneur : utilisez la forme exec.

## Ce que peut faire un appelant réseau sans identifiant

| Action | Remarque |
|---|---|
| Lire `/_loch/health` | État et profondeur de file uniquement |
| Distinguer un access key id valide d'un mauvais | Comme sur AWS. Gardez l'access key id aléatoire et privé |

Tout le reste répond 401 ou 403. Un jeton bearer est vérifié avant la lecture du corps ; une requête SigV4 est vérifiée autant que possible avant, et son corps dispose d'un budget borné qui lui est propre tant qu'il n'est pas vérifié. Chaque IP source a ses propres plafonds de connexions et de requêtes : un appelant ne peut pas prendre toutes les places.

## Ce que peut faire une page web

Rien : les requêtes d'un navigateur (en-tête `Origin`, `Sec-Fetch-Site`, `Sec-Fetch-Dest` ou `Sec-Fetch-User`) reçoivent 403, même authentification désactivée, ce qui bloque le CSRF et le DNS rebinding. `LOCH_RUNTIME_ALLOW_BROWSER=true` lève ce blocage. Authentification désactivée, une page pourrait encore lire `/_loch/metrics` par DNS rebinding.

## Limites du modèle

- L'exemption de la loopback suppose que le conteneur a son propre espace de noms réseau : n'utilisez jamais `--network host`.
- L'API Invoke est en HTTP clair, et une requête SigV4 peut être rejouée dans la tolérance d'horloge de ±5 min : exposez-la sur des réseaux privés uniquement.
- Un rechargement d'identifiants qui échoue garde les anciens : pour révoquer, redémarrez avec de nouveaux identifiants.

## Durcissement

Lancez sous un uid non root, avec un rootfs en lecture seule, `--cap-drop ALL`, `no-new-privileges`, un `/tmp` en tmpfs, une limite mémoire sans swap, des limites de CPU et de processus. Le binaire n'écrit rien hors de `/tmp`. Voir [Exécuter en production](../guides/production.md).

---

« AWS » et « AWS Lambda » sont des marques d'Amazon.com, Inc. ou de ses sociétés affiliées. Ce projet n'est ni affilié à Amazon ni approuvé par Amazon. Il implémente les API Runtime et Invoke d'AWS Lambda, documentées publiquement, et ne contient aucun code de l'AWS Lambda Runtime Interface Emulator.
