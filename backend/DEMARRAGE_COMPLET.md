# Guide de démarrage complet avec PostgreSQL

## 🎯 Étapes rapides

### 1. Installer PostgreSQL (si pas déjà installé)

**Windows :**
- Téléchargez depuis : https://www.postgresql.org/download/windows/
- Installez avec l'assistant (notez le mot de passe de l'utilisateur `postgres`)

### 2. Créer la base de données

**Option A : Script automatique (Recommandé)**
```powershell
cd backend\scripts
.\create-database.ps1
```

**Option B : Manuellement avec psql**
```powershell
psql -U postgres
```
Puis :
```sql
CREATE DATABASE cityreport;
\q
```

**Option C : Avec pgAdmin**
- Ouvrez pgAdmin
- Clic droit sur "Databases" → "Create" → "Database"
- Nom : `cityreport`

### 3. Vérifier la configuration

Ouvrez `backend/src/main/resources/application.properties` et vérifiez :

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cityreport
spring.datasource.username=postgres
spring.datasource.password=postgres  # Changez si votre mot de passe est différent
```

### 4. Démarrer le backend

```powershell
cd backend
mvn spring-boot:run
```

### 5. Démarrer le frontend (dans un autre terminal)

```powershell
pnpm dev
```

## ✅ Vérification

- **Backend** : http://localhost:8080/api/signalements/public
- **Frontend** : http://localhost:3000

## 🔍 Vérifier les tables créées

```powershell
psql -U postgres -d cityreport -c "\dt"
```

Vous devriez voir :
- `users`
- `signalements`

## 📝 Notes importantes

1. **Mot de passe** : Si vous avez défini un mot de passe différent lors de l'installation de PostgreSQL, modifiez-le dans `application.properties`

2. **Service PostgreSQL** : Assurez-vous que le service PostgreSQL est démarré :
   ```powershell
   Get-Service postgresql*
   Start-Service postgresql-x64-15  # Si nécessaire
   ```

3. **Tables automatiques** : Les tables sont créées automatiquement au premier démarrage grâce à `spring.jpa.hibernate.ddl-auto=update`

## 🚨 Problèmes courants

### PostgreSQL n'est pas dans le PATH

Ajoutez-le temporairement :
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"
```

Ou ajoutez-le de manière permanente dans les variables d'environnement Windows.

### Le service PostgreSQL n'est pas démarré

```powershell
Start-Service postgresql-x64-15
```

### Port 5432 déjà utilisé

Vérifiez quel processus utilise le port :
```powershell
netstat -ano | findstr :5432
```

## 📚 Documentation complète

- `INSTALLATION_POSTGRESQL.md` - Guide d'installation détaillé
- `CONFIGURATION_POSTGRESQL.md` - Options de configuration avancées




