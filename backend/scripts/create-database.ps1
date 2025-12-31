# Script PowerShell pour créer la base de données PostgreSQL
Write-Host "Creation de la base de donnees PostgreSQL..." -ForegroundColor Green
Write-Host ""

# Vérifier si psql est disponible
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "ERREUR: psql n'est pas trouve dans le PATH." -ForegroundColor Red
    Write-Host "Ajoutez PostgreSQL au PATH ou utilisez le chemin complet." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Exemple:" -ForegroundColor Cyan
    Write-Host '$env:Path += ";C:\Program Files\PostgreSQL\15\bin"' -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "Connexion a PostgreSQL..." -ForegroundColor Cyan
Write-Host "Vous serez demande de saisir le mot de passe de l'utilisateur 'postgres'" -ForegroundColor Yellow
Write-Host ""

# Demander le mot de passe
$password = Read-Host "Entrez le mot de passe PostgreSQL" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

# Variable d'environnement pour le mot de passe
$env:PGPASSWORD = $plainPassword

# Créer la base de données
Write-Host ""
Write-Host "Creation de la base de donnees 'cityreport'..." -ForegroundColor Cyan

$createDbCommand = "CREATE DATABASE cityreport;"
$result = echo $createDbCommand | psql -U postgres -h localhost

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Base de donnees 'cityreport' creee avec succes!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez maintenant demarrer le backend avec:" -ForegroundColor Cyan
    Write-Host "  cd backend" -ForegroundColor Yellow
    Write-Host "  mvn spring-boot:run" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "ERREUR lors de la creation de la base de donnees." -ForegroundColor Red
    Write-Host "La base de donnees existe peut-etre deja." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour verifier:" -ForegroundColor Cyan
    Write-Host "  psql -U postgres -c '\l'" -ForegroundColor Yellow
}

# Nettoyer la variable d'environnement
Remove-Item Env:\PGPASSWORD

Write-Host ""




