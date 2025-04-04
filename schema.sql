-- Création de la table des tweets
CREATE TABLE tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0
);

-- Création de la table des profils
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajout d'une contrainte de clé étrangère
ALTER TABLE tweets ADD CONSTRAINT fk_tweets_profiles 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Activer RLS (Row Level Security)
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture des tweets (tout le monde peut lire)
CREATE POLICY "Tweets are viewable by everyone" 
  ON tweets FOR SELECT 
  USING (true);

-- Politique pour la lecture des profils (tout le monde peut lire)
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

-- Politique pour l'insertion des tweets (tout le monde peut insérer pour l'instant)
CREATE POLICY "Anyone can insert tweets" 
  ON tweets FOR INSERT 
  WITH CHECK (true);

-- Politique pour la mise à jour des tweets (tout le monde peut mettre à jour pour l'instant)
CREATE POLICY "Anyone can update tweets" 
  ON tweets FOR UPDATE 
  USING (true);

-- Politique pour l'insertion des profils (tout le monde peut insérer pour l'instant)
CREATE POLICY "Anyone can insert profiles" 
  ON profiles FOR INSERT 
  WITH CHECK (true);

-- Politique pour la mise à jour des profils (tout le monde peut mettre à jour pour l'instant)
CREATE POLICY "Anyone can update profiles" 
  ON profiles FOR UPDATE 
  USING (true);

-- Insertion de quelques profils de démonstration
INSERT INTO profiles (name, handle, avatar_url, bio)
VALUES 
  ('Marie Dupont', '@marie_dupont', 'https://i.pravatar.cc/150?u=marie', 'Développeuse web passionnée'),
  ('Thomas Martin', '@thomas_m', 'https://i.pravatar.cc/150?u=thomas', 'Designer UX/UI'),
  ('Sophie Bernard', '@sophie_b', 'https://i.pravatar.cc/150?u=sophie', 'Entrepreneure tech');

-- Insertion de quelques tweets de démonstration
INSERT INTO tweets (content, user_id, likes, retweets, replies)
VALUES 
  ('Je viens de découvrir un nouvel outil de développement incroyable ! #coding #webdev', 
   (SELECT id FROM profiles WHERE handle = '@marie_dupont'), 24, 5, 3),
  ('Qui est partant pour une conférence tech ce weekend à Paris ? On pourrait échanger sur les dernières tendances en IA.',
   (SELECT id FROM profiles WHERE handle = '@thomas_m'), 42, 12, 8),
  ('Je viens de terminer mon nouveau site web portfolio ! N''hésitez pas à me donner votre avis 🙏 https://portfolio.exemple.fr',
   (SELECT id FROM profiles WHERE handle = '@sophie_b'), 87, 15, 23);

