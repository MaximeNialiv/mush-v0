// Script pour créer des cartes à la racine de l'arborescence (sans parent_id)
// Exécuter avec: node scripts/create-root-cards.js

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Lire le fichier .env.local manuellement
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parser les variables d'environnement
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('='); // Recombiner au cas où la valeur contient des =
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

// Configuration Supabase
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL Supabase:', supabaseUrl);
console.log('Clé de service trouvée:', supabaseServiceKey ? 'Oui' : 'Non');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies dans .env.local');
  process.exit(1);
}

// Définition des cartes à créer à la racine
const rootCards = [
  {
    sequential_id: 'card_ecologie_generale',
    title: 'Écologie Générale',
    description: 'Principes fondamentaux de l\'écologie',
    type: 'card',
    owner: 'system',
    content_ids: [],
    child_ids: [],
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    sequential_id: 'card_changement_climatique',
    title: 'Changement Climatique',
    description: 'Causes et conséquences du changement climatique',
    type: 'card',
    owner: 'system',
    content_ids: [],
    child_ids: [],
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    sequential_id: 'card_biodiversite',
    title: 'Biodiversité',
    description: 'Importance de la biodiversité pour les écosystèmes',
    type: 'card',
    owner: 'system',
    content_ids: [],
    child_ids: [],
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Fonction pour créer une carte
async function createCard(card) {
  try {
    console.log(`Création de la carte ${card.sequential_id} (${card.title})...`);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(card)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }
    
    console.log(`✅ Carte ${card.sequential_id} créée avec succès`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la création de la carte ${card.sequential_id}:`, error.message);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('Début de la création des cartes à la racine...');
  
  let successCount = 0;
  let errorCount = 0;
  
  // Créer chaque carte
  for (const card of rootCards) {
    const success = await createCard(card);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log(`\nCréation terminée: ${successCount} cartes créées avec succès, ${errorCount} erreurs`);
}

// Exécuter le script
main().catch(error => {
  console.error('Erreur non gérée:', error);
  process.exit(1);
});
