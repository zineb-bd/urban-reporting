@echo off
chcp 65001 >nul
echo ========================================
echo Correction du schéma de la base de données
echo ========================================
echo.
echo Ce script va mettre à jour les colonnes de la table signalements
echo pour supporter des adresses et titres plus longs.
echo.
echo Base de données: cityreport
echo Utilisateur: postgres
echo.
pause

echo.
echo Connexion à PostgreSQL...
echo Si demandé, entrez le mot de passe: postgres
echo.

psql -U postgres -d cityreport -c "ALTER TABLE signalements ALTER COLUMN adresse TYPE TEXT;"
psql -U postgres -d cityreport -c "ALTER TABLE signalements ALTER COLUMN photo_url TYPE TEXT;"
psql -U postgres -d cityreport -c "ALTER TABLE signalements ALTER COLUMN titre TYPE VARCHAR(500);"
psql -U postgres -d cityreport -c "ALTER TABLE signalements ALTER COLUMN categorie TYPE VARCHAR(100);"

echo.
echo ========================================
if %ERRORLEVEL% EQU 0 (
    echo ✅ Schéma mis à jour avec succès!
    echo Vous pouvez maintenant créer des signalements avec des adresses longues.
) else (
    echo ❌ Erreur lors de la mise à jour du schéma
    echo Vérifiez que PostgreSQL est démarré et que les identifiants sont corrects.
)
echo ========================================
echo.
pause


