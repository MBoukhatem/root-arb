# Agent #04 — UX/UI Designer — Round 1

## 1. Décisions et améliorations UX-UI

1. **Plancher typographique arabe.** Amiri devient illisible sous 18px. Imposer 20px min en arabe inline, 24px (`text-2xl`) pour les mots dérivés dans RootTree, `text-6xl/7xl` réservés à la racine centrale. `line-height: 1.8`, `font-feature-settings: "kern","liga"`, fallback `Noto Naskh Arabic` pour diacritiques propres.

2. **Onboarding "premier wow" sans inscription.** Le saut Landing → Register est brutal. Parcours invité : démo ك-ت-ب sur la landing, CTA "essaie ta première racine" ouvrant `/roots/:id`, puis prompt non-bloquant après 2-3 racines ("Sauvegarde ta progression — 20s"). Démontre la valeur avant le formulaire.

3. **Couleurs sémantiques light/dark.** Les 8 couleurs catégorielles restent identitaires mais nécessitent un override `--cat-*-on-dark` désaturé ~15% (neon burn sur `#0a0a0f`). `--cat-adjective #f59e0b` échoue AA en texte sur fond clair → variante texte `#b45309`, fill graphique `#f59e0b` conservé. Distinguer palette **"ink"** (textes) et **"fill"** (graphiques).

4. **Usage strict de `#e23923` (erreur CDC).** Cantonner aux erreurs **destructives/bloquantes** : validation Joi, 401/403, suppression. **Jamais** sur le bouton "raté" du LearningSession (utiliser `--warning` ambre) — sinon l'échec d'apprentissage est associé à une erreur système, démotivant.

5. **RootTree responsive hybride.** `<sm` arbre vertical hiérarchique scrollable, `sm-md` radial compact + pagination par catégorie, `lg+` radial complet. `touch-action: pan-x pan-y` pour pinch-to-zoom natif.

6. **Sidebar adaptative.** Drawer mobile, **collapsible icon-only 64px entre 1024-1280px**, full 280px au-delà — préserve le canvas D3 sur laptops 13".

7. **États vides illustrés.** `/constellation` vide → illustration grisée + CTA "Apprends ta première racine". `/learn` sans révision → écran positif "Tout est à jour, voici 5 suggestions". `/notes` vide → exemple mnémonique pré-écrit.

8. **Focus states clavier.** `:focus-visible` ring 2px `--primary` offset 2px sur tous interactifs, **nodes D3 inclus** (`tabindex="0"` + outline SVG).

## 2. Risques expérience utilisateur

1. **Overload d'animations** (transitions, stagger, déploiement, rotation, confettis, countup, shimmer) : surcharge cognitive, risque vestibulaire. Respecter `prefers-reduced-motion`, rotation continue opt-in.
2. **Contraste WCAG AA dark mode** : `--text-muted #9ca3af` sur `--bg-card #1a1a2e` ≈ 5.2:1, insuffisant pour `text-xs`. Audit Lighthouse + axe-core obligatoire.
3. **Triple visualisation D3** (RootTree, Constellation, Pattern) sans métaphore commune désoriente un débutant.
4. **`/explore` public illimité** : consommation sans conversion. Limiter à N racines/jour invité.
5. **Amiri en RTL + UI mixte FR/AR** : décalages baseline et césures dans tooltips bilingues. Tester Firefox/Safari.

## 3. Questions aux autres agents

- **Frontend Architect (#03)** : Le `ThemeContext` expose-t-il les couleurs sémantiques en CSS variables exploitables côté D3 (`getPropertyValue('--cat-verb')`) ? Sinon je propose un hook `useDesignTokens()`.
- **D3 Specialist (#05)** : Mode "lite" RootTree (sans rotation/force simulation) auto-injecté sur `prefers-reduced-motion` ? Événement `onNodeFocus` clavier ?
- **i18n/Accessibilité (#08)** : La sidebar 280px bascule-t-elle à droite en mode arabe ? Les icônes Lucide directionnelles (`ChevronRight` → `ChevronLeft`) sont-elles miroitées automatiquement ?

## 4. Recommandations actionnables

1. **`design-tokens.json` source unique** consommée par Tailwind config + D3 + Storybook.
2. **Route admin `/styleguide`** listant tous les composants en light/dark + RTL.
3. **Audit axe-core en CI frontend** (cible 0 violation critique).
4. **Prototype Figma** des 3 états RootTree (mobile/tablet/desktop) avant code D3.
5. **Standardiser** : modales pour actions destructives et formulaires courts ; panneau latéral droit 420px pour détails contextuels (clic mot dans RootTree).
6. Activer `prefers-color-scheme` avant lecture `localStorage` pour éviter le flash light → dark au boot.
