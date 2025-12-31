-- Script SQL simple pour ajouter les colonnes manquantes à la table signalements
-- À exécuter dans PostgreSQL

-- Ajouter la colonne commentaires_techniques (si elle n'existe pas)
ALTER TABLE signalements 
ADD COLUMN IF NOT EXISTS commentaires_techniques TEXT;

-- Ajouter la colonne temps_passe_minutes (si elle n'existe pas)
ALTER TABLE signalements 
ADD COLUMN IF NOT EXISTS temps_passe_minutes INTEGER;

