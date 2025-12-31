-- Script de création de la base de données PostgreSQL
-- Exécutez ce script avec: psql -U postgres -f create-database.sql

-- Créer la base de données
CREATE DATABASE cityreport;

-- Se connecter à la base de données (nécessite une nouvelle connexion)
\c cityreport

-- Créer un utilisateur dédié (optionnel mais recommandé)
-- CREATE USER cityreport_user WITH PASSWORD 'cityreport123';
-- GRANT ALL PRIVILEGES ON DATABASE cityreport TO cityreport_user;

-- Afficher les informations
\echo 'Base de donnees cityreport creee avec succes!'
\echo 'Vous pouvez maintenant demarrer le backend Spring Boot avec PostgreSQL'




