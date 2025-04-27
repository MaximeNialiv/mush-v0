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

- **Vue Simplifiée des Cartes**:
   - Affichage en grille des cartes du dossier actuel
   - Interface simple et directe pour la navigation
   - Optimisée pour la lisibilité et l'accès rapide aux contenus

- **Fil d'Ariane (Breadcrumb)**:
   - Affiche le chemin complet jusqu'au dossier actuel
   - Permet une navigation rapide vers les niveaux supérieurs
   - N'affiche pas "ROOT" dans le chemin

- **Bouton "Ouvrir le dossier"**:
   - Affiché sur toutes les cartes ayant des enfants (child_ids)
   - Remplace le comportement de clic sur la carte
   - Design cohérent avec les boutons de quiz

### Gestion de la Racine (ROOT)

- **Affichage à la Racine**:
   - Affiche toutes les cartes dont `parent_id` est `NULL` ou `"ROOT"`
   - Compatibilité avec les anciennes et nouvelles cartes
   - Pas besoin de migration de données

- **URLs Simplifiées**:
   - Format d'URL: `/{folderId}` au lieu de `/folders/{folderId}`
   - URL racine (`/`) affiche toutes les cartes de premier niveau
   - Navigation directe et propre

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

## Monitoring des Erreurs avec Sentry

### Configuration

1. **Installation et Configuration**:
   - Package installé: `@sentry/nextjs`
   - Fichiers de configuration: `sentry.client.config.js`, `sentry.server.config.ts`, `sentry.edge.config.ts`
   - Variable d'environnement requise: `NEXT_PUBLIC_SENTRY_DSN` dans `.env.local`

2. **Composants et Utilitaires**:
   - `ErrorBoundary`: Composant React pour capturer les erreurs non gérées
   - `utils/error-logging.ts`: Utilitaire pour envoyer des erreurs et messages à Sentry
   - Intégration dans les hooks critiques comme `use-folder-navigation.ts`

3. **Bonnes Pratiques**:
   - Capturer les erreurs dans les blocs try/catch avec `ErrorLogging.captureError`
   - Ajouter du contexte aux erreurs (emplacement, identifiants, etc.)
   - Envelopper les composants principaux avec `ErrorBoundary`
   - Éviter d'exposer les erreurs techniques aux utilisateurs

### Déploiement et Source Maps

1. **Configuration Vercel**:
   - Source maps automatiquement générés et envoyés à Sentry
   - Intégration avec le processus de build Vercel

2. **Recommandations**:
   - Considérer le déplacement de la configuration client vers `instrumentation-client.ts` pour la compatibilité future avec Turbopack
   - Vérifier régulièrement le tableau de bord Sentry pour les erreurs

## TypeScript et Bonnes Pratiques de Typage

### Prévention des Erreurs de Build

1. **Typage Explicite des Props**:
   - Toujours définir des interfaces pour les props des composants
   - Exemple: `interface ComposeBoxProps { onTweet: (tweet: string) => void }`

2. **Gestion des Types Partiels**:
   - Utiliser `Partial<Type>` pour les objets incomplets
   - Ajouter des type assertions (`as Type`) uniquement lorsque nécessaire
   - Exemple: `const filteredFolders = filterFolders(data) as CardWithContent[]`

3. **Événements React**:
   - Typer explicitement les événements: `React.FormEvent<HTMLFormElement>`
   - Importer React même avec les imports nommés: `import React, { useState } from "react"`

4. **Vérification Avant Déploiement**:
   - Exécuter `next build` localement pour détecter les erreurs TypeScript
   - Corriger toutes les erreurs de typage avant de pousser vers la branche de déploiement
   - Vérifier que toutes les propriétés utilisées dans les composants sont correctement typées
   - Ajouter des vérifications de nullité/undefined avant d'utiliser des propriétés potentiellement absentes

## Gestion des Dépendances et Déploiement

### Bonnes Pratiques pour les Dépendances

1. **Cohérence des Packages**:
   - S'assurer que toutes les dépendances utilisées dans le code sont listées dans `package.json`
   - Vérifier que les imports correspondent à des packages installés
   - Éviter d'utiliser des fonctionnalités de packages qui ne sont pas encore disponibles dans la version installée

