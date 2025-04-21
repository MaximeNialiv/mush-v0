# Scripts Mush

Ce dossier contient des scripts utiles pour la configuration et la maintenance de l'application Mush.

## Fonction d'incrémentation des points utilisateur

Le fichier `create_increment_points_function.sql` contient une fonction SQL qui permet d'incrémenter les points d'un utilisateur de manière atomique. Cette approche est plus efficace et plus sûre que de faire deux requêtes séparées (lecture puis mise à jour).

### Comment installer la fonction dans Supabase

1. Connectez-vous à votre projet Supabase
2. Allez dans la section "SQL Editor"
3. Créez une nouvelle requête
4. Copiez-collez le contenu du fichier `create_increment_points_function.sql`
5. Exécutez la requête

### Utilisation de la fonction

La fonction peut être appelée depuis le code client comme ceci :

```typescript
const { data, error } = await supabase.rpc('increment_user_points', {
  user_auth_id: userId,
  points_to_add: pointsToAdd
})

if (error) {
  console.error("Erreur lors de la mise à jour des points:", error)
} else {
  console.log("Nouveau total de points:", data)
}
```

La fonction retourne le nouveau total de points après l'incrémentation.

## Avantages de cette approche

- **Atomicité** : La mise à jour est effectuée en une seule opération, ce qui évite les problèmes de concurrence.
- **Performance** : Une seule requête au lieu de deux (select puis update).
- **Sécurité** : La fonction est définie avec `SECURITY DEFINER`, ce qui signifie qu'elle s'exécute avec les privilèges de l'utilisateur qui l'a créée, et non avec ceux de l'utilisateur qui l'appelle.
