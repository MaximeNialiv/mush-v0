-- Mise à jour de la table content pour supporter les quiz
ALTER TABLE IF EXISTS content 
ADD COLUMN IF NOT EXISTS question TEXT,
ADD COLUMN IF NOT EXISTS answer_1 TEXT,
ADD COLUMN IF NOT EXISTS answer_2 TEXT,
ADD COLUMN IF NOT EXISTS answer_3 TEXT,
ADD COLUMN IF NOT EXISTS answer_4 TEXT,
ADD COLUMN IF NOT EXISTS result_1 BOOLEAN,
ADD COLUMN IF NOT EXISTS result_2 BOOLEAN,
ADD COLUMN IF NOT EXISTS result_3 BOOLEAN,
ADD COLUMN IF NOT EXISTS result_4 BOOLEAN,
ADD COLUMN IF NOT EXISTS correction_all TEXT;

-- Mise à jour de la table relation_user_content pour stocker les réponses des utilisateurs
ALTER TABLE IF EXISTS relation_user_content
ADD COLUMN IF NOT EXISTS result_1 BOOLEAN,
ADD COLUMN IF NOT EXISTS result_2 BOOLEAN,
ADD COLUMN IF NOT EXISTS result_3 BOOLEAN,
ADD COLUMN IF NOT EXISTS result_4 BOOLEAN,
ADD COLUMN IF NOT EXISTS points_a INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS last_view TIMESTAMPTZ DEFAULT NOW();

-- Création de la table user_profile si elle n'existe pas
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id),
  total_a INTEGER DEFAULT 0,
  total_b INTEGER DEFAULT 0,
  total_c INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion d'un quiz de test
INSERT INTO content (
  sequential_id, 
  owner_ids, 
  type, 
  description, 
  points, 
  question, 
  answer_1, 
  answer_2, 
  answer_3, 
  answer_4, 
  result_1, 
  result_2, 
  result_3, 
  result_4, 
  correction_all
) VALUES (
  'content_quiz_1',
  ARRAY['system'],
  'quiz',
  'QCM sur l''effet de serre',
  10,
  'Laquelle de ces phrases décrit le mieux l''effet de serre de l''atmosphère ?',
  'Sous l''action des rayons du soleil, certains gaz présents dans l''atmosphère se désintègrent en dégageant de la chaleur.',
  'Certains gaz présents dans l''atmosphère captent les rayons infrarouges émis par le Soleil et les réémettent vers le sol.',
  'Certains gaz présents dans l''atmosphère captent les rayons infrarouges émis par la Terre et les réémettent vers le sol.',
  'Certains gaz présents dans l''atmosphère captent les rayons infrarouges émis par le Soleil et les réémettent vers l''espace.',
  FALSE,
  FALSE,
  TRUE,
  FALSE,
  'Les rayons solaires éclairent la Terre. Une partie de ces rayons est réfléchie vers l''espace, une autre est absorbée par l''atmosphère et une autre l''est par le sol. Pour évacuer l''énergie absorbée, ce dernier rayonne à son tour dans le domaine infrarouge. Sans l''effet de serre, la totalité des rayons infrarouges émis par le sol irait directement se perdre dans l''espace. Cependant, certains gaz dits « à effet de serre » ont la capacité d''absorber ces infrarouges, ce qui entraîne une augmentation de leur température. Ils émettent ensuite l''énergie ainsi emmagasinée en émettant à leur tour des rayons infrarouges dans toutes les directions, y compris vers le sol.'
) ON CONFLICT (sequential_id) DO NOTHING;

-- Création d'une carte liée au quiz
INSERT INTO cards (
  sequential_id,
  title,
  description,
  type,
  owner,
  child_ids
) VALUES (
  'card_quiz_1',
  'QCM sur l''effet de serre',
  'Quiz - Environnement',
  'quiz',
  'system',
  ARRAY['content_quiz_1']
) ON CONFLICT (sequential_id) DO NOTHING;

-- Fonction pour créer automatiquement un profil utilisateur lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profile (auth_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
