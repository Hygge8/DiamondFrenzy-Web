# Diamond Frenzy Web

Diamond Frenzy Web is a browser-playable, Diamond Rush-inspired adventure puzzle game built with HTML5 Canvas and plain JavaScript.

This project is not an official Gameloft release and does not include original Diamond Rush assets, audio, maps, or branding files. The implementation focuses on the classic mobile gameplay structure: tile-by-tile movement, digging dirt, collecting diamonds, avoiding falling boulders and enemies, collecting tools, and unlocking the exit after all diamonds are collected.

## Run Locally

Use a local HTTP server. Do not open `index.html` directly from the file system.

```bash
npm install
npm start
```

Then open:

```text
http://127.0.0.1:8080
```

## Controls

- Move: `WASD` or arrow keys
- Use selected tool: `Space`
- Select first inventory slot: `1`
- Pause: `Esc`

## Gameplay

- Move one grid cell at a time.
- Dirt is dug automatically when the player moves into it.
- Diamonds add score and count toward the exit requirement.
- The exit remains locked until all diamonds in the current level are collected.
- Boulders can block paths, be pushed horizontally, fall when unsupported, and damage the player.
- The hammer can break adjacent dirt or boulders after it is collected.
- Snake enemies patrol corridors and damage the player on contact.

## Tests

```bash
npm test
```

Current automated coverage checks:

- `GameEngine` initialization, start, and stop behavior
- `Player` health and diamond collection behavior
- `Enemy` base class behavior
- First level grid loading, dirt digging, diamond collection, and locked-exit rules

## Tech Stack

- HTML5 Canvas
- CSS
- Plain JavaScript loaded through browser globals
- Jest + jsdom
- `http-server` for local development
