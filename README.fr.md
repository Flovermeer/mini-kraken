# Mini-Kraken

<p><a href="./README.md">English</a> · <b>Français</b></p>

**Un système auto-hébergé de cadres photo numériques modulaires, qui tourne sur un Raspberry
Pi 4 en réseau local et se gère depuis une application mobile, *Frame-o-Matic*.**

> 🛠️ **Projet codé à la main** : contrairement à mon expérience
> [Beholder's Inn](https://github.com/Flovermeer/gm-display-manager), entièrement écrite par des
> agents IA, j'écris moi-même le code applicatif de Mini-Kraken. L'IA intervient comme mentor et
> relectrice de code : elle explique des concepts et challenge mes choix de conception. Tout au
> plus, je lui délègue ponctuellement une tâche annexe, comme quelques tests ou un commit.
>
> 🚧 **En cours de développement** : l'API et l'application avancent, les cadres physiques ne
> sont pas encore montés. Les captures d'écran viendront quand l'interface sera stabilisée.

## L'idée

Plusieurs petits écrans réunis au mur comme un pêle-mêle, chacun avec sa propre photo, le tout
piloté depuis un téléphone. Pas de cloud, pas d'abonnement, pas de compte : tout tourne à la
maison.

## Le matériel

### Le serveur : un Raspberry Pi 4

Le Pi est le cœur du système. Il héberge l'API, la base de données et les photos, et décide de
la photo affichée par chaque cadre. **Rien ne dépend d'Internet** : si la connexion tombe, les
cadres continuent de fonctionner.

Mise en place prévue :

- le back déployé dans un conteneur **Docker** (géré avec Portainer) ;
- un **point d'accès Wi-Fi dédié** aux cadres sur le Pi, isolé d'Internet, le Pi restant relié à
  la box en Ethernet ;
- un serveur joignable par **mDNS** (`mini-kraken.local`), sans configuration d'adresse IP.

### Les cadres : trouver les bons écrans

Trouver des cadres adaptés a été un défi à part entière. Le cahier des charges :

- **écran et microcontrôleur sur la même carte**, achetés assemblés : ni soudure, ni câblage ;
- **Wi-Fi** et alimentation en **USB-C** ;
- compatibles **[ESPHome](https://esphome.io/)**, pour flasher le firmware simplement ;
- assez de mémoire (**PSRAM**) pour afficher des photos en plein écran ;
- un **support mural fin**, avec **un seul câble** qui en sort pour alimenter plusieurs écrans.

Le choix : des cartes **Elecrow CrowPanel Advance 7"** (ESP32-S3, écran IPS tactile 800 × 480),
dans un cadre imprimé en 3D. Chaque écran reste un cadre Wi-Fi indépendant, avec son propre
identifiant.

## Fonctionnalités

Ce qui fonctionne aujourd'hui :

- **Lieux** : création, liste et modification des lieux où sont accrochés les cadres ;
- **Découverte des cadres** sur le réseau local (mDNS / DNS-SD, service `_minikraken._tcp`) ;
- **Appairage**, renommage, déplacement et suppression des cadres ;
- **Photos** : envoi (redimensionnement automatique), listing paginé, galerie en infinite scroll,
  affichage en grand avec swipe, suppression.

Prochaines étapes : firmware des cadres (ESPHome), rotation des photos côté serveur, déploiement
sur le Pi.

## Vers la domotique

Le Pi a vocation à devenir un **hub domotique**. Mini-Kraken est pensé dans ce sens : un broker
**MQTT** (Mosquitto) et **Home Assistant** pourront tourner à côté de l'API dans des conteneurs,
et des cadres sous ESPHome s'intègrent naturellement dans cet écosystème.

## Stack technique

| Partie | Technologies |
|---|---|
| Contrat d'API | **OpenAPI 3** (contract-first, partagé entre le back et l'application) |
| Back | Node.js, TypeScript, **Fastify**, SQLite (`node:sqlite`), sharp (traitement d'images), bonjour-service (mDNS) |
| Application mobile | **Ionic / Angular** (signals, signal forms), Capacitor, client généré depuis le contrat |
| Tests | Vitest, Playwright, simulateur de cadre mDNS pour le développement |
| Infrastructure (prévue) | Raspberry Pi 4, Docker, Portainer, ESPHome |

Approche **contract-first** : le contrat OpenAPI est écrit en premier. Le back valide les
requêtes à partir de ce contrat, et le client TypeScript de l'application en est généré : les
deux côtés parlent toujours le même langage.

## Organisation du dépôt

```
back/      API Fastify
openapi/   contrat OpenAPI (paths, schémas, réponses)
front/     application Ionic / Angular
```

## Licence

© 2026 Florence Vermeerbergen. Tous droits réservés.

Le code source est publié à titre de démonstration. Toute reproduction, modification ou
redistribution, totale ou partielle, nécessite une autorisation écrite préalable. Voir
[`LICENSE`](./LICENSE).
