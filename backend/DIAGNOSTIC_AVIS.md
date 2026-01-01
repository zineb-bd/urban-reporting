# Diagnostic : Pourquoi les avis ne s'affichent pas

## Étapes de diagnostic

### 1. Vérifier que les avis existent dans la base de données

Exécutez le script `backend/VERIFIER_AVIS.sql` dans votre base de données PostgreSQL pour vérifier :
- Si les utilisateurs existent
- Si les avis ont été créés
- Le nombre total d'avis

### 2. Vérifier que le backend est démarré

Assurez-vous que votre backend Spring Boot est démarré et accessible sur `http://localhost:8080`

### 3. Tester l'endpoint API directement

Ouvrez votre navigateur ou utilisez curl pour tester :
```
http://localhost:8080/api/avis/latest?limit=3
```

Vous devriez voir un JSON avec les avis.

### 4. Vérifier la console du navigateur

1. Ouvrez la page d'accueil dans votre navigateur
2. Ouvrez les outils de développement (F12)
3. Allez dans l'onglet "Console"
4. Vous devriez voir des messages commençant par 🔍, 📡, ✅ ou ❌

### 5. Vérifier que les utilisateurs existent avec les bons noms

Le script SQL recherche les utilisateurs avec :
- `prenom = 'basma'` ET `nom = 'boughedda'`
- `prenom = 'hiba'` ET `nom LIKE '%ouafi%'`
- `prenom = 'hamza'` ET `nom = 'motassim'`

**Important** : Les recherches sont en minuscules (LOWER), donc la casse n'a pas d'importance, mais vérifiez qu'il n'y a pas d'espaces supplémentaires.

### 6. Si les avis n'existent pas, exécutez le script SQL

Exécutez le fichier `backend/add_avis_direct.sql` dans votre base de données.

### 7. Vérifier la structure de la table avis

Assurez-vous que la table `avis` a bien les colonnes suivantes :
- `id` (BIGSERIAL/INTEGER PRIMARY KEY)
- `note` (INTEGER)
- `commentaire` (TEXT)
- `date_creation` (TIMESTAMP)
- `date_modification` (TIMESTAMP)
- `user_id` (BIGINT/INTEGER, FOREIGN KEY vers users.id)

### 8. Redémarrer le backend

Après avoir ajouté les avis dans la base de données, redémarrez le backend Spring Boot pour qu'il prenne en compte les nouveaux avis.

## Solutions communes

### Problème : Les avis ne sont pas dans la base de données
**Solution** : Exécutez le script `backend/add_avis_direct.sql`

### Problème : Le backend n'est pas démarré
**Solution** : Démarrez le backend avec `mvn spring-boot:run` dans le dossier `backend`

### Problème : Les noms d'utilisateurs ne correspondent pas exactement
**Solution** : Vérifiez les noms exacts dans la base de données avec :
```sql
SELECT id, prenom, nom, email FROM users WHERE role = 'CITOYEN';
```

### Problème : L'endpoint API retourne une erreur 404
**Solution** : Vérifiez que le backend est démarré et que l'endpoint `/api/avis/latest` est accessible

### Problème : Les avis existent mais ne s'affichent pas
**Solution** : 
1. Vérifiez la console du navigateur pour voir les erreurs
2. Vérifiez que la structure JSON retournée par l'API correspond à ce que le frontend attend
3. Redémarrez le frontend (Ctrl+C puis `npm run dev`)

