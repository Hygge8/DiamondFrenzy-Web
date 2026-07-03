# Diamond Frenzy Web / 钻石狂潮网页版

[中文](README.md) | [English](README_EN.md) | [免责声明 / Disclaimer](DISCLAIMER.md)

## 中文说明

Diamond Frenzy Web 是一个基于 HTML5 Canvas 和原生 JavaScript 制作的网页冒险解谜小游戏。项目玩法受到经典手机游戏 Diamond Rush 的启发，重点还原按格移动、挖土、收集钻石、躲避落石和敌人、使用工具、收齐钻石后开启出口等核心体验。

### 免责声明

- 本项目是非官方的网页小游戏原型，不是 Gameloft 官方作品。
- 本项目未包含、未复制、未分发原版 Diamond Rush 的游戏资源、地图、音频、图像、角色素材或品牌文件。
- Diamond Rush、Gameloft 以及相关名称、商标、版权内容归其各自权利人所有。
- 本项目仅用于学习、研究和个人娱乐目的，不应用于商业用途或冒充官方版本。
- 如果权利方认为本项目存在不当内容，请联系仓库维护者处理。

### 游戏怎么玩

目标是在每个遗迹关卡中收集所有钻石，然后进入出口完成关卡。

基本规则：

- 玩家每次移动一格。
- 走进泥土格会自动挖开泥土，并获得少量分数。
- 收集钻石会增加分数，并计入当前关卡目标。
- 出口初始锁定，只有收齐当前关卡全部钻石后才会开启。
- 巨石会阻挡道路，可以横向推动；如果下方变空，巨石会掉落并伤害玩家。
- 拿到锤子后，可以敲碎面前的泥土或巨石。
- 蛇会在走廊中巡逻，碰到蛇会受伤并回到起点。
- 生命耗尽后关卡失败，可以重新开始。

操作方式：

- 移动：`WASD` 或方向键
- 使用当前道具：`Space`
- 选择第一个背包格：`1`
- 暂停：`Esc`
- 触屏设备：使用屏幕上的方向键和锤子按钮

### 本地运行

请通过本地 HTTP 服务运行，不要直接双击打开 `index.html`。

```bash
npm install
npm start
```

启动后访问：

```text
http://127.0.0.1:8080
```

### Docker 部署

如果已经安装 Docker Desktop，可以使用 Docker Compose 构建并启动容器：

```bash
cp .env.example .env
docker compose up -d --build
```

也可以使用一键脚本：

```bash
./start.sh
```

Windows PowerShell：

```powershell
.\start.ps1
```

启动后访问：

```text
http://127.0.0.1:8080
```

查看容器状态：

```bash
docker compose ps
```

停止 Docker 部署：

```bash
docker compose down
```

如果本地 `npm start` 也在使用 `8080` 端口，请先关闭本地服务，再启动 Docker 容器。

如果需要修改宿主机端口，请编辑 `.env`：

```env
WEB_PORT=8080
```

### 测试

```bash
npm test
```

当前自动化测试覆盖：

- `GameEngine` 初始化、启动、停止
- `Player` 生命值和钻石收集
- `Enemy` 基类行为
- 网格关卡加载、指定关卡加载、挖土、收集钻石、锤子使用、出口锁定/解锁规则

## English

Diamond Frenzy Web is a browser-playable adventure puzzle game built with HTML5 Canvas and plain JavaScript. It is inspired by the classic mobile game Diamond Rush, focusing on tile-by-tile movement, digging dirt, collecting diamonds, avoiding falling boulders and enemies, using tools, and unlocking the exit after all diamonds are collected.

### Disclaimer

- This project is an unofficial browser game prototype. It is not an official Gameloft product.
- This project does not include, copy, or distribute original Diamond Rush assets, maps, audio, images, character art, or branding files.
- Diamond Rush, Gameloft, and related names, trademarks, and copyrighted materials belong to their respective owners.
- This project is intended only for learning, research, and personal entertainment. It should not be used commercially or represented as an official release.
- If any rights holder believes this repository contains inappropriate material, please contact the repository maintainer for removal or correction.

### How to Play

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

Controls:

- Move: `WASD` or arrow keys
- Use selected tool: `Space`
- Select first inventory slot: `1`
- Pause: `Esc`
- Touch screens: use the on-screen directional pad and hammer action button

### Run Locally

Use a local HTTP server. Do not open `index.html` directly from the file system.

```bash
npm install
npm start
```

Then open:

```text
http://127.0.0.1:8080
```

### Docker Deployment

If Docker Desktop is installed, build and start the container with Docker Compose:

```bash
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

Check container status:

```bash
docker compose ps
```

Stop the Docker deployment:

```bash
docker compose down
```

If local `npm start` is already using port `8080`, stop the local server before starting the Docker container.

To change the host port, edit `.env`:

```env
WEB_PORT=8080
```

### Tests

```bash
npm test
```

Current automated coverage checks:

- `GameEngine` initialization, start, and stop behavior
- `Player` health and diamond collection behavior
- `Enemy` base class behavior
- Grid level loading, selected-level loading, dirt digging, diamond collection, hammer use, and locked-exit rules

## Tech Stack / 技术栈

- HTML5 Canvas
- CSS
- Plain JavaScript loaded through browser globals / 通过浏览器全局变量加载的原生 JavaScript
- Jest + jsdom
- `http-server` for local development / 用于本地开发的 `http-server`
- Docker + Nginx for container deployment / 用于容器部署的 Docker + Nginx
