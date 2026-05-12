# Agent 08 — Audit Responsive & Accessibilité WCAG AA

Branche `rush` — scope: `client/src/shared/{layout,ui}`, `client/src/styles/*`, pages.

## Verdict global

**REQUEST CHANGES** — focus-visible ring global présent et tokens light/dark conformes AA, mais lacunes critiques : skip link absent, hamburger sous-dimensionné (36×36), Modal non `aria-labelledby`, sidebar drawer sans piégeage focus/Esc.

## Findings (17)

### CRITICAL

**[CRITICAL] Skip link "Skip to main content" absent**
File: `client/src/shared/layout/AppLayout.tsx:13-22`, `PublicLayout.tsx:8-15`
Confidence: HIGH
Issue: WCAG 2.4.1 (Bypass Blocks) requise. `#main` reçoit `tabindex`/`outline:none` (globals.css:99) mais aucun `<a href="#main">` rendu en premier focusable.
Fix: ajouter dans chaque layout `<a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 …">{t('common:skipToContent')}</a>` ; ajouter `tabIndex={-1}` sur `<main id="main">`.

**[CRITICAL] Modal n'expose pas `aria-labelledby`**
File: `client/src/shared/ui/Modal.tsx:89-103`
Confidence: HIGH
Issue: `aria-label={title}` ne lie pas le `<h2>` au dialog ; lecteurs d'écran annoncent le texte brut sans relation. WCAG 1.3.1 / ARIA APG dialog pattern.
Fix: générer `useId()`, mettre `id` sur le `<h2>` (l.103) et `aria-labelledby={id}` sur le dialog. Retirer `aria-label`.

### HIGH

**[HIGH] Hamburger 36×36 — touch target sous 44×44**
File: `client/src/shared/layout/Navbar.tsx:43-50`
Confidence: HIGH
Issue: `h-9 w-9` = 36px. WCAG 2.5.5 / 2.5.8 (min 24, AAA 44). iOS HIG 44pt.
Fix: `h-11 w-11 min-h-11 min-w-11` sur mobile (ou padding équivalent).

**[HIGH] Sidebar drawer sans piégeage focus ni Esc-close**
File: `client/src/shared/layout/Sidebar.tsx:41-77`, `AppLayout.tsx:11-22`
Confidence: HIGH
Issue: ouverture en `fixed` mobile sans `aria-modal`, sans focus-trap, sans listener Escape, sans `inert`/`aria-hidden` sur le `<main>`. Tab continue derrière le backdrop.
Fix: emballer dans Headless UI `Dialog` ou cloner la logique de `Modal.tsx`. Ajouter `aria-modal="true"`, `role="dialog"`, focus initial sur premier item, Esc → `onClose`.

**[HIGH] Backdrop sidebar = `<button>` mais nav non bloquante derrière**
File: `client/src/shared/layout/Sidebar.tsx:48-53`
Confidence: HIGH
Issue: le backdrop est un `<button>` plein écran à `z-30`, mais l'aside est `z-40` ; sur mobile la `<main>` n'est pas masquée aux AT.
Fix: ajouter `aria-hidden="true"` sur `<main>` quand `sidebarOpen`, ou utiliser l'attribut `inert`.

**[HIGH] ConfirmDialog Modal `title` requis pour aria — passe une chaîne, pas un id**
File: `client/src/shared/ui/Modal.tsx:91`
Confidence: HIGH (lié au CRITICAL ci-dessus)
Issue: même cause racine — la régression visible se voit dans `ConfirmDialog.tsx:33`.
Fix: voir Modal aria-labelledby.

