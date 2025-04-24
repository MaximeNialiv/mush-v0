# Mush Application - Règles et Documentation

## Structure de l'Application

Mush est une application de cartes d'apprentissage avec une structure arborescente, permettant d'organiser les cartes en dossiers et sous-dossiers.

### Technologies Principales

- **Framework**: Next.js 15.2.4
- **Langage**: TypeScript
- **Base de données**: Supabase
- **Gestion d'état**: Jotai
- **Styles**: Tailwind CSS

## Modèle de Données

### Cartes (Cards)

- `sequential_id`: Identifiant unique de la carte
- `title`: Titre de la carte
- `description`: Description de la carte
- `type`: Type de carte ("card" ou "folder")
- `owner`: Propriétaire de la carte
- `content_ids`: IDs des contenus associés à cette carte
- `child_ids`: IDs des cartes enfants (pour les dossiers)
- `parent_id`: ID de la carte parent (pour la navigation)
- `created_at`: Date de création
- `updated_at`: Date de mise à jour

### Contenus (Contents)

- `sequential_id`: Identifiant unique du contenu
- `owner_ids`: Propriétaires du contenu
- `type`: Type de contenu (texte, image, quiz, etc.)
- `description`: Description du contenu
- `media_url`: URL du média associé
- `points`: Points attribués pour ce contenu
- `question`: Question du quiz
- `answer_1-4`: Réponses possibles
- `result_1-4`: Résultats associés aux réponses
- `correction_all`: Correction globale

### Relations Utilisateur-Contenu

- `sequential_id`: Identifiant unique de la relation
- `user_id`: ID de l'utilisateur
- `content_id`: ID du contenu
- `card_id`: ID de la carte
- `points`: Points gagnés
- `state`: État de la relation
- `created_at`: Date de création
- `last_view`: Dernière consultation

## Architecture de l'Arborescence de Cartes

### Principes de Conception

1. **Relation Parent-Enfant Simple**:
   - Chaque carte ne peut avoir qu'un seul parent
   - Simplifie la navigation et améliore les performances
   - Évite les conflits hiérarchiques complexes

2. **Gestion d'État avec Jotai et URL**:
   - Navigation basée sur les URL pour le partage direct
   - Utilisation de Jotai pour la gestion d'état global
   - Format d'URL: `/folders/{folderId}`

3. **Optimisation des Performances**:
   - Chargement à la demande des enfants directs du dossier actuel
   - Récupération minimale des données (titre, type, ID)
   - Mise en cache des données déjà chargées

### Structure de Navigation

- **Vue en Colonnes**:
   - Affichage multi-colonnes pour la navigation hiérarchique
   - Colonne principale pour le dossier actuel
   - Colonnes secondaires pour l'historique de navigation

- **Fil d'Ariane (Breadcrumb)**:
   - Affiche le chemin complet jusqu'au dossier actuel
   - Permet une navigation rapide vers les niveaux supérieurs

## Bonnes Pratiques de Développement

1. **Gestion d'État**:
   - Utiliser les atomes Jotai pour l'état global
   - Synchroniser l'état avec les URL pour le partage
   - Utiliser des hooks personnalisés pour encapsuler la logique d'état

2. **Chargement des Données**:
   - Implémenter le chargement à la demande
   - Mettre en cache les données déjà chargées
   - Éviter les requêtes redondantes
   - Utiliser sessionStorage pour le cache temporaire

3. **Interface Utilisateur**:
   - Concevoir pour différentes tailles d'écran
   - Fournir des retours visuels pour les actions utilisateur
   - Maintenir une cohérence visuelle avec le reste de l'application
   - Utiliser des transitions fluides pour améliorer l'UX

4. **Performance**:
   - Minimiser les transferts de données
   - Optimiser le rendu des composants avec useMemo et memo
   - Utiliser la virtualisation pour les grandes listes
   - Implémenter des stratégies de debounce pour les événements fréquents

## Gestion de Supabase

### Initialisation du Client

