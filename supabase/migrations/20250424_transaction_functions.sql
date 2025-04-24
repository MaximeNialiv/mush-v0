-- Fonction pour commencer une transaction
CREATE OR REPLACE FUNCTION begin_transaction()
RETURNS void AS $$
BEGIN
  -- Commencer une transaction
  BEGIN;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider une transaction
CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void AS $$
BEGIN
  -- Valider la transaction
  COMMIT;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour annuler une transaction
CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void AS $$
BEGIN
  -- Annuler la transaction
  ROLLBACK;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour déplacer une carte vers un dossier
CREATE OR REPLACE FUNCTION move_card_to_folder(
  card_id TEXT,
  new_parent_id TEXT,
  old_parent_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  old_child_ids JSONB[];
  new_child_ids JSONB[];
  success BOOLEAN := TRUE;
BEGIN
  -- Mettre à jour le parent_id de la carte
  UPDATE cards
  SET 
    parent_id = new_parent_id,
    updated_at = NOW()
  WHERE sequential_id = card_id;
  
  -- Si l'ancien parent existe, retirer card_id de ses child_ids
  IF old_parent_id IS NOT NULL THEN
    -- Récupérer l'ancien parent
    SELECT child_ids INTO old_child_ids
    FROM cards
    WHERE sequential_id = old_parent_id;
    
    -- Filtrer le card_id des child_ids
    UPDATE cards
    SET 
      child_ids = ARRAY(
        SELECT jsonb_array_elements(jsonb_build_array(child_ids))
        WHERE jsonb_typeof(jsonb_array_elements(jsonb_build_array(child_ids))) = 'string'
        AND jsonb_array_elements(jsonb_build_array(child_ids))::text != concat('"', card_id, '"')::text
      ),
      updated_at = NOW()
    WHERE sequential_id = old_parent_id;
  END IF;
  
  -- Si le nouveau parent existe, ajouter card_id à ses child_ids
  IF new_parent_id IS NOT NULL THEN
    -- Récupérer le nouveau parent
    SELECT child_ids INTO new_child_ids
    FROM cards
    WHERE sequential_id = new_parent_id;
    
    -- Vérifier si card_id est déjà dans child_ids
    IF NOT EXISTS (
      SELECT 1
      FROM cards, jsonb_array_elements(jsonb_build_array(child_ids)) AS elem
      WHERE sequential_id = new_parent_id
      AND elem::text = concat('"', card_id, '"')::text
    ) THEN
      -- Ajouter card_id aux child_ids
      UPDATE cards
      SET 
        child_ids = CASE 
          WHEN child_ids IS NULL THEN ARRAY[to_jsonb(card_id)]::jsonb[]
          ELSE child_ids || to_jsonb(card_id)
        END,
        updated_at = NOW()
      WHERE sequential_id = new_parent_id;
    END IF;
  END IF;
  
  RETURN success;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