**[HIGH] Token `--gold` light = `#92400e` annoncé "titres ≥24px" mais utilisé sur étoile 14px**
File: `client/src/shared/ui/RootCard.tsx:44`, `tokens.css:53`
Confidence: HIGH
Issue: icône 14×14 dorée sur fond `--bg-card` (#f5f5f4) ; ratio ~5.1:1 ok pour texte, mais l'icône est non-textuelle 14px — WCAG 1.4.11 (non-text contrast 3:1) ok, mais le commentaire token est violé → risque dérive.
Fix: utiliser `--cat-adjective-ink` (#b45309) ou ajouter taille minimum dans la convention, et `aria-hidden` (actuellement `aria-label` correct).

### MEDIUM

**[MEDIUM] ThemeToggle / LanguageSelector / Avatar = 36×36**
File: `Navbar.tsx:74-86`, `LanguageSelector.tsx:38-48`, `ThemeToggle.tsx:10-18`
Confidence: HIGH
Fix: `h-11 w-11` mobile via `md:h-9 md:w-9` ou padding tactile.

**[MEDIUM] Modal pleine largeur mobile mais `p-4` backdrop crée bords étroits ; pas de variante full-screen mobile**
File: `Modal.tsx:83, 96-99`
Confidence: MEDIUM
Fix: `sm:max-w-md` ; sur `<sm` retirer `p-4` du backdrop et passer dialog en `rounded-none h-full max-h-screen`.

**[MEDIUM] Pagination boutons `h-9 min-w-9` (36×36) sur mobile**
File: `Pagination.tsx:47-80`
Confidence: HIGH
Fix: `h-11 min-w-11 sm:h-9 sm:min-w-9`.

**[MEDIUM] Navbar menu utilisateur sans navigation clavier (Arrow/Home/End) ni Esc**
File: `Navbar.tsx:73-115`
Confidence: HIGH
Issue: `aria-haspopup="menu"` + `role="menu"` annoncés mais flèches/Escape non câblés (cf LanguageSelector qui a Esc).
Fix: ajouter handler `keydown` Escape + ArrowDown/Up sur items.

**[MEDIUM] LandingPage section `<main id="main">` mais layout PublicLayout monte déjà `<main id="main">` → doublon id**
File: `pages/LandingPage.tsx:21` vs `PublicLayout.tsx:11`
Confidence: HIGH
Fix: retirer `id="main"` ligne 21, garder un seul.

**[MEDIUM] `transition-colors` body & boutons ignorent `prefers-reduced-motion` couleur — OK ; mais `motion-safe` cité dans Modal.tsx:26 inexistant — Framer Motion `<motion.div>` ignore le media query**
File: `Modal.tsx:75-95`
Confidence: MEDIUM
Issue: `globals.css:68-77` neutralise `animation`/`transition` CSS mais pas les keyframes Framer Motion JS. Le commentaire est faux.
Fix: utiliser `useReducedMotion()` de framer-motion et conditionner `initial/animate/exit`.

**[MEDIUM] SearchBar input n'a pas de `<label>` visible/associé**
File: `SearchBar.tsx:61-68`
Confidence: HIGH
Issue: seul `aria-label`. Acceptable pour AT mais pas pour utilisateurs cognitifs.
Fix: ajouter `<label htmlFor>` sr-only OK ; déjà presque conforme.

### LOW

**[LOW] LandingPage: aucun container Tailwind `container mx-auto`, `max-w-5xl` répété 4 fois**
File: `pages/LandingPage.tsx:23,59,85,104`
Fix: extraire `<Section>` wrapper.

**[LOW] Navbar `h-14` (56px) — conforme borne basse ; OK**
File: `Navbar.tsx:41`
Confidence: HIGH
Observation positive.

**[LOW] `index.html` lang="fr" statique — non synchronisé avec `LanguageContext`**
File: `client/index.html:2`
Fix: brancher un effet qui set `document.documentElement.lang` + `dir` au changement.

## Observations positives

- Tokens `tokens.css` : `text-primary` 15.8:1, `text-secondary` 9.6:1, `text-muted` 5.7:1 → tous AA/AAA.
- `*:focus-visible` global ring 2px bleu (globals.css:61-65) — excellente baseline.
- Modal a focus-trap + Esc + autofocus (Modal.tsx:32-70).
- Propriétés logiques (`ms-/me-/ps-/pe-/start-/end-`) systématiques → RTL solide.
- Pagination `aria-current="page"`, `aria-label="pagination"` corrects.
- `prefers-reduced-motion` couvert côté CSS et hook `useReducedMotion` réutilisable.
- Sidebar liens `end={to === '/dashboard'}` évite faux-positifs `isActive`.

## Recommandation

**REQUEST CHANGES** — corriger CRITICAL (skip link, Modal aria-labelledby) avant merge ; HIGH (touch targets, sidebar drawer a11y) dans la même PR si possible.
