-- Script pour vérifier si les avis existent dans la base de données
-- Exécutez ce script pour diagnostiquer le problème

-- 1. Vérifier si les utilisateurs existent
SELECT id, prenom, nom, email, role 
FROM users 
WHERE role = 'CITOYEN' 
AND (
    (LOWER(TRIM(prenom)) = 'basma' AND LOWER(TRIM(nom)) = 'boughedda') OR
    (LOWER(TRIM(prenom)) = 'hiba' AND LOWER(TRIM(nom)) LIKE '%ouafi%') OR
    (LOWER(TRIM(prenom)) = 'hamza' AND LOWER(TRIM(nom)) = 'motassim')
)
ORDER BY id;

-- 2. Vérifier si les avis existent
SELECT 
    a.id,
    a.note,
    LEFT(a.commentaire, 50) as commentaire_preview,
    a.date_creation,
    a.date_modification,
    a.user_id,
    u.prenom,
    u.nom,
    u.email
FROM avis a
LEFT JOIN users u ON a.user_id = u.id
ORDER BY a.date_creation DESC;

-- 3. Vérifier le nombre total d'avis
SELECT COUNT(*) as nombre_avis FROM avis;

-- 4. Vérifier les avis avec les utilisateurs (requête similaire à celle de l'API)
SELECT 
    a.id,
    a.note,
    a.commentaire,
    a.date_creation,
    u.id as user_id,
    u.prenom,
    u.nom,
    u.email
FROM avis a
INNER JOIN users u ON a.user_id = u.id
ORDER BY a.date_creation DESC
LIMIT 3;

