# Diamond Frenzy Web

[中文](README.md) | [Disclaimer](DISCLAIMER.md)

Diamond Frenzy Web is a browser-playable adventure puzzle game built with HTML5 Canvas and plain JavaScript. It is inspired by the classic mobile game Diamond Rush and focuses on tile-by-tile movement, digging dirt, collecting diamonds, avoiding falling boulders and enemies, using tools, and unlocking the exit after all diamonds are collected.

## Disclaimer

- This project is an unofficial browser game prototype. It is not an official Gameloft product.
- This project does not include, copy, or distribute the original Diamond Rush JAR, source code, assets, maps, audio, images, character art, or branding files.
- Diamond Rush, Gameloft, and related names, trademarks, and copyrighted materials belong to their respective owners.
- This project is intended only for learning, research, and personal entertainment. It should not be used commercially or represented as an official release.
- For the complete bilingual disclaimer, see [DISCLAIMER.md](DISCLAIMER.md).

## How to Play

Your goal is to collect every diamond in each ruins-themed level, then reach the exit.

Rules:

- The player moves one grid cell at a time.
- Dirt is dug automatically when the player moves into it, awarding a small score bonus.
- Diamonds increase score and count toward the level requirement.
- The exit starts locked and opens only after all diamonds in the current level are collected.
- Boulders block paths, can be pushed horizontally, and fall when unsupported. Falling boulders damage the player.
- After collecting the hammer, the player can break adjacent dirt or boulders.
- Snakes patrol corridors. Touching a snake damages the player and returns the player to the start.
- If health reaches zero, the level fails and can be restarted.

Progress:

- Completed levels, best score, best time, last played level, and highest unlocked level are saved in browser `localStorage`.
- Progress remains after refresh or browser restart on the same browser profile.
- Progress can be lost if the user clears site data, uses private browsing, changes browser/device, or resets storage.

Controls:

- Move: `WASD` or arrow keys
- Use selected tool: `Space`
- Select first inventory slot: `1`
- Pause: `Esc`
- Touch screens: use the on-screen directional pad and hammer action button

## Docker Deployment

Docker Desktop is the recommended local deployment method.

```bash
git clone https://github.com/Hygge8/DiamondFrenzy-Web.git
cd DiamondFrenzy-Web
cp .env.example .env
docker compose up -d --build
```

You can also use the helper script:

```bash
./start.sh
```

Windows PowerShell:

```powershell
.\start.ps1
```

Then open:

```text
http://127.0.0.1:8080
```

Check status:

```bash
docker compose ps
```

Stop:

```bash
docker compose down
```

To change the host port, edit `.env`:

```env
WEB_PORT=8080
```

## Local Development

Use a local HTTP server. Do not open `index.html` directly from the file system.

```bash
npm install
npm start
```

Then open:

```text
http://127.0.0.1:8080
```

## Tests

```bash
npm test
```

Current automated coverage checks:

- `GameEngine` initialization, start, and stop behavior
- `Player` health and diamond collection behavior
- `Enemy` base class behavior
- Grid level loading, selected-level loading, dirt digging, diamond collection, hammer use, and locked-exit rules

## Tech Stack

- HTML5 Canvas
- CSS
- Plain JavaScript loaded through browser globals
- Jest + jsdom
- Docker + Nginx for container deployment
