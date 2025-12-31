Write-Host "Démarrage du backend Spring Boot avec PostgreSQL..." -ForegroundColor Green
Write-Host ""
Write-Host "ATTENTION: Assurez-vous que PostgreSQL est démarré et que la base de données 'cityreport' existe." -ForegroundColor Yellow
Write-Host ""
Write-Host "Votre version actuelle de Java:" -ForegroundColor Cyan
java -version
Write-Host ""
Write-Host "Tentative de démarrage avec le profil PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot
mvn clean spring-boot:run -Dspring-boot.run.profiles=postgresql