2. **Résolution des Erreurs de Build**:
   - Erreur `Cannot find module 'X'`: Installer le package manquant avec `npm install X`
   - Erreur `Property 'X' does not exist on type 'Y'`: Ajouter la propriété au type ou vérifier son existence avant utilisation
   - Erreur `Attempted import error`: Vérifier que l'import correspond à ce qui est exporté par le package
   - Pour les composants UI basés sur Radix UI, s'assurer que tous les packages `@radix-ui/react-*` nécessaires sont installés

3. **Gestion des Composants UI**:
   - **Radix UI**: L'application utilise plusieurs composants Radix UI, chacun nécessitant son propre package:
     - `@radix-ui/react-accordion` pour `accordion.tsx`
     - `@radix-ui/react-alert-dialog` pour `alert-dialog.tsx`
     - `@radix-ui/react-aspect-ratio` pour `aspect-ratio.tsx`
     - `@radix-ui/react-avatar` pour `avatar.tsx`
     - `@radix-ui/react-checkbox` pour `checkbox.tsx`
     - `@radix-ui/react-collapsible` pour `collapsible.tsx`
     - `@radix-ui/react-context-menu` pour `context-menu.tsx`
     - `@radix-ui/react-dialog` pour `dialog.tsx`
     - `@radix-ui/react-dropdown-menu` pour `dropdown-menu.tsx`
     - `@radix-ui/react-hover-card` pour `hover-card.tsx`
     - `@radix-ui/react-label` pour `label.tsx`
     - `@radix-ui/react-menubar` pour `menubar.tsx`
     - `@radix-ui/react-navigation-menu` pour `navigation-menu.tsx`
     - `@radix-ui/react-popover` pour `popover.tsx`
     - `@radix-ui/react-progress` pour `progress.tsx`
     - `@radix-ui/react-radio-group` pour `radio-group.tsx`
     - `@radix-ui/react-scroll-area` pour `scroll-area.tsx`
     - `@radix-ui/react-select` pour `select.tsx`
     - `@radix-ui/react-separator` pour `separator.tsx`
     - `@radix-ui/react-slider` pour `slider.tsx`
     - `@radix-ui/react-slot` pour `slot.tsx`
     - `@radix-ui/react-switch` pour `switch.tsx`
     - `@radix-ui/react-tabs` pour `tabs.tsx`
     - `@radix-ui/react-toast` pour `toast.tsx`
     - `@radix-ui/react-toggle-group` pour `toggle-group.tsx`
     - `@radix-ui/react-tooltip` pour `tooltip.tsx`
   
   - **Autres bibliothèques UI**:
     - `react-day-picker` (v9.6.7) pour `calendar.tsx` - Nécessite une configuration spéciale pour les icônes (voir ci-dessous)
     - `embla-carousel-react` pour `carousel.tsx` - Bibliothèque de carrousel pour les interfaces de défilement
     - `recharts` pour `chart.tsx` - Bibliothèque de visualisation de données pour les graphiques
     - `next-themes` pour la gestion des thèmes clair/sombre

4. **Problèmes connus et solutions**:
   - **Problème avec `react-day-picker` v9.6.7**: Le composant Calendar peut rencontrer une erreur de typage avec les propriétés `IconLeft` et `IconRight`. Solution:
     ```tsx
     // Importer DayPickerProps
     import { DayPicker, DayPickerProps } from "react-day-picker"
     
     // Utiliser une assertion de type pour contourner les vérifications strictes
     components={{
       IconLeft: ({
         className,
         ...props
       }: {
         className?: string
         props?: React.SVGProps<SVGSVGElement>
       }) => <ChevronLeft className="h-4 w-4" {...props} />,
       IconRight: ({
         className,
         ...props
       }: {
         className?: string
         props?: React.SVGProps<SVGSVGElement>
       }) => <ChevronRight className="h-4 w-4" {...props} />
     } as unknown as Partial<DayPickerProps["components"]>}
     ```
   
   - **Vérification avant déploiement**: Exécuter `next build` localement pour détecter les erreurs de dépendances manquantes ou de typage avant de pousser vers la branche de déploiement
     - `@radix-ui/react-radio-group` pour `radio-group.tsx`
     - `@radix-ui/react-scroll-area` pour `scroll-area.tsx`
     - `@radix-ui/react-slot` pour plusieurs composants
     - `@radix-ui/react-tabs` pour `tabs.tsx`
   - **Autres bibliothèques UI**:
     - `react-day-picker` pour `calendar.tsx`
     - `cmdk` pour `command.tsx`

