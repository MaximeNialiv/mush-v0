// Script pour réparer les relations parent-enfant dans l'arborescence
// Exécuter avec: node scripts/repair-folder-relationships.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies');
  process.exit(1);
}

// Créer un client Supabase avec la clé de service pour les permissions admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function repairFolderRelationships() {
  try {
    console.log('Début de la réparation des relations parent-enfant...');

    // 1. Récupérer toutes les cartes avec leur parent_id
    const { data: allCards, error: fetchError } = await supabase
      .from('cards')
      .select('sequential_id, parent_id, child_ids, type');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Récupération de ${allCards.length} cartes terminée`);

    // 2. Créer un dictionnaire des dossiers et leurs enfants
    const folderChildMap = new Map();
    
    // Initialiser tous les dossiers avec un tableau vide
    allCards
      .filter(card => card.type === 'folder')
      .forEach(folder => {
        folderChildMap.set(folder.sequential_id, []);
      });

    // 3. Pour chaque carte avec un parent, ajouter son ID aux child_ids du parent
    allCards
      .filter(card => card.parent_id)
      .forEach(card => {
        const parentId = card.parent_id;
        if (folderChildMap.has(parentId)) {
          folderChildMap.get(parentId).push(card.sequential_id);
        } else {
          console.warn(`Attention: La carte ${card.sequential_id} a un parent_id ${parentId} qui n'existe pas ou n'est pas un dossier`);
        }
      });

    console.log('Calcul des relations parent-enfant terminé');

    // 4. Mettre à jour les child_ids de chaque dossier
    let updatedCount = 0;
    let errorCount = 0;

    for (const [folderId, childIds] of folderChildMap.entries()) {
      const folder = allCards.find(card => card.sequential_id === folderId);
      
      // Vérifier si les child_ids actuels sont différents des child_ids calculés
      const currentChildIds = folder.child_ids || [];
      const needsUpdate = JSON.stringify(currentChildIds.sort()) !== JSON.stringify(childIds.sort());
      
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('cards')
          .update({ 
            child_ids: childIds,
            updated_at: new Date().toISOString()
          })
          .eq('sequential_id', folderId);

        if (updateError) {
          console.error(`Erreur lors de la mise à jour du dossier ${folderId}:`, updateError);
          errorCount++;
        } else {
          updatedCount++;
          console.log(`Dossier ${folderId} mis à jour avec ${childIds.length} enfants`);
        }
      }
    }

    console.log(`Réparation terminée: ${updatedCount} dossiers mis à jour, ${errorCount} erreurs`);
    
    // 5. Vérification finale
    console.log('Vérification de la cohérence des données...');
    
    const { data: finalCheck, error: checkError } = await supabase
      .from('cards')
      .select('sequential_id, parent_id, child_ids, type')
      .eq('type', 'folder');
      
    if (checkError) {
      throw checkError;
    }
    
    let inconsistencies = 0;
    
    for (const folder of finalCheck) {
      const childIds = folder.child_ids || [];
      
      // Vérifier que tous les enfants ont bien ce dossier comme parent
      for (const childId of childIds) {
        const child = allCards.find(card => card.sequential_id === childId);
        
        if (!child) {
          console.warn(`Avertissement: L'enfant ${childId} du dossier ${folder.sequential_id} n'existe pas`);
          inconsistencies++;
          continue;
        }
        
        if (child.parent_id !== folder.sequential_id) {
          console.warn(`Incohérence: L'enfant ${childId} a pour parent ${child.parent_id || 'null'} au lieu de ${folder.sequential_id}`);
          inconsistencies++;
        }
      }
    }
    
    if (inconsistencies === 0) {
      console.log('Vérification terminée: Aucune incohérence détectée');
    } else {
      console.warn(`Vérification terminée: ${inconsistencies} incohérences détectées`);
      console.warn('Exécutez à nouveau ce script pour corriger ces incohérences');
    }
    
  } catch (error) {
    console.error('Erreur lors de la réparation des relations parent-enfant:', error);
    process.exit(1);
  }
}

// Exécuter la réparation
repairFolderRelationships();
