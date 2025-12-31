# Guide de démarrage rapide

## ❌ Problème actuel

**Java 24 n'est pas compatible** avec Spring Boot. Vous devez utiliser **Java 17 ou Java 21**.

## ✅ Solution rapide (5 minutes)

### Étape 1 : Installer Java 17

1. Téléchargez Java 17 LTS depuis : **https://adoptium.net/temurin/releases/?version=17**
   - Sélectionnez : Windows / x64 / JDK / .msi

2. Installez le fichier `.msi` téléchargé (double-clic)

3. Notez le chemin d'installation (ex: `C:\Program Files\Eclipse Adoptium\jdk-17.0.10+9-hotspot`)

### Étape 2 : Configurer JAVA_HOME

Ouvrez PowerShell **en tant qu'administrateur** et exécutez :

```powershell
# Remplacez par votre chemin d'installation réel
$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.10+9-hotspot"
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, [System.EnvironmentVariableTarget]::User)

# Ajouter au PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)
$javaBinPath = "$javaPath\bin"
[System.Environment]::SetEnvironmentVariable("Path", "$currentPath;$javaBinPath", [System.EnvironmentVariableTarget]::User)
```

### Étape 3 : Redémarrer le terminal

**Fermez complètement PowerShell/VSCode** et rouvrez-le.

### Étape 4 : Vérifier Java

```powershell
java -version
```

Vous devriez voir quelque chose comme :
```
openjdk version "17.0.x" ...
```

### Étape 5 : Démarrer le backend

```bash
cd backend
mvn clean spring-boot:run
```

Le serveur devrait démarrer sur `http://localhost:8080` !

## 🔍 Vérification

Testez dans votre navigateur : `http://localhost:8080/api/signalements/public`

Vous devriez voir une réponse JSON (même si vide au début).

## ⚡ Alternative : Java 21

Si vous préférez Java 21 (plus récent), suivez les mêmes étapes mais téléchargez Java 21 depuis :
**https://adoptium.net/temurin/releases/?version=21**

---

**Note :** Si vous avez plusieurs versions de Java installées, vous pouvez utiliser un gestionnaire comme `choco` ou `scoop` pour basculer entre les versions.

