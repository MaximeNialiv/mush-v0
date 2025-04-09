import { createClient } from "@supabase/supabase-js"

// Configuration Supabase
const supabaseUrl = "https://vmrtygakzgwammtcoqts.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcnR5Z2Fremd3YW1tdGNvcXRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUwNTUwNSwiZXhwIjoyMDU5MDgxNTA1fQ.tMsbW4AxV_1h5tYPq_2Tv-qeDvmvAZBKrTdTEFpYgBc"

// Créer un client Supabase avec la clé de service
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateDatabase() {
  console.log("Mise à jour de la base de données Supabase...")

  try {
    // 1. Vérifier si les tables existent
    console.log("Vérification des tables existantes...")

    // Vérifier la table content
    const { data: contentExists, error: contentError } = await supabase.from("content").select("sequential_id").limit(1)

    if (contentError && contentError.code === "42P01") {
      console.log("La table content n'existe pas, création...")
      await createContentTable()
    } else {
      console.log("La table content existe, mise à jour...")
      await updateContentTable()
    }

    // Vérifier la table cards
    const { data: cardsExists, error: cardsError } = await supabase.from("cards").select("sequential_id").limit(1)

    if (cardsError && cardsError.code === "42P01") {
      console.log("La table cards n'existe pas, création...")
      await createCardsTable()
    } else {
      console.log("La table cards existe.")
    }

    // Vérifier la table relation_user_content
    const { data: relationExists, error: relationError } = await supabase
      .from("relation_user_content")
      .select("sequential_id")
      .limit(1)

    if (relationError && relationError.code === "42P01") {
      console.log("La table relation_user_content n'existe pas, création...")
      await createRelationTable()
    } else {
      console.log("La table relation_user_content existe, mise à jour...")
      await updateRelationTable()
    }

    // Vérifier la table user_profile
    const { data: profileExists, error: profileError } = await supabase.from("user_profile").select("id").limit(1)

    if (profileError && profileError.code === "42P01") {
      console.log("La table user_profile n'existe pas, création...")
      await createUserProfileTable()
    } else {
      console.log("La table user_profile existe.")
    }

    // 2. Ajouter des données de test
    console.log("Ajout de données de test pour les quiz...")
    await addTestData()

    console.log("Mise à jour de la base de données terminée avec succès!")
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la base de données:", error)
  }
}

async function createContentTable() {
  const { error } = await supabase.rpc("create_content_table")

  if (error) {
    console.error("Erreur lors de la création de la table content:", error)

    // Essayer avec une requête SQL directe
    const { error: sqlError } = await supabase.sql(`
      CREATE TABLE IF NOT EXISTS content (
        sequential_id TEXT PRIMARY KEY,
        owner_ids TEXT[],
        type TEXT,
        description TEXT,
        media_url TEXT,
        points INTEGER DEFAULT 0,
        question TEXT,
        answer_1 TEXT,
        answer_2 TEXT,
        answer_3 TEXT,
        answer_4 TEXT,
        result_1 BOOLEAN,
        result_2 BOOLEAN,
        result_3 BOOLEAN,
        result_4 BOOLEAN,
        correction_all TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    if (sqlError) {
      console.error("Erreur lors de la création SQL de la table content:", sqlError)
    }
  }
}

async function updateContentTable() {
  // Ajouter les colonnes pour les quiz si elles n'existent pas
  const columns = [
    "question",
    "answer_1",
    "answer_2",
    "answer_3",
    "answer_4",
    "result_1",
    "result_2",
    "result_3",
    "result_4",
    "correction_all",
  ]

  for (const column of columns) {
    const type = column.startsWith("result_") ? "BOOLEAN" : "TEXT"
    const { error } = await supabase.sql(`
      ALTER TABLE content 
      ADD COLUMN IF NOT EXISTS ${column} ${type}
    `)

    if (error) {
      console.error(`Erreur lors de l'ajout de la colonne ${column}:`, error)
    }
  }
}

