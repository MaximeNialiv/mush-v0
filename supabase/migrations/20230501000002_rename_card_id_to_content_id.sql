-- Mise à jour pour renommer card_id en content_id dans la table relation_user_content

-- Si la colonne content_id n'existe pas déjà, la créer et copier les données depuis card_id
DO $$
BEGIN
  -- Vérifier si la colonne card_id existe
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'relation_user_content' AND column_name = 'card_id'
  ) THEN
    -- Vérifier si la colonne content_id n'existe pas déjà
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'relation_user_content' AND column_name = 'content_id'
    ) THEN
      -- Ajouter la colonne content_id
      ALTER TABLE relation_user_content ADD COLUMN content_id TEXT;
      
      -- Copier les données de card_id vers content_id
      UPDATE relation_user_content SET content_id = card_id;
      
      -- Rendre content_id NOT NULL si nécessaire
      ALTER TABLE relation_user_content ALTER COLUMN content_id SET NOT NULL;
      
      -- Supprimer la colonne card_id
      ALTER TABLE relation_user_content DROP COLUMN card_id;
    END IF;
  END IF;
END $$;

-- Mise à jour des contraintes si nécessaires
-- (Ajoutez ici les commandes pour recréer les contraintes de clé étrangère si nécessaire)

-- Ajouter un commentaire sur la colonne
COMMENT ON COLUMN relation_user_content.content_id IS 'ID du contenu associé à la relation (renommé depuis card_id)';
