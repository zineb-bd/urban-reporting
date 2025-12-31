# Trouver ou réinitialiser le mot de passe PostgreSQL

## 🔍 Le mot de passe PostgreSQL

Le mot de passe PostgreSQL est celui que **vous avez défini lors de l'installation** de PostgreSQL.

## 📝 Si vous ne vous souvenez pas du mot de passe

### Option 1 : Réinitialiser le mot de passe (Windows)

1. **Arrêter le service PostgreSQL**
   ```powershell
   Stop-Service postgresql-x64-15
   ```
   (Remplacez `postgresql-x64-15` par votre version si différente)

2. **Créer un fichier de mot de passe temporaire**
   - Créez un fichier `C:\temp\pgpass.txt` avec le contenu :
   ```
   postgres
   ```

3. **Démarrer PostgreSQL en mode single-user**
   ```powershell
   cd "C:\Program Files\PostgreSQL\15\bin"
   .\postgres.exe --single -D "C:\Program Files\PostgreSQL\15\data" postgres
   ```

4. **Dans la console PostgreSQL, exécutez :**
   ```sql
   ALTER USER postgres WITH PASSWORD 'nouveau_mot_de_passe';
   ```
   Puis tapez `\q` pour quitter

5. **Redémarrer le service**
   ```powershell
   Start-Service postgresql-x64-15
   ```

### Option 2 : Utiliser pgAdmin (Plus simple)

1. **Ouvrez pgAdmin**
2. **Si vous êtes déjà connecté**, vous pouvez voir/modifier le mot de passe dans les paramètres
3. **Si vous n'êtes pas connecté**, essayez les mots de passe courants :
   - `postgres`
   - `admin`
   - `password`
   - (vide)

### Option 3 : Vérifier dans le fichier pg_hba.conf

Le fichier `pg_hba.conf` peut être configuré pour accepter les connexions sans mot de passe (mode trust).

Localisation : `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`

## 🔧 Solution rapide : Configurer l'authentification sans mot de passe (Développement uniquement)

⚠️ **ATTENTION : À utiliser uniquement en développement, pas en production !**

1. **Trouvez le fichier `pg_hba.conf`**
   - Chemin typique : `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`

2. **Ouvrez-le avec un éditeur de texte (en tant qu'administrateur)**

3. **Trouvez la ligne :**
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   ```

4. **Remplacez par :**
   ```
   host    all             all             127.0.0.1/32            trust
   ```

5. **Redémarrez le service PostgreSQL**
   ```powershell
   Restart-Service postgresql-x64-15
   ```

6. **Modifiez `application.properties`** pour utiliser un mot de passe vide :
   ```properties
   spring.datasource.password=
   ```

## ✅ Vérifier le mot de passe

Essayez de vous connecter :

```powershell
psql -U postgres
```

Si ça fonctionne, le mot de passe est correct (ou l'authentification est en mode trust).

## 💡 Astuce : Mots de passe courants

Si vous avez installé PostgreSQL récemment, essayez :
- `postgres` (le plus courant)
- `admin`
- `password`
- `root`
- (vide - si vous avez coché "pas de mot de passe" lors de l'installation)

## 🔐 Pour la production

Une fois que vous avez trouvé/réinitialisé le mot de passe, mettez-le à jour dans `application.properties` :

```properties
spring.datasource.password=votre_mot_de_passe
```




