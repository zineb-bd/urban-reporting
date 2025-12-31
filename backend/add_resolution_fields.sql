-- Script SQL pour ajouter les colonnes commentairesTechniques et tempsPasseMinutes
-- à la table signalements si elles n'existent pas déjà

-- Pour PostgreSQL
DO $$ 
BEGIN
    -- Ajouter la colonne commentairesTechniques si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'signalements' 
        AND column_name = 'commentaires_techniques'
    ) THEN
        ALTER TABLE signalements 
        ADD COLUMN commentaires_techniques TEXT;
    END IF;

    -- Ajouter la colonne tempsPasseMinutes si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'signalements' 
        AND column_name = 'temps_passe_minutes'
    ) THEN
        ALTER TABLE signalements 
        ADD COLUMN temps_passe_minutes INTEGER;
    END IF;
END $$;

-- Pour H2 (si vous utilisez H2)
-- ALTER TABLE signalements ADD COLUMN IF NOT EXISTS commentaires_techniques TEXT;
-- ALTER TABLE signalements ADD COLUMN IF NOT EXISTS temps_passe_minutes INTEGER;

