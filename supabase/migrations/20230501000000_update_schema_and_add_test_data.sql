-- =============================================
-- MISE À JOUR DU SCHÉMA DE LA BASE DE DONNÉES
-- =============================================

-- Activer l'extension uuid-ossp si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table cards (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS cards (
  sequential_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  owner TEXT,
  content_ids TEXT[], -- Renommé de child_ids à content_ids
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Si la table cards existe déjà avec child_ids, ajouter content_ids
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
  END IF;
END $$;

-- Table content (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS content (
  sequential_id TEXT PRIMARY KEY,
  owner_ids TEXT[],
  type TEXT,
  description TEXT,
  media_url TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajout des colonnes pour les quiz à la table content
ALTER TABLE content 
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

-- Table relation_user_content (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS relation_user_content (
  sequential_id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT,
  card_id TEXT,
  state TEXT,
  sender_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajout des colonnes pour les réponses aux quiz à la table relation_user_content
ALTER TABLE relation_user_content
ADD COLUMN IF NOT EXISTS points_a INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS result_1 BOOLEAN,
ADD COLUMN IF NOT EXISTS result_2 BOOLEAN,
ADD COLUMN IF NOT EXISTS result_3 BOOLEAN,
ADD COLUMN IF NOT EXISTS result_4 BOOLEAN,
ADD COLUMN IF NOT EXISTS last_view TIMESTAMPTZ DEFAULT NOW();

-- Table user_profile (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID,
  pseu TEXT,
  total_a INTEGER DEFAULT 0,
  total_b INTEGER DEFAULT 0,
  total_c INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- =============================================
-- AJOUT DE DONNÉES DE TEST
-- =============================================

-- Données de test pour les contenus de type document/vidéo
INSERT INTO content (sequential_id, owner_ids, type, description, media_url, points, created_at, updated_at)
VALUES 
  ('content_1', ARRAY['system'], 'doc', 'Vivre sans croissance (Dominique Méda - Limit)', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 5, NOW(), NOW()),
  ('content_2', ARRAY['system'], 'doc', 'Comment se préparer à l''effondrement de notre civilisation industrielle - Pablo Servigne', 'https://www.ted.com/talks/pablo_servigne_how_to_be_a_good_ancestor', 5, NOW(), NOW()),
  ('content_3', ARRAY['system'], 'doc', 'Repenser notre rapport à la nature et à l''économie - Nicolas Hulot', 'https://www.lemonde.fr', 5, NOW(), NOW()),
  ('content_4', ARRAY['system'], 'doc', 'Podcast sur l''écologie et la transition énergétique', 'https://open.spotify.com/episode/5V4XZWkEJGGBp6kL7dttQZ', 5, NOW(), NOW())
ON CONFLICT (sequential_id) DO UPDATE SET
  description = EXCLUDED.description,
  media_url = EXCLUDED.media_url,
  points = EXCLUDED.points,
  updated_at = NOW();

-- Données de test pour les cartes liées aux contenus
INSERT INTO cards (sequential_id, title, description, type, owner, content_ids, created_at, updated_at)
VALUES 
  ('card_1', 'Vivre sans croissance', 'Dominique Méda - Limit', 'doc', 'system', ARRAY['content_1'], NOW(), NOW()),
  ('card_2', 'L''effondrement de la civilisation', 'Pablo Servigne - Seuil', 'doc', 'system', ARRAY['content_2'], NOW(), NOW()),
  ('card_3', 'Écologie et économie', 'Nicolas Hulot - Flammarion', 'doc', 'system', ARRAY['content_3'], NOW(), NOW()),
  ('card_4', 'Podcast sur l''écologie', 'France Culture - Podcast', 'doc', 'system', ARRAY['content_4'], NOW(), NOW())
ON CONFLICT (sequential_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content_ids = EXCLUDED.content_ids,
  updated_at = NOW();

-- Données de test pour les quiz
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
  correction_all,
  created_at,
  updated_at
)
VALUES 
  (
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
    'Les rayons solaires éclairent la Terre. Une partie de ces rayons est réfléchie vers l''espace, une autre est absorbée par l''atmosphère et une autre l''est par le sol. Pour évacuer l''énergie absorbée, ce dernier rayonne à son tour dans le domaine infrarouge. Sans l''effet de serre, la totalité des rayons infrarouges émis par le sol irait directement se perdre dans l''espace. Cependant, certains gaz dits « à effet de serre » ont la capacité d''absorber ces infrarouges, ce qui entraîne une augmentation de leur température. Ils émettent ensuite l''énergie ainsi emmagasinée en émettant à leur tour des rayons infrarouges dans toutes les directions, y compris vers le sol.',
    NOW(),
    NOW()
  ),
  (
    'content_quiz_2',
    ARRAY['system'],
    'quiz',
    'QCM sur les énergies renouvelables',
    15,
    'Parmi ces sources d''énergie, lesquelles sont considérées comme renouvelables ?',
    'L''énergie solaire',
    'Le gaz naturel',
    'L''énergie éolienne',
    'Le charbon',
    TRUE,
    FALSE,
    TRUE,
    FALSE,
    'Les énergies renouvelables sont des sources d''énergie dont le renouvellement naturel est assez rapide pour qu''elles puissent être considérées comme inépuisables à l''échelle du temps humain. L''énergie solaire et l''énergie éolienne sont renouvelables car elles proviennent respectivement du soleil et du vent, des ressources naturelles inépuisables. En revanche, le gaz naturel et le charbon sont des énergies fossiles, issues de la décomposition de matières organiques enfouies dans le sol pendant des millions d''années, et sont donc non-renouvelables à l''échelle humaine.',
    NOW(),
    NOW()
  ),
  (
    'content_quiz_3',
    ARRAY['system'],
    'quiz',
    'QCM sur la biodiversité',
    12,
    'Quelles sont les principales causes de la perte de biodiversité dans le monde ?',
    'La destruction des habitats naturels',
    'L''introduction d''espèces invasives',
    'La surexploitation des ressources',
    'Le changement climatique',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    'La perte de biodiversité est causée par plusieurs facteurs majeurs, tous liés aux activités humaines. La destruction des habitats naturels (déforestation, urbanisation, agriculture intensive) est la principale cause. L''introduction d''espèces invasives perturbe les écosystèmes locaux. La surexploitation des ressources (surpêche, braconnage) menace de nombreuses espèces. Enfin, le changement climatique modifie les conditions de vie de nombreuses espèces qui ne peuvent pas toujours s''adapter assez rapidement. Ces quatre facteurs combinés expliquent la sixième extinction de masse que nous connaissons actuellement.',
    NOW(),
    NOW()
  )
ON CONFLICT (sequential_id) DO UPDATE SET
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  question = EXCLUDED.question,
  answer_1 = EXCLUDED.answer_1,
  answer_2 = EXCLUDED.answer_2,
  answer_3 = EXCLUDED.answer_3,
  answer_4 = EXCLUDED.answer_4,
  result_1 = EXCLUDED.result_1,
  result_2 = EXCLUDED.result_2,
  result_3 = EXCLUDED.result_3,
  result_4 = EXCLUDED.result_4,
  correction_all = EXCLUDED.correction_all,
  updated_at = NOW();

-- Cartes pour les quiz
INSERT INTO cards (sequential_id, title, description, type, owner, content_ids, created_at, updated_at)
VALUES 
  ('card_quiz_1', 'QCM sur l''effet de serre', 'Quiz - Environnement', 'quiz', 'system', ARRAY['content_quiz_1'], NOW(), NOW()),
  ('card_quiz_2', 'QCM sur les énergies renouvelables', 'Quiz - Énergie', 'quiz', 'system', ARRAY['content_quiz_2'], NOW(), NOW()),
  ('card_quiz_3', 'QCM sur la biodiversité', 'Quiz - Biodiversité', 'quiz', 'system', ARRAY['content_quiz_3'], NOW(), NOW())
ON CONFLICT (sequential_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content_ids = EXCLUDED.content_ids,
  updated_at = NOW();

-- Exemple de contenu mixte (vidéo + quiz)
INSERT INTO content (
  sequential_id, 
  owner_ids, 
  type, 
  description, 
  media_url,
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
  correction_all,
  created_at,
  updated_at
)
VALUES 
  (
    'content_mixed_1',
    ARRAY['system'],
    'quiz',
    'Comprendre le réchauffement climatique',
    'https://www.youtube.com/watch?v=F-Hcu3jH8G4',
    8,
    'Quelle est la principale cause du réchauffement climatique actuel ?',
    'Les variations naturelles du climat',
    'L''activité solaire',
    'Les émissions de gaz à effet de serre d''origine humaine',
    'Les éruptions volcaniques',
    FALSE,
    FALSE,
    TRUE,
    FALSE,
    'Le réchauffement climatique actuel est principalement causé par les émissions de gaz à effet de serre d''origine humaine, notamment le dioxyde de carbone (CO2) issu de la combustion des énergies fossiles. Bien que le climat ait toujours varié naturellement, la rapidité et l''ampleur du réchauffement observé depuis le milieu du 20e siècle ne peuvent s''expliquer que par l''influence humaine. Les variations de l''activité solaire et les éruptions volcaniques ont un impact mineur comparé à celui des émissions de gaz à effet de serre.',
    NOW(),
    NOW()
  )
ON CONFLICT (sequential_id) DO UPDATE SET
  description = EXCLUDED.description,
  media_url = EXCLUDED.media_url,
  points = EXCLUDED.points,
  question = EXCLUDED.question,
  answer_1 = EXCLUDED.answer_1,
  answer_2 = EXCLUDED.answer_2,
  answer_3 = EXCLUDED.answer_3,
  answer_4 = EXCLUDED.answer_4,
  result_1 = EXCLUDED.result_1,
  result_2 = EXCLUDED.result_2,
  result_3 = EXCLUDED.result_3,
  result_4 = EXCLUDED.result_4,
  correction_all = EXCLUDED.correction_all,
  updated_at = NOW();

-- Carte pour le contenu mixte
INSERT INTO cards (sequential_id, title, description, type, owner, content_ids, created_at, updated_at)
VALUES 
  ('card_mixed_1', 'Vidéo + Quiz sur le climat', 'Jean Jouzel - CNRS', 'quiz', 'system', ARRAY['content_mixed_1'], NOW(), NOW())
ON CONFLICT (sequential_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content_ids = EXCLUDED.content_ids,
  updated_at = NOW();

-- Exemple de carte avec plusieurs contenus (collection)
INSERT INTO cards (sequential_id, title, description, type, owner, content_ids, created_at, updated_at)
VALUES 
  ('card_collection_1', 'L''effet de serre', 'Créé par Fabien Mush', 'collection', 'system', ARRAY['content_1', 'content_quiz_1', 'content_quiz_2'], NOW(), NOW())
ON CONFLICT (sequential_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content_ids = EXCLUDED.content_ids,
  updated_at = NOW();

-- =============================================
-- CONFIGURATION DES POLITIQUES DE SÉCURITÉ (RLS)
-- =============================================

-- Activer RLS sur les tables
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE relation_user_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table cards
DROP POLICY IF EXISTS "Cards are viewable by everyone" ON cards;
CREATE POLICY "Cards are viewable by everyone" 
  ON cards FOR SELECT 
  USING (true);

-- Politiques pour la table content
DROP POLICY IF EXISTS "Content is viewable by everyone" ON content;
CREATE POLICY "Content is viewable by everyone" 
  ON content FOR SELECT 
  USING (true);

-- Politiques pour la table relation_user_content
DROP POLICY IF EXISTS "Users can view their own relations" ON relation_user_content;
CREATE POLICY "Users can view their own relations" 
  ON relation_user_content FOR SELECT 
  USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can insert their own relations" ON relation_user_content;
CREATE POLICY "Users can insert their own relations" 
  ON relation_user_content FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can update their own relations" ON relation_user_content;
CREATE POLICY "Users can update their own relations" 
  ON relation_user_content FOR UPDATE 
  USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- Politiques pour la table user_profile
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profile;
CREATE POLICY "Users can view their own profile" 
  ON user_profile FOR SELECT 
  USING (auth.uid() = auth_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profile;
CREATE POLICY "Users can update their own profile" 
  ON user_profile FOR UPDATE 
  USING (auth.uid() = auth_id OR auth.role() = 'service_role');
