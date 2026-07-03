if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
}

docker compose up -d --build
docker compose ps

$port = "8080"
if (Test-Path ".env") {
  $match = Select-String -Path ".env" -Pattern "^WEB_PORT=(.+)$" | Select-Object -First 1
  if ($match) {
    $port = $match.Matches[0].Groups[1].Value.Trim()
  }
}

Write-Host "Diamond Frenzy Web is available at http://127.0.0.1:$port"
