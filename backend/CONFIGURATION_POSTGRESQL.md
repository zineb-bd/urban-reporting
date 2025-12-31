# Configuration PostgreSQL pour le Backend

## 📋 Prérequis

1. **PostgreSQL installé** sur votre machine
   - Téléchargez depuis : https://www.postgresql.org/download/
   - Ou utilisez Docker : `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

2. **Base de données créée**
   - Créez une base de données nommée `cityreport`

## 🔧 Méthode 1 : Utiliser le profil Spring (Recommandé)

### Étape 1 : Créer la base de données PostgreSQL

```sql
-- Connectez-vous à PostgreSQL
psql -U postgres

-- Créez la base de données
CREATE DATABASE cityreport;

-- Créez un utilisateur (optionnel)
CREATE USER cityreport_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE cityreport TO cityreport_user;
```

### Étape 2 : Modifier la configuration

Éditez `src/main/resources/application-postgresql.properties` et modifiez :

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cityreport
spring.datasource.username=postgres
spring.datasource.password=votre_mot_de_passe
```

### Étape 3 : Démarrer avec le profil PostgreSQL

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=postgresql
```

## 🔧 Méthode 2 : Modifier directement application.properties

### Étape 1 : Créer la base de données

```sql
CREATE DATABASE cityreport;
```

### Étape 2 : Modifier application.properties

Décommentez et modifiez les lignes PostgreSQL dans `application.properties` :

```properties
# Configuration PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/cityreport
spring.datasource.username=postgres
spring.datasource.password=votre_mot_de_passe
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

Commentez les lignes H2 :

```properties
# spring.datasource.url=jdbc:h2:mem:cityreportdb
# spring.datasource.driverClassName=org.h2.Driver
# ...
```

### Étape 3 : Démarrer normalement

```bash
cd backend
mvn spring-boot:run
```

## 🐳 Méthode 3 : Utiliser Docker (Plus simple)

### Étape 1 : Lancer PostgreSQL avec Docker

```bash
docker run --name postgres-cityreport \
  -e POSTGRES_DB=cityreport \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

### Étape 2 : Utiliser la configuration

Modifiez `application-postgresql.properties` :

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cityreport
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### Étape 3 : Démarrer

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=postgresql
```

## ✅ Vérification

Une fois le serveur démarré, les tables seront créées automatiquement grâce à :

```properties
spring.jpa.hibernate.ddl-auto=update
```

Vous pouvez vérifier avec :

```bash
psql -U postgres -d cityreport -c "\dt"
```

## 🔍 Connexion avec pgAdmin ou DBeaver

- **Host:** localhost
- **Port:** 5432
- **Database:** cityreport
- **Username:** postgres
- **Password:** (celui que vous avez configuré)

## 📝 Notes importantes

1. **H2 vs PostgreSQL** : H2 est en mémoire (données perdues au redémarrage), PostgreSQL persiste les données
2. **Migration** : Les tables sont créées automatiquement au premier démarrage
3. **Sécurité** : Changez les mots de passe par défaut en production
4. **Port** : Assurez-vous que le port 5432 n'est pas utilisé par une autre instance PostgreSQL

## 🚨 Résolution de problèmes

### Erreur : "Connection refused"

**Solution :** Vérifiez que PostgreSQL est démarré :
```bash
# Windows
net start postgresql-x64-15

# Linux/Mac
sudo systemctl start postgresql
```

### Erreur : "Database does not exist"

**Solution :** Créez la base de données :
```sql
CREATE DATABASE cityreport;
```

### Erreur : "Password authentication failed"

**Solution :** Vérifiez le mot de passe dans `application-postgresql.properties`




