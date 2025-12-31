# Script pour trouver et configurer Java 21
Write-Host "Recherche de Java 21..." -ForegroundColor Green
Write-Host ""

$java21Paths = @()

# Chercher dans les emplacements standards
$searchPaths = @(
    "C:\Program Files\Eclipse Adoptium",
    "C:\Program Files\Java",
    "C:\Program Files (x86)\Java",
    "$env:LOCALAPPDATA\Programs\Eclipse Adoptium",
    "$env:USERPROFILE\.jdks",
    "C:\jdks",
    "C:\tools\jdk",
    "$env:USERPROFILE\AppData\Local\Programs\Eclipse Adoptium"
)

foreach ($basePath in $searchPaths) {
    if (Test-Path $basePath) {
        Get-ChildItem $basePath -Recurse -Directory -Filter "*21*" -ErrorAction SilentlyContinue | ForEach-Object {
            $javaExe = Join-Path $_.FullName "bin\java.exe"
            if (Test-Path $javaExe) {
                $version = & $javaExe -version 2>&1 | Select-Object -First 1
                if ($version -match "21") {
                    $java21Paths += $_.FullName
                    Write-Host "Java 21 trouvé : $($_.FullName)" -ForegroundColor Green
                    Write-Host "  Version : $version" -ForegroundColor Gray
                }
            }
        }
    }
}

# Si pas trouvé, chercher via la variable d'environnement système
$envJavaHome = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", [System.EnvironmentVariableTarget]::Machine)
if ($envJavaHome -and (Test-Path $envJavaHome)) {
    $javaExe = Join-Path $envJavaHome "bin\java.exe"
    if (Test-Path $javaExe) {
        $version = & $javaExe -version 2>&1 | Select-Object -First 1
        if ($version -match "21") {
            if ($java21Paths -notcontains $envJavaHome) {
                $java21Paths += $envJavaHome
                Write-Host "Java 21 trouvé via JAVA_HOME système : $envJavaHome" -ForegroundColor Green
            }
        }
    }
}

$envJavaHomeUser = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", [System.EnvironmentVariableTarget]::User)
if ($envJavaHomeUser -and (Test-Path $envJavaHomeUser)) {
    $javaExe = Join-Path $envJavaHomeUser "bin\java.exe"
    if (Test-Path $javaExe) {
        $version = & $javaExe -version 2>&1 | Select-Object -First 1
        if ($version -match "21") {
            if ($java21Paths -notcontains $envJavaHomeUser) {
                $java21Paths += $envJavaHomeUser
                Write-Host "Java 21 trouvé via JAVA_HOME utilisateur : $envJavaHomeUser" -ForegroundColor Green
            }
        }
    }
}

if ($java21Paths.Count -eq 0) {
    Write-Host ""
    Write-Host "❌ Java 21 non trouvé !" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vous devez installer Java 21. Options :" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1 : Exécuter l'installateur que vous avez :" -ForegroundColor Cyan
    Write-Host "  C:\Users\2003z\Downloads\jdk-21.0.8_windows-x64_bin.exe" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2 : Installation silencieuse via Chocolatey :" -ForegroundColor Cyan
    Write-Host "  choco install temurin21jdk -y" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Après l'installation, relancez ce script." -ForegroundColor Yellow
    exit 1
}

# Prendre le premier Java 21 trouvé (généralement le plus récent)
$java21Path = $java21Paths[0]

Write-Host ""
Write-Host "✅ Configuration de JAVA_HOME vers : $java21Path" -ForegroundColor Green

# Configurer JAVA_HOME pour la session actuelle
$env:JAVA_HOME = $java21Path
$env:Path = "$java21Path\bin;$env:Path"

# Configurer JAVA_HOME de manière permanente (utilisateur)
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $java21Path, [System.EnvironmentVariableTarget]::User)

# Mettre à jour le PATH utilisateur
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)
$javaBinPath = "$java21Path\bin"

# Retirer les anciennes entrées Java du PATH
$pathArray = $currentPath -split ';' | Where-Object { $_ -notmatch 'java|jdk' }
$pathArray = $pathArray | Where-Object { $_.Trim() -ne '' }

# Ajouter le nouveau chemin Java au début
$newPath = ($javaBinPath, $pathArray) -join ';'
[System.Environment]::SetEnvironmentVariable("Path", $newPath, [System.EnvironmentVariableTarget]::User)

Write-Host ""
Write-Host "Vérification de la version Java :" -ForegroundColor Cyan
& "$java21Path\bin\java.exe" -version

Write-Host ""
Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host "⚠️  IMPORTANT : Fermez et rouvrez votre terminal pour que les changements prennent effet." -ForegroundColor Yellow
Write-Host ""
Write-Host "JAVA_HOME configuré : $java21Path" -ForegroundColor Green


