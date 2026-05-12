# Audit Landing + RootTree demo

## Findings (severity high|medium|low)

1. **[high] Double `<main id="main">` imbriqués (a11y / HTML invalide)** — `client/src/shared/layout/PublicLayout.tsx:11` enveloppe déjà un `<main id="main">`, et `client/src/pages/LandingPage.tsx:21` en ouvre un second avec le même `id`. Deux `main` + id dupliqué cassent le skip-link et la sémantique. Correctif : remplacer le `<main>` de LandingPage par `<div>` (ou retirer le wrapper du PublicLayout).

2. **[high] Polices arabes en `font-display: optional`** — `client/src/styles/globals.css:12-13`. Avec `optional`, si Amiri/Noto Naskh n'est pas en cache au premier chargement, le navigateur n'attend pas et reste sur le fallback système — la promesse "tashkil lisible" tombe. Correctif : passer Amiri/Noto Naskh en `display=swap` ou self-host woff2 subset (déjà annoncé S6).

3. **[high] `<html lang="fr">` figé, jamais synchronisé avec i18n** — `client/index.html:2` reste `lang="fr"` même quand l'utilisateur passe en `en` ou en `ar` ; `dir` n'est jamais positionné à `rtl`. Conséquence : lecteurs d'écran lisent en français, et le bloc `html[dir=rtl]` de `globals.css:55` n'est jamais déclenché. Correctif : `useEffect` global qui set `document.documentElement.lang/dir` au montage i18n.

4. **[high] Tooltip mal positionné en pourcentage + viewBox** — `RootTree.tsx:301-304` calcule `left/top` en `%` du `viewBox` D3, mais le SVG est rendu en `preserveAspectRatio: xMidYMid meet` avec `height` non liée à la largeur réelle → en RTL ou sur viewport étroit, le tooltip dérive et sort de la carte. Correctif : convertir node.x/y en coords écran via `getScreenCTM()` ou utiliser un overlay HTML positionné sur le centre du nœud.

5. **[medium] Demo subtitle dupliqué** — `LandingPage.tsx:54` et `:91` affichent tous deux `t('landing:demoSubtitle')`. Hiérarchie diluée, le visiteur lit deux fois la même phrase. Correctif : sous le hero, remplacer par un micro-tagline distinct (ex. `landing:heroEyebrow`).

6. **[medium] Couleurs catégorielles mal mappées** — `client/src/shared/viz/RootTree/colors.ts:17-19` : `place → pluriel-brise`, `agent → derive`, `instrument → adverb`. Le contrat sémantique design (place/agent/instrument) est masqué par des tokens « pluriel brisé / adverbe / dérivé ». Correctif : créer des tokens `--cat-place-*`, `--cat-agent-*`, `--cat-instrument-*` ou renommer la map pour refléter l'intention.

7. **[medium] Dark mode : `--danger` et `--cat-*-fill` non redéfinis** — `tokens.css:101-129` ne ré-déclare ni `--danger`, ni les 8 `--cat-*-fill`. Conséquence : les anneaux/remplissages D3 restent identiques en dark, et sur `--bg-base:#0a0a0f` les fills `#3b82f6`/`#10b981` peuvent rester acceptables mais le commentaire annonce un choix volontaire — le ratio sur `fillOpacity 0.18` (RootTree.tsx:261) tombe sous 3:1 pour `noun` (#10b981 à 18% sur fond sombre). Correctif : ajouter une variante dark des fills ou monter `fillOpacity` à ≥0.3 en dark.

8. **[medium] Stagger d'apparition trop long pour 9 nœuds** — `RootTree.tsx:235` `delay: 0.15 + i*0.05` + animation links `+depth*0.05`. Total ≈ 0.6 s, OK ; mais sur racines à 20+ mots ailleurs cela atteindra 1.2 s. Correctif : plafonner via `Math.min(i, 10)` pour scale.

9. **[medium] `aria-label` mélange FR et variables non traduites** — `RootTree.tsx:139-142` fournit `defaultValue` en français codé en dur. Si `lang=en` et que la clé `common:root-tree-aria` est absente, l'utilisateur EN entend du français. Correctif : déplacer le defaultValue dans le bundle `en.json` ou supprimer le fallback codé.

10. **[medium] `<button>` Replay en absolu sans focus visible explicite** — `RootTree.tsx:150-157` : pas de classe `focus-visible:` ; le focus repose sur `*:focus-visible` global, mais le bouton est sur fond `--bg-card` collé contre la bordure — focus ring 2px à 2px offset peut être tronqué par `overflow` du parent `rounded-2xl`. Correctif : `focus-visible:ring-2 ring-(--focus-ring) ring-offset-2`.

11. **[low] `<ArabicText as="inline" unvocalized="ك ت ب">` avec contenu vocalisé `كَتَبَ`** — `LandingPage.tsx:51-53`. Le prop `unvocalized` (a11y/recherche) ne correspond pas au texte affiché (verbe au passé). Correctif : passer `unvocalized="كتب"` (consonnes du verbe) ou utiliser deux blocs distincts racine vs verbe.

12. **[low] Lien GitHub en placeholder** — `LandingPage.tsx:107` pointe vers `https://github.com` (racine, pas le repo). Correctif : URL réelle du dépôt ou retirer le lien tant que privé.

13. **[low] Texte transliteration `12px` sous le seuil de lisibilité** — `RootTree.tsx:282` `fontSize={12}` sur `--text-secondary`. WCAG recommande ≥14px pour corps non-héroïque. Correctif : passer à 13-14 et/ou densifier la couleur.

14. **[low] `viewBox.height` figée à 520 en mobile** — `RootTree.tsx:53-55` et 164 : le SVG garde 520 px de haut même quand le conteneur < 400 px de large, créant une zone vide en mobile portrait. Correctif : ajuster `height` au ratio (ex. `Math.min(size.width*1.1, 520)`).

15. **[low] `console.info` laissé en place pour la démo** — `LandingPage.tsx:17`. Bruit en prod. Correctif : ne logger que sous `import.meta.env.DEV` ou supprimer (les clics seront câblés au routing plus tard).

## Synthèse

≤ 50 mots : (1) **A11y/sémantique** : double `<main>` + `<html lang>` figé cassent skip-link et lecteurs d'écran. (2) **Polices arabes** en `font-display: optional` rendent le tashkil aléatoire. (3) **Tooltip RootTree** mal positionné (% sur viewBox) — dérive en RTL/mobile. À corriger en priorité avant toute revue visuelle fine.