1. **Instance Unique**:
   - Toujours utiliser le hook `useSupabase()` fourni par le contexte pour accéder au client Supabase
   - Éviter de créer plusieurs instances de GoTrueClient qui peuvent causer des comportements indéfinis
   - Ne jamais importer directement `supabase` depuis `@/utils/supabase/client`

2. **Utilisation dans les Composants**:
   - Déclarer le client Supabase au début du composant: `const supabase = useSupabase()`
   - Ajouter le client Supabase aux dépendances des hooks useEffect et useCallback

3. **Utilisation dans les Hooks**:
   - Passer le client Supabase en paramètre aux fonctions utilitaires
   - Exemple: `fetchCards(supabase, folderId)` au lieu de `fetchCards(folderId)`

### Gestion des Erreurs

1. **Requêtes Robustes**:
   - Toujours vérifier les erreurs retournées par les requêtes Supabase
   - Utiliser `maybeSingle()` au lieu de `single()` pour éviter les erreurs quand aucun résultat n'est trouvé

2. **Authentification**:
   - Vérifier l'état d'authentification avant d'effectuer des requêtes qui nécessitent un utilisateur connecté
   - Gérer les erreurs 401 (Non autorisé) de manière appropriée

## Fonctionnalités de Gestion des Dossiers

### Création de Dossiers

- Interface utilisateur intuitive avec bouton "Nouveau dossier"
- Création de dossiers dans le dossier actuellement ouvert
- Formulaire simple pour nommer et décrire les dossiers

### Déplacement de Cartes et Dossiers

- Menu contextuel pour chaque carte et dossier
- Boîte de dialogue modale pour sélectionner le dossier de destination
- Mise à jour automatique de l'affichage après déplacement

### Suppression de Dossiers

- Option de suppression dans le menu contextuel
- Confirmation avant suppression pour éviter les erreurs
- Gestion des erreurs et feedback utilisateur

## Optimisations de Performance Implémentées

### Optimisation du Hook use-folder-navigation

1. **Mise en Cache Avancée**:
   - Utilisation de sessionStorage pour stocker les données de navigation
   - Mise en cache du fil d'Ariane avec horodatage pour éviter les recalculs inutiles
   - Vérification de la fraicheur des données (TTL de 5 minutes)

2. **Réduction des Requêtes**:
   - Utilisation de Map pour des recherches plus efficaces
   - Optimisation des mises à jour d'état avec des structures de données efficaces
   - Debounce des événements de navigation (150ms)

3. **Optimisation des Dépendances**:
   - Réorganisation des déclarations de fonctions pour éviter les références circulaires
   - Gestion optimisée des dépendances dans les useCallback

### Optimisation du Composant MoveCardDialog

1. **Mise en Cache des Dossiers**:
   - Stockage des dossiers disponibles dans sessionStorage
   - Vérification de la fraicheur des données avant de faire une nouvelle requête

2. **Optimisation des Requêtes**:
   - Sélection précise des champs nécessaires (sequential_id, title, type, child_ids)
   - Filtrage côté client pour éviter les cycles dans l'arborescence

3. **Expérience Utilisateur Améliorée**:
   - Mise à jour optimiste de l'interface
   - Invalidation intelligente du cache lors des modifications

### Optimisation du Composant FolderView

1. **Mémorisation des Composants**:
   - Utilisation de memo pour éviter les rendus inutiles des composants CardItem et FolderCard
   - Mémorisation du composant Breadcrumb

2. **Optimisation des Calculs**:
   - Utilisation de useMemo pour les opérations de filtrage
   - Mémorisation des gestionnaires d'événements avec useCallback

3. **Réduction des Rendus**:
   - Optimisation des dépendances dans les hooks
   - Création de gestionnaires d'événements mémorisés pour le fil d'Ariane

## Modifications Futures Envisagées

- Glisser-déposer pour réorganiser les cartes
- Recherche avancée dans la hiérarchie des cartes
- Gestion collaborative des cartes
- Filtrage et tri avancés
- Virtualisation des listes pour les dossiers contenant de nombreuses cartes
- Implémentation d'un système de préchargement intelligent

