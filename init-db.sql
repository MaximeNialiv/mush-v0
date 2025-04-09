-- Création des tables
CREATE TABLE IF NOT EXISTS cards (
  sequential_id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  owner TEXT,
  child_ids TEXT[]
);

CREATE TABLE IF NOT EXISTS content (
  sequential_id TEXT PRIMARY KEY,
  owner_ids TEXT[],
  type TEXT CHECK (type IN ('doc', 'quiz')),
  description TEXT,
  media_url TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion de données de test
INSERT INTO cards (sequential_id, title, description, type, owner, child_ids)
VALUES 
  ('card_1', 'Vivre sans croissance', 'Dominique Méda - Limit', 'doc', 'system', ARRAY['content_1']),
  ('card_2', 'L''effondrement de la civilisation', 'Pablo Servigne - Seuil', 'doc', 'system', ARRAY['content_2']),
  ('card_3', 'Écologie et économie', 'Nicolas Hulot - Flammarion', 'doc', 'system', ARRAY['content_3']);

INSERT INTO content (sequential_id, owner_ids, type, description, media_url)
VALUES 
  ('content_1', ARRAY['system'], 'doc', 'FAUT-IL PRODUIRE MOINS POUR VIVRE MIEUX ? (et pour la planète) - Dominique Meda | LIMIT', 'https://i.pravatar.cc/500?img=1'),
  ('content_2', ARRAY['system'], 'doc', 'Comment se préparer à l''effondrement de notre civilisation industrielle - Pablo Servigne', 'https://i.pravatar.cc/500?img=2'),
  ('content_3', ARRAY['system'], 'doc', 'Repenser notre rapport à la nature et à l''économie - Nicolas Hulot', 'https://i.pravatar.cc/500?img=3');
