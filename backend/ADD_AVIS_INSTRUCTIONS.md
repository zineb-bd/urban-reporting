# Instructions pour ajouter 3 avis dans la base de données

## Étapes à suivre

1. **Connectez-vous à votre base de données PostgreSQL**

2. **Vérifiez que les utilisateurs existent :**
   ```sql
   SELECT id, prenom, nom, email FROM users 
   WHERE role = 'CITOYEN' 
   AND (
       (LOWER(prenom) = 'basma' AND LOWER(nom) = 'boughedda') OR
       (LOWER(prenom) = 'hiba' AND LOWER(nom) LIKE '%ouafi%') OR
       (LOWER(prenom) = 'hamza' AND LOWER(nom) = 'motassim')
   );
   ```

3. **Exécutez le script SQL `add_avis_simple.sql`** ou utilisez les commandes suivantes :

```sql
-- Avis pour Basma Boughédda
INSERT INTO avis (note, commentaire, date_creation, date_modification, user_id)
SELECT 
    5,
    'Excellente plateforme ! J''ai signalé plusieurs problèmes dans mon quartier et ils ont tous été résolus rapidement. L''interface est intuitive et le suivi est parfait.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    id
FROM users
WHERE LOWER(prenom) = 'basma' 
  AND LOWER(nom) = 'boughedda' 
  AND role = 'CITOYEN'
  AND NOT EXISTS (
    SELECT 1 FROM avis WHERE user_id = users.id
  )
LIMIT 1;

-- Avis pour Hiba El Ouafi
INSERT INTO avis (note, commentaire, date_creation, date_modification, user_id)
SELECT 
    5,
    'Service vraiment efficace ! La municipalité répond rapidement à nos signalements. Je recommande cette plateforme à tous les citoyens soucieux de l''amélioration de leur ville.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    id
FROM users
WHERE LOWER(prenom) = 'hiba' 
  AND (LOWER(nom) LIKE '%ouafi%' OR LOWER(nom) LIKE '%el%ouafi%') 
  AND role = 'CITOYEN'
  AND NOT EXISTS (
    SELECT 1 FROM avis WHERE user_id = users.id
  )
LIMIT 1;

-- Avis pour Hamza Motassim
INSERT INTO avis (note, commentaire, date_creation, date_modification, user_id)
SELECT 
    4,
    'Très bonne expérience globale. Le système de suivi est excellent et permet de voir l''avancement des signalements en temps réel. Quelques améliorations mineures seraient les bienvenues, mais c''est déjà très bien !',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    id
FROM users
WHERE LOWER(prenom) = 'hamza' 
  AND LOWER(nom) = 'motassim' 
  AND role = 'CITOYEN'
  AND NOT EXISTS (
    SELECT 1 FROM avis WHERE user_id = users.id
  )
LIMIT 1;
```

## Vérification

Après avoir exécuté le script, vérifiez que les avis ont bien été créés :

```sql
SELECT a.id, a.note, a.commentaire, u.prenom, u.nom 
FROM avis a
JOIN users u ON a.user_id = u.id
WHERE u.role = 'CITOYEN'
ORDER BY a.date_creation DESC;
```

Les avis devraient maintenant apparaître sur la page d'accueil dans la section "Testimonials".

