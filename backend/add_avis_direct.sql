-- Script SQL direct pour ajouter 3 avis
-- Les utilisateurs doivent déjà exister dans la base de données
-- Ce script trouve automatiquement les utilisateurs par leur nom/prénom

-- Avis pour Basma Boughédda (Note: 5/5)
INSERT INTO avis (note, commentaire, date_creation, date_modification, user_id)
SELECT 
    5,
    'Excellente plateforme ! J''ai signalé plusieurs problèmes dans mon quartier et ils ont tous été résolus rapidement. L''interface est intuitive et le suivi est parfait.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    u.id
FROM users u
WHERE LOWER(TRIM(u.prenom)) = 'basma' 
  AND LOWER(TRIM(u.nom)) = 'boughedda' 
  AND u.role = 'CITOYEN'
  AND NOT EXISTS (SELECT 1 FROM avis a WHERE a.user_id = u.id)
LIMIT 1;

-- Avis pour Hiba El Ouafi (Note: 5/5)
INSERT INTO avis (note, commentaire, date_creation, date_modification, user_id)
SELECT 
    5,
    'Service vraiment efficace ! La municipalité répond rapidement à nos signalements. Je recommande cette plateforme à tous les citoyens soucieux de l''amélioration de leur ville.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    u.id
FROM users u
WHERE LOWER(TRIM(u.prenom)) = 'hiba' 
  AND (LOWER(TRIM(u.nom)) LIKE '%ouafi%' OR LOWER(TRIM(u.nom)) LIKE '%el%ouafi%') 
  AND u.role = 'CITOYEN'
  AND NOT EXISTS (SELECT 1 FROM avis a WHERE a.user_id = u.id)
LIMIT 1;

-- Avis pour Hamza Motassim (Note: 4/5)
INSERT INTO avis (note, commentaire, date_creation, date_modification, user_id)
SELECT 
    4,
    'Très bonne expérience globale. Le système de suivi est excellent et permet de voir l''avancement des signalements en temps réel. Quelques améliorations mineures seraient les bienvenues, mais c''est déjà très bien !',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    u.id
FROM users u
WHERE LOWER(TRIM(u.prenom)) = 'hamza' 
  AND LOWER(TRIM(u.nom)) = 'motassim' 
  AND u.role = 'CITOYEN'
  AND NOT EXISTS (SELECT 1 FROM avis a WHERE a.user_id = u.id)
LIMIT 1;

-- Vérification : Afficher les avis créés
SELECT 
    a.id,
    a.note,
    LEFT(a.commentaire, 60) as commentaire_preview,
    u.prenom,
    u.nom,
    u.email,
    a.date_creation
FROM avis a
JOIN users u ON a.user_id = u.id
WHERE u.role = 'CITOYEN'
  AND (
    (LOWER(TRIM(u.prenom)) = 'basma' AND LOWER(TRIM(u.nom)) = 'boughedda') OR
    (LOWER(TRIM(u.prenom)) = 'hiba' AND LOWER(TRIM(u.nom)) LIKE '%ouafi%') OR
    (LOWER(TRIM(u.prenom)) = 'hamza' AND LOWER(TRIM(u.nom)) = 'motassim')
  )
ORDER BY a.date_creation DESC;

