@echo off
echo Creation de la base de donnees PostgreSQL...
echo.
echo Vous serez demande de saisir le mot de passe de l'utilisateur 'postgres'
echo.

REM Vérifier si psql existe
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: psql n'est pas trouve dans le PATH.
    echo Ajoutez PostgreSQL au PATH dans les variables d'environnement Windows.
    echo.
    echo Chemin typique: C:\Program Files\PostgreSQL\15\bin
    echo.
    pause
    exit /b 1
)

echo Connexion a PostgreSQL...
echo.

REM Demander le mot de passe
set /p PGPASSWORD="Entrez le mot de passe PostgreSQL: "

REM Créer la base de données
echo.
echo Creation de la base de donnees 'cityreport'...
echo CREATE DATABASE cityreport; | psql -U postgres -h localhost

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Base de donnees 'cityreport' creee avec succes!
    echo.
    echo Vous pouvez maintenant demarrer le backend avec:
    echo   cd backend
    echo   mvn spring-boot:run
) else (
    echo.
    echo ERREUR lors de la creation de la base de donnees.
    echo La base de donnees existe peut-etre deja.
    echo.
    echo Pour verifier:
    echo   psql -U postgres -c "\l"
)

echo.
pause


