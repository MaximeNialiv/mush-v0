// Script pour appliquer les migrations SQL à Supabase
// Exécuter avec: node scripts/apply-migrations.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies');
  process.exit(1);
}

// Créer un client Supabase avec la clé de service pour les permissions admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Chemin vers le dossier des migrations
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

async function applyMigrations() {
  try {
    // Lire tous les fichiers de migration
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Trier par ordre alphabétique

    console.log(`Trouvé ${files.length} fichiers de migration`);

    for (const file of files) {
      console.log(`Application de la migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Exécuter le SQL
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Erreur lors de l'application de ${file}:`, error);
        // Continuer avec les autres migrations
      } else {
        console.log(`Migration ${file} appliquée avec succès`);
      }
    }

    console.log('Toutes les migrations ont été appliquées');
  } catch (error) {
    console.error('Erreur lors de l\'application des migrations:', error);
    process.exit(1);
  }
}

// Exécuter les migrations
applyMigrations();
