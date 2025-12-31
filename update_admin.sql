-- Requête SQL pour mettre à jour le nom de l'admin dans PostgreSQL
-- Mettre à jour le nom et prénom de l'admin avec l'email admin@mail.com

UPDATE users 
SET nom = 'BOUGHEDDA', 
    prenom = 'ZINEB'
WHERE email = 'admin@mail.com' 
  AND role = 'ADMIN';

-- Vérifier que la mise à jour a bien été effectuée
SELECT id, nom, prenom, email, role 
FROM users 
WHERE email = 'admin@mail.com';