async function createCardsTable() {
  const { error } = await supabase.sql(`
    CREATE TABLE IF NOT EXISTS cards (
      sequential_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT,
      owner TEXT,
      child_ids TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  if (error) {
    console.error("Erreur lors de la création de la table cards:", error)
  }
}

async function createRelationTable() {
  const { error } = await supabase.sql(`
    CREATE TABLE IF NOT EXISTS relation_user_content (
      sequential_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT,
      card_id TEXT,
      state TEXT,
      sender_id TEXT,
      points_a INTEGER DEFAULT 0,
      result_1 BOOLEAN,
      result_2 BOOLEAN,
      result_3 BOOLEAN,
      result_4 BOOLEAN,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_view TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  if (error) {
    console.error("Erreur lors de la création de la table relation_user_content:", error)
  }
}

async function updateRelationTable() {
  // Ajouter les colonnes pour les réponses aux quiz si elles n'existent pas
  const columns = [
    { name: "points_a", type: "INTEGER DEFAULT 0" },
    { name: "result_1", type: "BOOLEAN" },
    { name: "result_2", type: "BOOLEAN" },
    { name: "result_3", type: "BOOLEAN" },
    { name: "result_4", type: "BOOLEAN" },
    { name: "state", type: "TEXT" },
    { name: "last_view", type: "TIMESTAMPTZ DEFAULT NOW()" },
  ]

  for (const { name, type } of columns) {
    const { error } = await supabase.sql(`
      ALTER TABLE relation_user_content 
      ADD COLUMN IF NOT EXISTS ${name} ${type}
    `)

    if (error) {
      console.error(`Erreur lors de l'ajout de la colonne ${name}:`, error)
    }
  }
}

async function createUserProfileTable() {
  const { error } = await supabase.sql(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      auth_id UUID,
      pseu TEXT,
      total_a INTEGER DEFAULT 0,
      total_b INTEGER DEFAULT 0,
      total_c INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  if (error) {
    console.error("Erreur lors de la création de la table user_profile:", error)
  }

  // Créer un trigger pour créer automatiquement un profil utilisateur
  const { error: triggerError } = await supabase.sql(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.user_profile (auth_id)
      VALUES (NEW.id);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `)

  if (triggerError) {
    console.error("Erreur lors de la création du trigger:", triggerError)
  }
}

async function addTestData() {
  // Ajouter un quiz de test
  const quizContent = {
    sequential_id: "content_quiz_1",
    owner_ids: ["system"],
    type: "quiz",
    description: "QCM sur l'effet de serre",
    points: 10,
    question: "Laquelle de ces phrases décrit le mieux l'effet de serre de l'atmosphère ?",
    answer_1:
      "Sous l'action des rayons du soleil, certains gaz présents dans l'atmosphère se désintègrent en dégageant de la chaleur.",
    answer_2:
      "Certains gaz présents dans l'atmosphère captent les rayons infrarouges émis par le Soleil et les réémettent vers le sol.",
    answer_3:
      "Certains gaz présents dans l'atmosphère captent les rayons infrarouges émis par la Terre et les réémettent vers le sol.",
    answer_4:
      "Certains gaz présents dans l'atmosphère captent les rayons infrarouges émis par le Soleil et les réémettent vers l'espace.",
    result_1: false,
    result_2: false,
    result_3: true,
    result_4: false,
    correction_all:
      "Les rayons solaires éclairent la Terre. Une partie de ces rayons est réfléchie vers l'espace, une autre est absorbée par l'atmosphère et une autre l'est par le sol. Pour évacuer l'énergie absorbée, ce dernier rayonne à son tour dans le domaine infrarouge. Sans l'effet de serre, la totalité des rayons infrarouges émis par le sol irait directement se perdre dans l'espace. Cependant, certains gaz dits « à effet de serre » ont la capacité d'absorber ces infrarouges, ce qui entraîne une augmentation de leur température. Ils émettent ensuite l'énergie ainsi emmagasinée en émettant à leur tour des rayons infrarouges dans toutes les directions, y compris vers le sol.",
  }

  const { error: contentError } = await supabase.from("content").upsert(quizContent)

  if (contentError) {
    console.error("Erreur lors de l'ajout du contenu de quiz:", contentError)
  } else {
    console.log("Contenu de quiz ajouté avec succès")
  }

  // Ajouter une carte liée au quiz
  const quizCard = {
    sequential_id: "card_quiz_1",
    title: "QCM sur l'effet de serre",
    description: "Quiz - Environnement",
    type: "quiz",
    owner: "system",
    child_ids: ["content_quiz_1"],
  }

  const { error: cardError } = await supabase.from("cards").upsert(quizCard)

  if (cardError) {
    console.error("Erreur lors de l'ajout de la carte de quiz:", cardError)
  } else {
    console.log("Carte de quiz ajoutée avec succès")
  }
}

// Exécuter la mise à jour
updateDatabase()
