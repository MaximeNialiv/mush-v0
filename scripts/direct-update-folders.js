// Script pour mettre à jour directement les child_ids des dossiers via l'API REST de Supabase
// Exécuter avec: node scripts/direct-update-folders.js

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

// Définition des dossiers et de leurs enfants
const folderStructure = [
  {
    id: 'folder_root',
    title: 'Root',
    child_ids: ['folder_ateliers', 'folder_solutions', 'folder_actions']
  },
  {
    id: 'folder_ateliers',
    title: 'Ateliers',
    child_ids: ['folder_ateliers_fresque', 'folder_ateliers_tour', 'folder_ateliers_2tonnes']
  },
  {
    id: 'folder_solutions',
    title: 'Solutions',
    child_ids: ['folder_solutions_energie', 'folder_solutions_alimentation', 'folder_solutions_mobilite']
  },
  {
    id: 'folder_actions',
    title: 'Actions',
    child_ids: ['folder_actions_maison', 'folder_actions_transport', 'folder_actions_conso']
  },
  {
    id: 'folder_ateliers_fresque',
    title: 'Fresque du Climat',
    child_ids: ['card_fresque_1', 'card_fresque_2']
  },
  {
    id: 'folder_ateliers_tour',
    title: 'Tour de France',
    child_ids: ['card_tour_1']
  },
  {
    id: 'folder_ateliers_2tonnes',
    title: '2tonnes',
    child_ids: ['card_2tonnes_1']
  },
  {
    id: 'folder_solutions_energie',
    title: 'Énergie',
    child_ids: ['card_energie_1', 'card_energie_2']
  },
  {
    id: 'folder_solutions_alimentation',
    title: 'Alimentation',
    child_ids: ['card_alimentation_1', 'card_alimentation_2']
  },
  {
    id: 'folder_solutions_mobilite',
    title: 'Mobilité',
    child_ids: ['card_mobilite_1', 'card_mobilite_2']
  },
  {
    id: 'folder_actions_maison',
    title: 'Maison',
    child_ids: ['card_maison_1', 'card_maison_2']
  },
  {
    id: 'folder_actions_transport',
    title: 'Transport',
    child_ids: ['card_transport_1', 'card_transport_2']
  },
  {
    id: 'folder_actions_conso',
    title: 'Consommation',
    child_ids: ['card_conso_1', 'card_conso_2']
  }
];

// Fonction pour mettre à jour un dossier
async function updateFolder(folder) {
  try {
    console.log(`Mise à jour du dossier ${folder.id} (${folder.title})...`);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/cards?sequential_id=eq.${folder.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        child_ids: folder.child_ids,
        updated_at: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }
    
    console.log(`✅ Dossier ${folder.id} mis à jour avec succès avec ${folder.child_ids.length} enfants`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour du dossier ${folder.id}:`, error.message);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('Début de la mise à jour directe des dossiers...');
  
  let successCount = 0;
  let errorCount = 0;
  
  // Mettre à jour chaque dossier
  for (const folder of folderStructure) {
    const success = await updateFolder(folder);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log(`\nMise à jour terminée: ${successCount} dossiers mis à jour avec succès, ${errorCount} erreurs`);
}

// Exécuter le script
main().catch(error => {
  console.error('Erreur non gérée:', error);
  process.exit(1);
});
