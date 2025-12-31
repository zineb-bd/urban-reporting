# Installation et Configuration PostgreSQL (Sans Docker)

## 📥 Étape 1 : Installer PostgreSQL

### Windows

1. **Télécharger PostgreSQL**
   - Allez sur : https://www.postgresql.org/download/windows/
   - Téléchargez le programme d'installation (installer)
   - Ou utilisez le gestionnaire de paquets : https://www.postgresql.org/download/windows/installer/

2. **Installer PostgreSQL**
   - Exécutez le fichier `.exe` téléchargé
   - Suivez l'assistant d'installation
   - **Important** : Notez le mot de passe que vous définissez pour l'utilisateur `postgres`
   - Par défaut, le port est `5432`

3. **Vérifier l'installation**
   - Ouvrez PowerShell et exécutez :
   ```powershell
   psql --version
   ```

### Alternative : Installation avec Chocolatey

```powershell
choco install postgresql
```

## 🗄️ Étape 2 : Créer la base de données

### Méthode 1 : Avec pgAdmin (Interface graphique)

1. Ouvrez **pgAdmin** (installé avec PostgreSQL)
2. Connectez-vous au serveur PostgreSQL (mot de passe défini à l'installation)
3. Clic droit sur "Databases" → "Create" → "Database"
4. Nom : `cityreport`
5. Cliquez sur "Save"

### Méthode 2 : Avec la ligne de commande (psql)

1. Ouvrez PowerShell
2. Exécutez :
```powershell
psql -U postgres
```

3. Entrez votre mot de passe PostgreSQL
4. Créez la base de données :
```sql
CREATE DATABASE cityreport;
```

5. Vérifiez :
```sql
\l
```

6. Quittez :
```sql
\q
```

### Méthode 3 : Script PowerShell automatique

Exécutez le script `create-database.ps1` dans le dossier `backend/scripts/`

## ⚙️ Étape 3 : Configurer le backend

### Modifier application.properties

Le fichier `backend/src/main/resources/application.properties` est déjà configuré pour PostgreSQL.

**Modifiez uniquement si nécessaire :**

```properties
# Si votre mot de passe PostgreSQL est différent de "postgres"
spring.datasource.password=votre_mot_de_passe

# Si votre utilisateur est différent
spring.datasource.username=votre_utilisateur

# Si le port est différent
spring.datasource.url=jdbc:postgresql://localhost:5432/cityreport
```

## 🚀 Étape 4 : Démarrer le backend

```bash
cd backend
mvn spring-boot:run
```

Les tables seront créées automatiquement au premier démarrage !

## ✅ Vérification

### Vérifier que PostgreSQL fonctionne

```powershell
# Vérifier le service
Get-Service postgresql*

# Ou vérifier la connexion
psql -U postgres -d cityreport -c "\dt"
```

### Vérifier les tables créées

```powershell
psql -U postgres -d cityreport
```

Puis dans psql :
```sql
\dt
```

Vous devriez voir les tables : `users` et `signalements`

## 🔧 Résolution de problèmes

### Erreur : "psql: command not found"

**Solution :** Ajoutez PostgreSQL au PATH :
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"
```

Ou ajoutez-le de manière permanente dans les variables d'environnement Windows.

### Erreur : "Connection refused" ou "Connection timeout"

**Solution :** Vérifiez que le service PostgreSQL est démarré :
```powershell
# Démarrer le service
Start-Service postgresql-x64-15

# Vérifier le statut
Get-Service postgresql-x64-15
```

### Erreur : "Password authentication failed"

**Solution :** 
1. Vérifiez le mot de passe dans `application.properties`
2. Ou réinitialisez le mot de passe :
```sql
ALTER USER postgres WITH PASSWORD 'nouveau_mot_de_passe';
```

### Erreur : "Database does not exist"

**Solution :** Créez la base de données :
```sql
CREATE DATABASE cityreport;
```

## 📝 Informations de connexion par défaut

- **Host:** localhost
- **Port:** 5432
- **Database:** cityreport
- **Username:** postgres
- **Password:** (celui défini à l'installation)

## 🔐 Sécurité

Pour la production, créez un utilisateur dédié :

```sql
CREATE USER cityreport_user WITH PASSWORD 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE cityreport TO cityreport_user;
```

Puis modifiez `application.properties` :
```properties
spring.datasource.username=cityreport_user
spring.datasource.password=mot_de_passe_securise
```


