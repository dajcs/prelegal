Set-Location "$PSScriptRoot\.."
docker compose up --build -d
Write-Host "PreLegal running at http://localhost:8000"
