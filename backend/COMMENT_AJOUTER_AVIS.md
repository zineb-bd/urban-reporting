# Comment ajouter les 3 avis dans la base de données

## Méthode 1 : Via psql (ligne de commande PostgreSQL)

1. **Ouvrez un terminal/invite de commande**

2. **Connectez-vous à votre base de données PostgreSQL :**
   ```bash
   psql -U votre_username -d cityreport
   ```
   (Remplacez `votre_username` par votre nom d'utilisateur PostgreSQL et `cityreport` par le nom de votre base de données)

3. **Exécutez le script SQL :**
   ```bash
   \i backend/add_avis_simple.sql
   ```
   Ou copiez-collez directement le contenu du fichier `backend/add_avis_simple.sql`

4. **Vérifiez que les avis ont été ajoutés :**
   ```sql
   SELECT a.id, a.note, LEFT(a.commentaire, 50) as commentaire_preview, u.prenom, u.nom 
   FROM avis a
   JOIN users u ON a.user_id = u.id
   ORDER BY a.date_creation DESC
   LIMIT 3;
   ```

## Méthode 2 : Via pgAdmin ou un client SQL graphique

1. **Ouvrez pgAdmin** (ou tout autre client SQL comme DBeaver, DataGrip, etc.)

2. **Connectez-vous à votre base de données `cityreport`**

3. **Ouvrez l'éditeur de requête SQL**

4. **Ouvrez le fichier `backend/add_avis_simple.sql`** ou copiez-collez son contenu

5. **Exécutez le script** (F5 dans pgAdmin, ou le bouton "Execute")

6. **Vérifiez les résultats** avec la requête de vérification ci-dessus

## Méthode 3 : Via l'interface de l'application (si les utilisateurs existent)

Si les comptes utilisateurs existent déjà :

1. **Connectez-vous avec le compte "Basma Boughédda"**
   - Allez sur `/avis`
   - Remplissez le formulaire avec :
     - Note : 5 étoiles
     - Commentaire : "Excellente plateforme ! J'ai signalé plusieurs problèmes dans mon quartier et ils ont tous été résolus rapidement. L'interface est intuitive et le suivi est parfait."
   - Cliquez sur "Envoyer mon avis"

2. **Répétez pour "Hiba El Ouafi"** avec :
   - Note : 5 étoiles
   - Commentaire : "Service vraiment efficace ! La municipalité répond rapidement à nos signalements. Je recommande cette plateforme à tous les citoyens soucieux de l'amélioration de leur ville."

3. **Répétez pour "Hamza Motassim"** avec :
   - Note : 4 étoiles
   - Commentaire : "Très bonne expérience globale. Le système de suivi est excellent et permet de voir l'avancement des signalements en temps réel. Quelques améliorations mineures seraient les bienvenues, mais c'est déjà très bien !"

## Vérification finale

Après avoir ajouté les avis, vous pouvez vérifier qu'ils apparaissent sur la page d'accueil :

1. **Allez sur la page d'accueil** (`/`)
2. **Faites défiler jusqu'à la section "Ce que disent les utilisateurs"**
3. **Vous devriez voir les 3 avis affichés**

## Note importante

- Assurez-vous que les utilisateurs **Basma Boughédda**, **Hiba El Ouafi**, et **Hamza Motassim** existent dans la base de données
- Si les utilisateurs n'existent pas, créez-les d'abord via l'interface d'inscription ou directement dans la base de données
- Le script SQL vérifie automatiquement que les utilisateurs n'ont pas déjà d'avis avant d'en créer un nouveau

