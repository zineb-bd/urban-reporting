# Correction du schéma de la base de données

## Problème

L'erreur `valeur trop longue pour le type character varying(255)` se produit car les colonnes `adresse` et `photo_url` sont limitées à 255 caractères, mais les adresses complètes peuvent être plus longues.

## Solution

Vous devez exécuter le script SQL suivant dans PostgreSQL pour mettre à jour le schéma de la table `signalements`.

### Méthode 1 : Via psql (ligne de commande)

```powershell
# Connectez-vous à PostgreSQL
psql -U postgres -d cityreport

# Ensuite, exécutez ces commandes :
ALTER TABLE signalements ALTER COLUMN adresse TYPE TEXT;
ALTER TABLE signalements ALTER COLUMN photo_url TYPE TEXT;
ALTER TABLE signalements ALTER COLUMN titre TYPE VARCHAR(500);
ALTER TABLE signalements ALTER COLUMN categorie TYPE VARCHAR(100);

# Pour quitter psql
\q
```

### Méthode 2 : Via pgAdmin ou autre outil graphique

1. Ouvrez pgAdmin ou votre outil de gestion PostgreSQL
2. Connectez-vous au serveur PostgreSQL
3. Sélectionnez la base de données `cityreport`
4. Ouvrez l'éditeur SQL
5. Copiez-collez et exécutez ces commandes :

```sql
ALTER TABLE signalements ALTER COLUMN adresse TYPE TEXT;
ALTER TABLE signalements ALTER COLUMN photo_url TYPE TEXT;
ALTER TABLE signalements ALTER COLUMN titre TYPE VARCHAR(500);
ALTER TABLE signalements ALTER COLUMN categorie TYPE VARCHAR(100);
```

### Méthode 3 : Via un script batch (Windows)

Créez un fichier `fix-schema.bat` dans le dossier backend/scripts :

```batch
@echo off
echo Correction du schéma de la base de données...
echo.
psql -U postgres -d cityreport -f update-signalements-schema.sql
pause
```

Puis exécutez-le.

## Après l'exécution du script

Une fois le script exécuté, **vous n'avez PAS besoin de redémarrer le backend**. Les changements seront pris en compte immédiatement.

Essayez maintenant de créer un signalement - cela devrait fonctionner !


