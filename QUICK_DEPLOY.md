# Quick Deploy / 快速部署

## Docker Desktop

```bash
git clone https://github.com/Hygge8/DiamondFrenzy-Web.git
cd DiamondFrenzy-Web
cp .env.example .env
docker compose up -d --build
```

Or:

```bash
./start.sh
```

Open:

```text
http://127.0.0.1:8080
```

Stop:

```bash
docker compose down
```

## Windows PowerShell

```powershell
git clone https://github.com/Hygge8/DiamondFrenzy-Web.git
cd DiamondFrenzy-Web
Copy-Item .env.example .env
docker compose up -d --build
```

Or:

```powershell
.\start.ps1
```

## Update Existing Deployment / 更新已有部署

```bash
git pull origin main
docker compose up -d --build
```

## Port Conflict / 端口冲突

If `8080` is occupied, edit `.env`:

```env
WEB_PORT=8081
```

Then restart:

```bash
docker compose up -d
```
