# Deployment Guide / 部署指南

## Recommended: Docker Compose / 推荐：Docker Compose

Docker Desktop is the recommended way to run Diamond Frenzy Web locally because it matches a production-style static Nginx deployment.

推荐使用 Docker Desktop 本地运行，因为它和生产环境中的 Nginx 静态站点部署方式一致。

```bash
git clone https://github.com/Hygge8/DiamondFrenzy-Web.git
cd DiamondFrenzy-Web
cp .env.example .env
docker compose up -d --build
```

Shortcut:

```bash
./start.sh
```

Open:

```text
http://127.0.0.1:8080
```

Check status:

```bash
docker compose ps
```

Shortcut:

```powershell
.\start.ps1
```

View logs:

```bash
docker compose logs -f diamond-frenzy-web
```

Stop:

```bash
docker compose down
```

Change the host port in `.env`:

```env
WEB_PORT=8080
```

After changing `.env`, recreate the container:

```bash
docker compose up -d
```

## Windows PowerShell

```powershell
git clone https://github.com/Hygge8/DiamondFrenzy-Web.git
cd DiamondFrenzy-Web
Copy-Item .env.example .env
docker compose up -d --build
docker compose ps
```

## Local Node Server / 本地 Node 服务

Use this only for development. Stop it before starting Docker if both use port `8080`.

这只适合开发调试。如果 Docker 也使用 `8080` 端口，请先停止本地 Node 服务。

```bash
npm install
npm start
```

## GitHub Pages

This project is a static site and can also be served by GitHub Pages.

1. Push the repository to GitHub.
2. Open repository `Settings`.
3. Go to `Pages`.
4. Select `Deploy from a branch`.
5. Select branch `main` and folder `/ (root)`.
6. Save and wait for GitHub Pages to publish.

Expected URL:

```text
https://<username>.github.io/DiamondFrenzy-Web/
```

## Troubleshooting / 故障排查

- If `8080` is already used, stop the local server or change `WEB_PORT` in `.env`.
- If Docker Desktop shows the container as stopped, run `docker compose logs diamond-frenzy-web`.
- If the page loads but scripts fail, verify `index.html`, `css/`, and `js/` are copied into the image.
- If the browser caches old files, refresh with cache disabled or recreate the container with `docker compose up -d --build`.
