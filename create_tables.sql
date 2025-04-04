-- Création de la table des tweets
CREATE TABLE IF NOT EXISTS tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0
);

-- Création de la table des profils
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

