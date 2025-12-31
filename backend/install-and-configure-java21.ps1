# Script pour installer et configurer Java 21
Write-Host "Configuration de Java 21 pour Urban Reporting Backend" -ForegroundColor Green
Write-Host ""

$installerPath = "C:\Users\2003z\Downloads\jdk-21.0.8_windows-x64_bin.exe"

if (Test-Path $installerPath) {
    Write-Host "✅ Installateur trouvé : $installerPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Vous devez installer Java 21 manuellement :" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Double-cliquez sur le fichier :" -ForegroundColor Cyan
    Write-Host "   $installerPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Suivez les instructions d'installation" -ForegroundColor Cyan
    Write-Host "   (Notez le chemin d'installation, généralement :" -ForegroundColor Gray
    Write-Host "    C:\Program Files\Eclipse Adoptium\jdk-21.x.x-hotspot)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Après l'installation, relancez ce script pour configurer JAVA_HOME" -ForegroundColor Cyan
    Write-Host ""
    
    $installNow = Read-Host "Voulez-vous ouvrir l'installateur maintenant ? (O/N)"
    if ($installNow -eq "O" -or $installNow -eq "o") {
        Start-Process -FilePath $installerPath -Wait
        Write-Host ""
        Write-Host "⏳ Attente de 5 secondes pour que l'installation se termine..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host ""
        Write-Host "Après l'installation manuelle, relancez ce script avec :" -ForegroundColor Yellow
        Write-Host "  .\install-and-configure-java21.ps1" -ForegroundColor Gray
        exit 0
    }
} else {
    Write-Host "❌ Installateur non trouvé : $installerPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Téléchargez Java 21 depuis :" -ForegroundColor Yellow
    Write-Host "  https://adoptium.net/temurin/releases/?version=21" -ForegroundColor Gray
    exit 1
}

# Rechercher Java 21 après l'installation
Write-Host ""
Write-Host "Recherche de Java 21 installé..." -ForegroundColor Green

$java21Paths = @(
    "C:\Program Files\Eclipse Adoptium",
    "C:\Program Files\Java",
    "$env:LOCALAPPDATA\Programs\Eclipse Adoptium"
)

$foundJava21 = $null

foreach ($basePath in $java21Paths) {
    if (Test-Path $basePath) {
        Get-ChildItem $basePath -Recurse -Directory -Filter "*21*" -ErrorAction SilentlyContinue | ForEach-Object {
            $javaExe = Join-Path $_.FullName "bin\java.exe"
            if (Test-Path $javaExe) {
                try {
                    $version = & $javaExe -version 2>&1 | Select-Object -First 1
                    if ($version -match "21") {
                        $foundJava21 = $_.FullName
                        Write-Host "✅ Java 21 trouvé : $foundJava21" -ForegroundColor Green
                        Write-Host "   Version : $version" -ForegroundColor Gray
                    }
                } catch {
                    # Ignorer les erreurs
                }
            }
        }
        if ($foundJava21) { break }
    }
}

if (-not $foundJava21) {
    Write-Host ""
    Write-Host "❌ Java 21 non trouvé automatiquement." -ForegroundColor Red
    Write-Host ""
    $manualPath = Read-Host "Entrez manuellement le chemin d'installation de Java 21"
    if ($manualPath -and (Test-Path $manualPath)) {
        $javaExe = Join-Path $manualPath "bin\java.exe"
        if (Test-Path $javaExe) {
            $version = & $javaExe -version 2>&1 | Select-Object -First 1
            if ($version -match "21") {
                $foundJava21 = $manualPath
            } else {
                Write-Host "❌ Ce n'est pas Java 21" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "❌ Chemin invalide (java.exe non trouvé)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Chemin invalide" -ForegroundColor Red
        exit 1
    }
}

# Configurer JAVA_HOME
Write-Host ""
Write-Host "Configuration de JAVA_HOME..." -ForegroundColor Green

$env:JAVA_HOME = $foundJava21
$env:Path = "$foundJava21\bin;$env:Path"

# Configurer de manière permanente
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $foundJava21, [System.EnvironmentVariableTarget]::User)

# Mettre à jour le PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)
$javaBinPath = "$foundJava21\bin"

# Nettoyer le PATH des anciennes entrées Java
$pathArray = $currentPath -split ';' | Where-Object { 
    $_.Trim() -ne '' -and 
    $_ -notmatch '\\java\\' -and 
    $_ -notmatch '\\jdk\\' -and
    $_ -notmatch 'Common Files\\Oracle\\Java'
}

# Ajouter le nouveau chemin Java au début
$newPath = ($javaBinPath, $pathArray) -join ';'
[System.Environment]::SetEnvironmentVariable("Path", $newPath, [System.EnvironmentVariableTarget]::User)

Write-Host ""
Write-Host "Vérification de la version Java :" -ForegroundColor Cyan
& "$foundJava21\bin\java.exe" -version

Write-Host ""
Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT : Fermez et rouvrez votre terminal pour que les changements prennent effet." -ForegroundColor Yellow
Write-Host ""
Write-Host "JAVA_HOME configuré : $foundJava21" -ForegroundColor Green
Write-Host ""
Write-Host "Ensuite, démarrez le serveur avec :" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  mvn clean spring-boot:run" -ForegroundColor White


