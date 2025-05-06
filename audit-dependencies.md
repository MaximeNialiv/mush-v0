# Audit des dépendances Mush v0

## Composants Radix UI utilisés activement

Après analyse du code, voici les composants Radix UI qui sont activement utilisés dans l'application :

1. **Dialog** - Utilisé pour les modales d'authentification et autres dialogues
2. **Label** - Utilisé dans les formulaires et l'authentification
3. **Checkbox** - Utilisé dans les formulaires d'authentification
4. **Tabs** - Utilisé dans la modale d'authentification
5. **Separator** - Utilisé dans la barre latérale
6. **Sheet** - Utilisé pour les panneaux latéraux
7. **Tooltip** - Utilisé pour les infobulles dans la barre latérale
8. **Toast** - Utilisé pour les notifications

## Composants Radix UI potentiellement inutilisés

Ces composants sont définis dans `/components/ui/` mais ne semblent pas être importés ailleurs dans l'application :

1. **Accordion** - `@radix-ui/react-accordion`
2. **Alert Dialog** - `@radix-ui/react-alert-dialog`
3. **Aspect Ratio** - `@radix-ui/react-aspect-ratio`
4. **Avatar** - `@radix-ui/react-avatar`
5. **Collapsible** - `@radix-ui/react-collapsible`
6. **Dropdown Menu** - `@radix-ui/react-dropdown-menu`
7. **Radio Group** - `@radix-ui/react-radio-group`
8. **Scroll Area** - `@radix-ui/react-scroll-area`
9. **Select** - `@radix-ui/react-select`
10. **Switch** - `@radix-ui/react-switch`

## Recommandations

### Dépendances à conserver

Ces dépendances sont essentielles et doivent être conservées :

```json
{
  "@radix-ui/react-dialog": "^1.1.7",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-checkbox": "^1.1.5",
  "@radix-ui/react-tabs": "^1.1.4",
  "@radix-ui/react-separator": "^1.1.4",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-toast": "^1.2.11",
  "@radix-ui/react-tooltip": "^1.2.4"
}
```

### Dépendances à évaluer pour suppression

Ces dépendances pourraient être supprimées si elles ne sont pas utilisées dans des parties de l'application qui n'ont pas été détectées par l'analyse statique :

```json
{
  "@radix-ui/react-accordion": "^1.2.8",
  "@radix-ui/react-alert-dialog": "^1.1.11",
  "@radix-ui/react-aspect-ratio": "^1.1.4",
  "@radix-ui/react-avatar": "^1.0.4",
  "@radix-ui/react-collapsible": "^1.1.8",
  "@radix-ui/react-context-menu": "^2.2.12",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-hover-card": "^1.0.7",
  "@radix-ui/react-menubar": "^1.1.12",
  "@radix-ui/react-navigation-menu": "^1.2.10",
  "@radix-ui/react-popover": "^1.1.11",
  "@radix-ui/react-progress": "^1.1.4",
  "@radix-ui/react-radio-group": "^1.1.3",
  "@radix-ui/react-scroll-area": "^1.2.6",
  "@radix-ui/react-select": "^2.2.2",
  "@radix-ui/react-slider": "^1.3.2",
  "@radix-ui/react-switch": "^1.2.2",
  "@radix-ui/react-toggle-group": "^1.1.7"
}
```

## Plan d'action

1. **Phase 1 (Immédiate)** : Supprimer les dépendances clairement inutilisées
2. **Phase 2 (Test)** : Tester l'application après suppression pour s'assurer qu'aucune fonctionnalité n'est cassée
3. **Phase 3 (Migration progressive)** : Remplacer progressivement les composants Radix UI restants par des alternatives Tailwind plus légères

## Alternatives Tailwind

Pour les composants essentiels, des alternatives basées uniquement sur Tailwind pourraient être développées :

1. **Dialog** → Composant modal Tailwind personnalisé
2. **Tabs** → Composant d'onglets Tailwind personnalisé
3. **Toast** → Système de notification basé sur Tailwind

Cette approche permettrait de réduire considérablement la taille du bundle JavaScript tout en maintenant une expérience utilisateur cohérente.
