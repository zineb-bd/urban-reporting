# Script PowerShell pour télécharger et configurer Java 17
Write-Host "Installation de Java 17 pour Urban Reporting Backend" -ForegroundColor Green
Write-Host ""

# URL de téléchargement pour OpenJDK 17 (Adoptium/Temurin)
$java17Url = "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk"
$downloadPath = "$env:USERPROFILE\Downloads\OpenJDK17.zip"
$installPath = "C:\Program Files\Java\jdk-17"

Write-Host "Ce script va vous aider à installer Java 17." -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1 : Installation manuelle (RECOMMANDÉ)" -ForegroundColor Cyan
Write-Host "1. Téléchargez Java 17 depuis : https://adoptium.net/temurin/releases/?version=17"
Write-Host "2. Installez le fichier .msi téléchargé"
Write-Host "3. Notez le chemin d'installation (généralement C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot)"
Write-Host ""
Write-Host "Option 2 : Configuration de JAVA_HOME (après installation)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Après avoir installé Java 17, exécutez ces commandes dans PowerShell (en tant qu'administrateur) :"
Write-Host ""
$javaPath = Read-Host "Entrez le chemin d'installation de Java 17 (ex: C:\Program Files\Eclipse Adoptium\jdk-17.0.10+9-hotspot)"

if ($javaPath -and (Test-Path $javaPath)) {
    Write-Host "Configuration de JAVA_HOME..." -ForegroundColor Green
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, [System.EnvironmentVariableTarget]::User)
    $env:JAVA_HOME = $javaPath
    
    # Ajouter au PATH
    $currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)
    $javaBinPath = "$javaPath\bin"
    
    if ($currentPath -notlike "*$javaBinPath*") {
        [System.Environment]::SetEnvironmentVariable("Path", "$currentPath;$javaBinPath", [System.EnvironmentVariableTarget]::User)
        $env:Path = "$env:Path;$javaBinPath"
    }
    
    Write-Host "JAVA_HOME configuré : $javaPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Fermez et rouvrez PowerShell pour que les changements prennent effet." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Vérifiez avec : java -version" -ForegroundColor Cyan
} else {
    Write-Host "Chemin invalide ou installation non trouvée." -ForegroundColor Red
    Write-Host "Veuillez installer Java 17 manuellement depuis : https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Yellow
}

