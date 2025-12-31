@echo off
chcp 65001 >nul
cd /d %~dp0
set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.9+10"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo ========================================
echo Démarrage du Backend Spring Boot
echo ========================================
echo.

echo Vérification de Java...
java -version
if errorlevel 1 (
    echo ERREUR: Java n'est pas trouvé ou ne fonctionne pas!
    pause
    exit /b 1
)
echo.

echo Vérification de Maven...
set "MAVEN_HOME=C:\Users\2003z\Downloads\apache-maven-3.9.11-bin\apache-maven-3.9.11"
set "PATH=%MAVEN_HOME%\bin;%PATH%"
mvn --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Maven n'est pas trouvé ou ne fonctionne pas!
    pause
    exit /b 1
)
echo OK - Maven fonctionne
echo.

echo ========================================
echo Lancement du serveur...
echo ========================================
echo.
echo Le serveur va démarrer sur http://localhost:8080
echo Appuyez sur Ctrl+C pour arrêter le serveur
echo.

call mvn clean spring-boot:run

if errorlevel 1 (
    echo.
    echo ERREUR lors du démarrage du serveur
    pause
)
