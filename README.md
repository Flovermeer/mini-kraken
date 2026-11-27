# Mini-Kraken

<p><b>English</b> · <a href="./README.fr.md">Français</a></p>

**A self-hosted system of modular digital photo frames, running on a Raspberry Pi 4 on the
local network, and managed from a mobile app called *Frame-o-Matic*.**

> 🛠️ **Hand-coded project**: unlike my [Beholder's Inn](https://github.com/Flovermeer/gm-display-manager)
> experiment, which was written entirely by AI agents, I write Mini-Kraken's application code
> myself. AI is used as a mentor and code reviewer: explaining concepts and challenging my design
> choices. At most, I occasionally delegate a chore to it, such as some tests or a commit.
>
> 🚧 **Work in progress**: the API and the app are under active development, and the frames
> themselves are not built yet. Screenshots will come once the interface is stable.

## The idea

Several small screens hung together on the wall like a photo collage, each one showing its own
picture, all managed from a phone. No cloud, no subscription, no account: everything runs at
home.

## Hardware

### The server: a Raspberry Pi 4

The Pi is the heart of the system. It hosts the API, the database and the photos, and it decides
which picture each frame displays. **Nothing depends on the Internet**: if the connection goes
down, the frames keep working.

Planned setup:

- the back end deployed in a **Docker** container (managed with Portainer);
- a **dedicated Wi-Fi access point** on the Pi for the frames, isolated from the Internet, while
  the Pi itself stays connected to the home router over Ethernet;
- the server reachable through **mDNS** (`mini-kraken.local`), with no IP configuration.

### The frames: finding the right screens

Finding suitable frames turned out to be a challenge in its own right. The requirements:

- **screen and microcontroller on the same board**, bought assembled: no soldering, no wiring;
- **Wi-Fi** and **USB-C** power;
- supported by **[ESPHome](https://esphome.io/)**, to flash the firmware simply;
- enough memory (**PSRAM**) to display full-screen photos;
- a **thin wall mount** with **a single cable** coming out, powering several screens at once.

The choice: **Elecrow CrowPanel Advance 7"** boards (ESP32-S3, 800 × 480 IPS touchscreen), in a
3D-printed frame. Each screen remains an independent Wi-Fi frame with its own identifier.

## Features

What works today:

- **Places**: create, list and edit the places where frames hang;
- **Frame discovery** on the local network (mDNS / DNS-SD, `_minikraken._tcp` service);
- **Pairing**, renaming, moving and removing frames;
- **Photos**: upload (resized automatically), paginated listing, gallery with infinite scroll,
  full-screen view with swipe, deletion.

Next steps: frame firmware (ESPHome), server-side photo rotation, deployment on the Pi.

## Toward home automation

The Pi is meant to become a **home automation hub**. Mini-Kraken is designed with that in mind:
an **MQTT** broker (Mosquitto) and **Home Assistant** will be able to run alongside the API in
containers, and ESPHome frames fit naturally into that ecosystem.

## Tech stack

| Part | Technologies |
|---|---|
| API contract | **OpenAPI 3** (contract-first, shared between back end and app) |
| Back end | Node.js, TypeScript, **Fastify**, SQLite (`node:sqlite`), sharp (image processing), bonjour-service (mDNS) |
| Mobile app | **Ionic / Angular** (signals, signal forms), Capacitor, client generated from the contract |
| Tests | Vitest, Playwright, mDNS frame simulator for development |
| Infrastructure (planned) | Raspberry Pi 4, Docker, Portainer, ESPHome |

**Contract-first** approach: the OpenAPI contract is written first. The back end validates
requests against it, and the app's TypeScript client is generated from it, so both sides always
speak the same language.

## Repository layout

```
back/      Fastify API
openapi/   OpenAPI contract (paths, schemas, responses)
front/     Ionic / Angular app
```

## License

© 2026 Florence Vermeerbergen. All rights reserved.

The source code is published for demonstration purposes. Any reproduction, modification or
redistribution, in whole or in part, requires prior written permission. See
[`LICENSE`](./LICENSE).
