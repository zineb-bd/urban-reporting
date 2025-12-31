Write-Host "Démarrage du backend Spring Boot..." -ForegroundColor Green
Write-Host ""
Write-Host "ATTENTION: Ce projet nécessite Java 17 ou 21." -ForegroundColor Yellow
Write-Host "Votre version actuelle de Java:" -ForegroundColor Yellow
java -version
Write-Host ""
Write-Host "Si vous avez Java 24, veuillez installer Java 17 ou 21." -ForegroundColor Red
Write-Host ""
Write-Host "Tentative de démarrage..." -ForegroundColor Cyan

Set-Location $PSScriptRoot
mvn clean spring-boot:run

