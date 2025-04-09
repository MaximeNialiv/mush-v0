-- Mise à jour pour renommer child_ids en content_ids

-- Si la colonne content_ids n'existe pas déjà, la créer et copier les données depuis child_ids
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'child_ids'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'content_ids'
  ) THEN
    ALTER TABLE cards ADD COLUMN content_ids TEXT[];
    UPDATE cards SET content_ids = child_ids;
    -- Commenter cette ligne si vous ne souhaitez pas supprimer child_ids tout de suite
    -- ALTER TABLE cards DROP COLUMN child_ids;
  END IF;
END $$;

-- Mise à jour des procédures stockées qui utilisent child_ids (le cas échéant)
-- ...

-- Mise à jour des vues qui utilisent child_ids (le cas échéant)
-- ...

COMMENT ON COLUMN cards.content_ids IS 'Liste des IDs de contenus associés à la carte (renommé depuis child_ids)';
