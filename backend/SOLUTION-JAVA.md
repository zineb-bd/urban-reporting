# Solution au problème ERR_CONNECTION_REFUSED

## Problème identifié

Le backend Spring Boot ne peut pas démarrer car **Java 24 n'est pas compatible** avec le compilateur Maven utilisé par Spring Boot.

L'erreur : `java.lang.ExceptionInInitializerError: com.sun.tools.javac.code.TypeTag :: UNKNOWN`

## Solution OBLIGATOIRE : Installer Java 17 ou 21

### Option 1 : Installer Java 17 (LTS - Recommandé)

1. **Télécharger Java 17** :
   - Oracle JDK : https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
   - OpenJDK (Eclipse Temurin) : https://adoptium.net/temurin/releases/?version=17
   - **Recommandé** : Eclipse Temurin 17 (gratuit et open source)

2. **Installer Java 17**

3. **Configurer JAVA_HOME** :
   
   **Windows PowerShell (en tant qu'administrateur)** :
   ```powershell
   # Trouver le chemin d'installation (généralement)
   # C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
   
   # Définir JAVA_HOME
   [System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.12-hotspot", [System.EnvironmentVariableTarget]::Machine)
   
   # Ajouter au PATH
   $currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::Machine)
   $newPath = "$env:JAVA_HOME\bin;$currentPath"
   [System.Environment]::SetEnvironmentVariable("Path", $newPath, [System.EnvironmentVariableTarget]::Machine)
   ```

   **Ou manuellement** :
   - Clic droit sur "Ce PC" → Propriétés
   - Paramètres système avancés → Variables d'environnement
   - Créer/modifier `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`
   - Ajouter `%JAVA_HOME%\bin` au PATH

4. **Vérifier l'installation** :
   ```powershell
   # Fermer et rouvrir PowerShell
   java -version
   # Devrait afficher : java version "17.0.x"
   ```

5. **Démarrer le backend** :
   ```bash
   cd backend
   mvn clean spring-boot:run
   ```

### Option 2 : Installer Java 21 (LTS - Plus récent)

Même processus que Java 17, mais télécharger Java 21 :
- https://adoptium.net/temurin/releases/?version=21

### Option 3 : Utiliser plusieurs versions Java

Si vous devez garder Java 24 pour d'autres projets :

1. **Installer SDKMAN** (Windows avec WSL) ou **jEnv**
2. **Ou utiliser des chemins complets** :
   ```powershell
   # Utiliser Java 17 spécifiquement pour ce projet
   & "C:\Program Files\Eclipse Adoptium\jdk-17.0.12-hotspot\bin\java.exe" -version
   ```

## Vérification après installation

1. **Vérifier Java** :
   ```powershell
   java -version
   javac -version
   ```

2. **Vérifier Maven utilise la bonne version** :
   ```powershell
   mvn -version
   # Devrait afficher Java version: 17.x ou 21.x
   ```

3. **Compiler le projet** :
   ```bash
   cd backend
   mvn clean compile
   ```

4. **Démarrer le serveur** :
   ```bash
   mvn spring-boot:run
   ```

5. **Tester** :
   - Ouvrir : http://localhost:8080/api/signalements/public
   - Devrait retourner une liste vide `[]` (pas d'erreur)

## Pourquoi Java 24 ne fonctionne pas ?

- Spring Boot 3.x nécessite Java 17, 18, 19, 20 ou 21
- Java 24 est trop récent et le compilateur Maven n'est pas encore compatible
- Les outils de build (Maven Compiler Plugin) ne supportent pas encore Java 24

## Alternative : Utiliser Docker (Avancé)

Si vous ne pouvez pas installer Java 17/21, vous pouvez utiliser Docker :

```dockerfile
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY . .
RUN ./mvnw clean install
CMD ["./mvnw", "spring-boot:run"]
```

Mais cela nécessite Docker installé.

## Support

Si le problème persiste après avoir installé Java 17 ou 21 :
1. Vérifiez que JAVA_HOME pointe vers la bonne version
2. Redémarrez votre terminal/PowerShell
3. Vérifiez avec `mvn -version` que Maven utilise la bonne version Java

