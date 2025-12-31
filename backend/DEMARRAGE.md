# Guide de démarrage du backend

## Problème de compatibilité Java

Le projet Spring Boot nécessite **Java 17 ou 21**. Si vous avez Java 24 installé, cela peut causer des problèmes de compilation.

## Solutions

### Option 1 : Installer Java 17 (Recommandé)

1. Téléchargez Java 17 depuis : https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
   - Ou utilisez OpenJDK : https://adoptium.net/temurin/releases/?version=17

2. Installez Java 17

3. Configurez JAVA_HOME :
   ```powershell
   # Dans PowerShell (en tant qu'administrateur)
   [System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17", [System.EnvironmentVariableTarget]::Machine)
   ```

4. Vérifiez la version :
   ```powershell
   java -version
   ```

### Option 2 : Utiliser Java 21

1. Téléchargez Java 21 depuis : https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html
   - Ou utilisez OpenJDK : https://adoptium.net/temurin/releases/?version=21

2. Suivez les mêmes étapes que pour Java 17

### Option 3 : Utiliser plusieurs versions Java (Avancé)

Si vous devez garder Java 24, vous pouvez utiliser un gestionnaire de versions Java comme SDKMAN ou jenv pour basculer entre les versions.

## Démarrer le serveur

Une fois Java 17 ou 21 installé :

```bash
cd backend
mvn clean spring-boot:run
```

Le serveur devrait démarrer sur `http://localhost:8080`

## Vérification

Testez si le serveur fonctionne :

```powershell
# Dans PowerShell
Invoke-WebRequest -Uri http://localhost:8080/api/signalements/public -Method GET
```

Ou ouvrez dans votre navigateur : `http://localhost:8080/api/signalements/public`

## Port déjà utilisé ?

Si le port 8080 est déjà utilisé, modifiez `src/main/resources/application.properties` :

```properties
server.port=8081
```

Puis redémarrez le serveur.

