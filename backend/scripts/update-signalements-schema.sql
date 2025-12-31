-- Script SQL pour mettre à jour le schéma de la table signalements
-- Exécutez ce script si Hibernate ne met pas à jour automatiquement le schéma

-- Mettre à jour la colonne adresse en TEXT
ALTER TABLE signalements ALTER COLUMN adresse TYPE TEXT;

-- Mettre à jour la colonne photo_url en TEXT
ALTER TABLE signalements ALTER COLUMN photo_url TYPE TEXT;

-- Mettre à jour la colonne titre pour supporter jusqu'à 500 caractères
ALTER TABLE signalements ALTER COLUMN titre TYPE VARCHAR(500);

-- Mettre à jour la colonne categorie pour supporter jusqu'à 100 caractères (normalement pas nécessaire mais pour sécurité)
ALTER TABLE signalements ALTER COLUMN categorie TYPE VARCHAR(100);


