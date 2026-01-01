-- Script SQL pour ajouter 3 avis pour les utilisateurs spécifiés
-- Exécutez ce script dans PostgreSQL

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

