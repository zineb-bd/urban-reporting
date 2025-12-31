# Guide de démarrage du projet

## 📋 Prérequis

Avant de démarrer le projet, assurez-vous d'avoir installé :

1. **Java 17 ou Java 21** (requis)
   - Vérifiez votre version : `java -version`
   - Téléchargez depuis : https://adoptium.net/

2. **Maven** (gestionnaire de dépendances)
   - Vérifiez votre version : `mvn -version`
   - Téléchargez depuis : https://maven.apache.org/download.cgi

## 🚀 Méthodes de démarrage

### Méthode 1 : Script PowerShell (Recommandé pour Windows)

1. Ouvrez PowerShell dans le dossier `backend`
2. Exécutez :
```powershell
.\start-backend.ps1
```

### Méthode 2 : Script Batch (Windows)

1. Double-cliquez sur `start-backend.bat`
2. Ou exécutez dans l'invite de commande :
```cmd
start-backend.bat
```

### Méthode 3 : Commande Maven directe

1. Ouvrez un terminal dans le dossier `backend`
2. Exécutez :
```bash
mvn clean spring-boot:run
```

### Méthode 4 : Avec Maven Wrapper (si disponible)

```bash
./mvnw clean spring-boot:run
```

## ✅ Vérification du démarrage

Une fois le serveur démarré, vous devriez voir :
```
Started UrbanReportingApplication in X.XXX seconds
```

Le serveur sera accessible sur : **http://localhost:8080**

## 🧪 Tester l'API

### Test rapide dans le navigateur

Ouvrez : `http://localhost:8080/api/signalements/public`

Vous devriez voir une réponse JSON (peut être vide `[]` au début).

### Test avec PowerShell

```powershell
Invoke-WebRequest -Uri http://localhost:8080/api/signalements/public -Method GET
```

### Test avec curl

```bash
curl http://localhost:8080/api/signalements/public
```

## 🔧 Résolution de problèmes

### Erreur : "Java version not found"

**Solution :**
1. Installez Java 17 ou 21 depuis https://adoptium.net/
2. Configurez JAVA_HOME :
```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-21", [System.EnvironmentVariableTarget]::User)
```
3. Redémarrez votre terminal

### Erreur : "Maven not found"

**Solution :**
1. Installez Maven depuis https://maven.apache.org/download.cgi
2. Ajoutez Maven au PATH
3. Redémarrez votre terminal

### Erreur : "Port 8080 already in use"

**Solution :**
1. Modifiez le port dans `application.properties` :
```properties
server.port=8081
```
2. Redémarrez le serveur

### Erreur de compilation

**Solution :**
```bash
mvn clean install
mvn spring-boot:run
```

## 📝 Utilisateurs de test

Le projet crée automatiquement ces utilisateurs au démarrage :

- **Admin** : `admin@mail.com` / `admin123`
- **Technicien** : `technicien@mail.com` / `technicien123`
- **Citoyen** : `citoyen@mail.com` / `citoyen123`

## 🌐 Endpoints disponibles

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Signalements
- `GET /api/signalements/public` - Liste publique (sans auth)
- `GET /api/signalements` - Liste (avec auth)
- `GET /api/signalements/{id}` - Détails
- `POST /api/signalements` - Créer
- `PATCH /api/signalements/{id}/statut` - Mettre à jour le statut
- `DELETE /api/signalements/{id}` - Supprimer

## 💡 Astuces

- La console H2 est disponible sur : `http://localhost:8080/h2-console`
- Les logs sont visibles dans la console
- Pour arrêter le serveur : `Ctrl + C`




