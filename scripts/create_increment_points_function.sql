-- Fonction pour incrémenter les points d'un utilisateur de manière atomique
CREATE OR REPLACE FUNCTION increment_user_points(user_auth_id UUID, points_to_add INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_total INT;
BEGIN
  -- Mettre à jour les points et récupérer le nouveau total en une seule opération atomique
  UPDATE user_profile
  SET total_points = COALESCE(total_points, 0) + points_to_add
  WHERE auth_id = user_auth_id
  RETURNING total_points INTO new_total;
  
  -- Si l'utilisateur n'existe pas, retourner null
  IF new_total IS NULL THEN
    RAISE EXCEPTION 'Utilisateur avec auth_id % non trouvé', user_auth_id;
  END IF;
  
  -- Retourner le nouveau total de points
  RETURN new_total;
END;
$$;

-- Accorder les privilèges d'exécution sur la fonction
GRANT EXECUTE ON FUNCTION increment_user_points TO authenticated;
GRANT EXECUTE ON FUNCTION increment_user_points TO service_role;
GRANT EXECUTE ON FUNCTION increment_user_points TO anon;
