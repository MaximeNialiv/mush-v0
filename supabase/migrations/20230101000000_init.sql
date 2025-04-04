-- Fonction pour créer la table des tweets si elle n'existe pas
CREATE OR REPLACE FUNCTION create_tweets_table_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS tweets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    likes INTEGER DEFAULT 0,
    retweets INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0
  );
  
  -- Activer RLS (Row Level Security)
  ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;
  
  -- Politique pour la lecture (tout le monde peut lire)
  DROP POLICY IF EXISTS "Tweets are viewable by everyone" ON tweets;
  CREATE POLICY "Tweets are viewable by everyone" 
    ON tweets FOR SELECT 
    USING (true);
  
  -- Politique pour l'insertion (utilisateurs authentifiés)
  DROP POLICY IF EXISTS "Users can insert their own tweets" ON tweets;
  CREATE POLICY "Users can insert their own tweets" 
    ON tweets FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  
  -- Politique pour la mise à jour (propriétaires uniquement)
  DROP POLICY IF EXISTS "Users can update their own tweets" ON tweets;
  CREATE POLICY "Users can update their own tweets" 
    ON tweets FOR UPDATE 
    USING (auth.uid() = user_id);
  
  -- Politique pour la suppression (propriétaires uniquement)
  DROP POLICY IF EXISTS "Users can delete their own tweets" ON tweets;
  CREATE POLICY "Users can delete their own tweets" 
    ON tweets FOR DELETE 
    USING (auth.uid() = user_id);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer la table des profils si elle n'existe pas
CREATE OR REPLACE FUNCTION create_profiles_table_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT,
    handle TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Activer RLS (Row Level Security)
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  
  -- Politique pour la lecture (tout le monde peut lire)
  DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
  CREATE POLICY "Profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (true);
  
  -- Politique pour l'insertion (utilisateurs authentifiés)
  DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
  CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);
  
  -- Politique pour la mise à jour (propriétaires uniquement)
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);
  
  -- Trigger pour mettre à jour le champ updated_at
  CREATE OR REPLACE FUNCTION update_profiles_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  DROP TRIGGER IF EXISTS update_profiles_updated_at_trigger ON profiles;
  CREATE TRIGGER update_profiles_updated_at_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();
END;
$$ LANGUAGE plpgsql;

