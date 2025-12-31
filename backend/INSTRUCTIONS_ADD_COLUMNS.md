# Instructions pour ajouter les colonnes manquantes

## Problème
Les colonnes `commentaires_techniques` et `temps_passe_minutes` n'existent pas dans la table `signalements` de votre base de données PostgreSQL.

## Solution

### Option 1 : Exécuter le script SQL manuellement (Recommandé)

1. Connectez-vous à votre base de données PostgreSQL :
   ```bash
   psql -U postgres -d cityreport
   ```

2. Ou utilisez pgAdmin ou un autre outil de gestion PostgreSQL

3. Exécutez le script SQL suivant :
   ```sql
   -- Ajouter la colonne commentaires_techniques
   ALTER TABLE signalements 
   ADD COLUMN IF NOT EXISTS commentaires_techniques TEXT;

   -- Ajouter la colonne temps_passe_minutes
   ALTER TABLE signalements 
   ADD COLUMN IF NOT EXISTS temps_passe_minutes INTEGER;
   ```

4. Vérifiez que les colonnes ont été ajoutées :
   ```sql
   \d signalements
   ```

### Option 2 : Redémarrer le backend (si Hibernate ne les ajoute pas automatiquement)

Parfois, même avec `ddl-auto=update`, Hibernate ne crée pas les colonnes si la table existe déjà. Dans ce cas :

1. Arrêtez le backend
2. Exécutez le script SQL ci-dessus (Option 1)
3. Redémarrez le backend

### Option 3 : Utiliser le script SQL fourni

Le fichier `add_resolution_fields_simple.sql` contient les commandes SQL nécessaires. Vous pouvez l'exécuter avec :

```bash
psql -U postgres -d cityreport -f add_resolution_fields_simple.sql
```

## Vérification

Après avoir ajouté les colonnes, testez en :
1. Changeant le statut d'un signalement à "RESOLU" via l'interface
2. Remplissant les commentaires techniques et le temps passé
3. Vérifiant que les données sont bien sauvegardées dans la base de données

