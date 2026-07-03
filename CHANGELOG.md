# Changelog / 更新日志

All notable changes to Diamond Frenzy Web are documented here.

## Unreleased

- More levels and puzzle mechanics.
- Improved sound effects and visual polish.
- Better mobile layout tuning.

## 2026-07-03

### Added

- Docker Compose deployment with Nginx static hosting.
- `.env.example` with configurable `WEB_PORT`.
- Bilingual README, standalone English README, and standalone disclaimer.
- Browser `localStorage` progress saving for completed levels, best scores, best times, and last played level.
- Clean deployment guides for Docker Desktop, Windows PowerShell, local Node server, and GitHub Pages.
- `start.sh` and `start.ps1` helper scripts for Docker startup.
- Level selection for available Angkor Wat, Bavaria, and Tibet levels.
- Touch-screen directional pad and hammer action button.

### Changed

- Reworked gameplay toward Diamond Rush-style grid puzzle mechanics.
- Replaced free-movement prototype behavior with tile movement, dirt digging, diamond collection, boulders, snakes, hammer use, and locked exits.
- Fixed keyboard controls in normal browsers by capturing game keys globally, focusing the game canvas when a level starts, and disabling stale JS/CSS cache in Docker.
- Changed level rendering to use a larger fixed-tile world with a smooth player-following camera instead of scaling the whole map into the viewport.
- Updated tests to cover selected-level loading, hammer use, dirt digging, diamond collection, and exit rules.
- Updated Docker/Nginx configuration to copy only runtime static files.

### Verified

- `npm test -- --runInBand` passes.
- Docker container serves the app on `http://127.0.0.1:8080`.
- Docker Compose container reports healthy.
