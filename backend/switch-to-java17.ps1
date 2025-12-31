# Script pour configurer Java 17 ou 21 comme version par défaut
Write-Host "Configuration de Java 17/21 pour Urban Reporting Backend" -ForegroundColor Green
Write-Host ""

# Chercher Java 17 ou 21 dans les emplacements communs
$possiblePaths = @(
    "C:\Program Files\Eclipse Adoptium\jdk-17*",
    "C:\Program Files\Java\jdk-17*",
    "C:\Program Files\Eclipse Adoptium\jdk-21*",
    "C:\Program Files\Java\jdk-21*"
)

$foundJava = $null

foreach ($path in $possiblePaths) {
    $dirs = Get-ChildItem $path -ErrorAction SilentlyContinue | Sort-Object Name -Descending
    if ($dirs) {
        $foundJava = $dirs[0].FullName
        Write-Host "Java trouvé : $foundJava" -ForegroundColor Green
        break
    }
}

if (-not $foundJava) {
    Write-Host "Java 17 ou 21 non trouvé automatiquement." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options d'installation :" -ForegroundColor Cyan
    Write-Host "1. Via Chocolatey (si disponible) :" -ForegroundColor White
    Write-Host "   choco install temurin17jdk -y" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Installation manuelle :" -ForegroundColor White
    Write-Host "   Téléchargez depuis : https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Gray
    Write-Host ""
    
    $manualPath = Read-Host "Ou entrez manuellement le chemin vers Java 17/21 (laissez vide pour quitter)"
    if ($manualPath -and (Test-Path $manualPath)) {
        $foundJava = $manualPath
    } else {
        Write-Host "Aucun chemin fourni. Sortie." -ForegroundColor Red
        exit 1
    }
}

if ($foundJava -and (Test-Path $foundJava)) {
    Write-Host ""
    Write-Host "Configuration de JAVA_HOME vers : $foundJava" -ForegroundColor Green
    
    # Configurer JAVA_HOME pour la session actuelle
    $env:JAVA_HOME = $foundJava
    $env:Path = "$foundJava\bin;$env:Path"
    
    # Configurer JAVA_HOME de manière permanente (utilisateur)
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $foundJava, [System.EnvironmentVariableTarget]::User)
    
    # Mettre à jour le PATH
    $currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)
    $javaBinPath = "$foundJava\bin"
    
    if ($currentPath -notlike "*$javaBinPath*") {
        $newPath = if ($currentPath) { "$currentPath;$javaBinPath" } else { $javaBinPath }
        [System.Environment]::SetEnvironmentVariable("Path", $newPath, [System.EnvironmentVariableTarget]::User)
        Write-Host "PATH mis à jour avec : $javaBinPath" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Vérification de la version Java :" -ForegroundColor Cyan
    & "$foundJava\bin\java.exe" -version
    
    Write-Host ""
    Write-Host "✅ Configuration terminée !" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT : Fermez et rouvrez votre terminal pour que les changements prennent effet." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ensuite, vous pourrez démarrer le serveur avec :" -ForegroundColor Cyan
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  mvn clean spring-boot:run" -ForegroundColor White
} else {
    Write-Host "Chemin Java invalide : $foundJava" -ForegroundColor Red
    exit 1
}