4. **Procédure de Résolution des Erreurs de Dépendances**:
   - Surveiller les logs de build Vercel pour identifier les packages manquants
   - Examiner le composant qui génère l'erreur pour comprendre son fonctionnement
   - Installer le package manquant avec `npm install [package-name]`
   - Committer et pousser les modifications de `package.json` et `package-lock.json`
   - Vérifier que le build Vercel réussit ou identifier la prochaine erreur

5. **Gestion des Versions**:
   - Utiliser des versions spécifiques dans `package.json` pour éviter les incompatibilités
   - Tester les mises à jour de packages localement avant de les déployer
   - Documenter les dépendances critiques et leurs fonctionnalités

6. **Configuration Vercel**:
   - Vérifier que toutes les variables d'environnement nécessaires sont configurées dans Vercel
   - Surveiller les logs de build pour détecter rapidement les problèmes
   - Surveiller les logs de build pour détecter les erreurs rapidement
   - Utiliser les prévisualisations de déploiement pour tester avant de fusionner dans la branche principale

## Composants UI

### Utilisation des Composants Radix UI

1. **Dépendances Requises**:
   - Tous les composants UI basés sur Radix UI nécessitent l'installation de leur package correspondant
   - Exemples : `@radix-ui/react-accordion`, `@radix-ui/react-dialog`, etc.
   - Toujours vérifier que le package est listé dans `package.json` avant d'utiliser un composant

2. **Structure des Composants**:
   - Les composants UI sont situés dans le dossier `components/ui/`
   - Chaque composant est généralement dans son propre fichier (ex: `accordion.tsx`, `dialog.tsx`)
   - Ces composants utilisent le pattern de composition pour créer des interfaces complexes

3. **Bonnes Pratiques**:
   - Utiliser les composants existants plutôt que d'en créer de nouveaux
   - Maintenir la cohérence du design en utilisant les mêmes composants à travers l'application
   - Tester les composants UI localement avant de déployer

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

- Menu contextuel pour chaque carte et dossier (trois points verticaux)
- Boîte de dialogue modale pour sélectionner le dossier de destination
- Mise à jour automatique de l'affichage après déplacement
- Procédure stockée SQL pour garantir la cohérence des données
- Prévention des cycles dans l'arborescence (pas de déplacement d'un dossier dans lui-même ou ses descendants)

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

### Procédures Stockées SQL

1. **Fonction move_card_to_folder**:
   - Procédure transactionnelle pour déplacer une carte entre dossiers
   - Mise à jour atomique du parent_id de la carte
   - Mise à jour atomique des child_ids des dossiers source et destination
   - Gestion des erreurs avec rollback automatique

2. **Transactions SQL**:
   - Fonctions begin_transaction, commit_transaction, rollback_transaction
   - Garantie de l'intégrité des données même en cas d'erreur
   - Prévention des incohérences entre parent_id et child_ids

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

4. **Design en Colonnes Style Finder Mac**:
   - Interface à trois colonnes pour une navigation intuitive
   - Colonne principale: liste des dossiers/cartes du dossier courant
   - Colonne secondaire: contenu du dossier sélectionné
   - Colonne d'aperçu: prévisualisation de la carte sélectionnée
   - Navigation fluide entre les colonnes avec sélection et aperçu

## Maintenance de la Cohérence des Données

### Intégrité Référentielle

1. **Double Référence parent_id et child_ids**:
   - Chaque carte a un seul parent_id (référence vers le haut)
   - Chaque dossier maintient une liste child_ids (références vers le bas)
   - Les deux références doivent être synchronisées lors des modifications

2. **Prévention des Cycles**:
   - Vérification récursive avant déplacement pour éviter les cycles
   - Fonction wouldCreateCycle pour valider les déplacements
   - Blocage des déplacements qui créeraient des cycles

3. **Migrations et Réparations**:
   - Script de migration SQL pour appliquer les procédures stockées
   - Fonction exec_sql pour exécuter du SQL dynamique
   - Possibilité de réparer les incohérences dans les données existantes

## Modifications Futures Envisagées

- Glisser-déposer pour réorganiser les cartes
- Recherche avancée dans la hiérarchie des cartes
- Gestion collaborative des cartes
- Filtrage et tri avancés
- Virtualisation des listes pour les dossiers contenant de nombreuses cartes
- Implémentation d'un système de préchargement intelligent

