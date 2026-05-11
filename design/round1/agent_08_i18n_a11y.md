# Agent #08 — i18n & Accessibilité Specialist (RTL arabe)

## 1. Décisions i18n / a11y

1. **Namespaces par feature, nested 2 niveaux.** `common`, `auth`, `roots`, `tree`, `dashboard`, `enums`, `a11y`. Un seul `translation.json` × 3 langues est ingérable. Lazy-load via `i18next-http-backend` par route.

2. **Pluralisation arabe = 6 formes (`zero`, `one`, `two`, `few`, `many`, `other`)** via `Intl.PluralRules('ar')` + suffixes i18next (`compatibilityJSON: 'v4'`). Le brief l'ignore — à imposer dès le scaffold.

3. **Ajouter `.ar` partout dans le schéma BDD.** Le brief n'expose que `fr/en` sur `coreMeaning`, `translations`, `patternDescription`, `examples[].translation`. Une UI 100% AR sans glose AR est incohérente. `{ fr, en, ar? }` + fallback `ar → en → fr` API.

4. **Enums traduits côté front.** `semanticField` et `grammaticalCategory` restent clés anglaises en base ; `enums.json` par langue. Couleurs sémantiques constantes.

5. **`<html lang dir>` dynamique + CSS logical properties.** Bannir `ml-*`, `mr-*`, `left-*`, `right-*` au profit de `ms-*`, `me-*`, `start-*`, `end-*`. Stylelint `csstools/use-logical` bloquant.

6. **Polices arabes self-hosted.** Amiri `woff2` subsetté (U+0600–U+06FF + U+FE70–U+FEFF, ~80ko), `font-display: swap`, `<link rel="preload">` **conditionnel à `lang=ar`**. Pas de Google Fonts CDN (latence + RGPD).

7. **Contraste calligraphie dorée.** `--accent #d4a574` sur `#fafaf9` ≈ 2.1:1 → échec WCAG AA. Réserver aux titres ≥24px. Axe-core en CI bloquant.

8. **Screen reader + arabe vocalisé.** NVDA/JAWS butent sur les diacritiques. Pattern : `<span lang="ar" aria-label={arabicWordUnvocalized}>{arabicWord}</span>` via composant unique `<ArabicText>`.

## 2. Risques RTL / accessibilité

1. **D3 RootTree en RTL.** L'arbre radial est neutre, mais un layout horizontal `d3.tree()` doit inverser l'axe X. Labels arabes en SVG auto-LTR — forcer `direction: rtl` sur `<text>` et inverser `text-anchor` (start↔end). Risque de chevauchement arabe / translittération latine.

2. **Bidi mixte.** Sans `<bdi>` ou marqueurs `&lrm;/&rlm;`, la ponctuation latine se positionne mal : `"k-t-b (ك-ت-ب)"` devient visuellement `"(ك-ت-ب) k-t-b"`.

3. **Switch FR↔AR = CLS catastrophique** sans préchargement polices (FOIT/FOUT, perte de focus, Lighthouse <50).

4. **Navigation clavier D3 absente du brief.** SVG non focusable par défaut. Sans `tabindex="0"` + `role="treeitem"` + flèches clavier (inversées en RTL), arbre inaccessible → bloquant WCAG 2.1.1.

## 3. Questions aux autres agents

- **UX (#03)** : `LanguageSelector` permanent en header ou dans Settings ? Contraste doré `#fbbf24` sur dark cards `#1a1a2e` vérifié ?
- **Frontend (#04)** : `tailwindcss-rtl` ou logical properties natives ? Stratégie lazy-load namespaces par route ?
- **D3 (#05)** : inversion d'orientation prévue en RTL ? Gestion `text-anchor` arabe vs translittération ? Focus ring SVG ?
- **Data Engineer (#07)** : ajouter `.ar` sur `coreMeaning`, `translations`, `patternDescription`, `examples[].translation` ? Fallback API si `ar` manquant ?

## 4. Recommandations actionnables

1. **Scaffolder l'i18n dès semaine 1, pas semaine 6** comme prévu en "Polish UX" — erreur stratégique, dette la plus coûteuse à rattraper tardivement.
2. **Hook `useDirection()`** dérivé de `useLanguage()`, applique `dir` sur `<html>` + classe `rtl`/`ltr` sur `<body>`.
3. **Composant unique `<ArabicText vocalized unvocalized />`** : impose `lang="ar"`, `dir="rtl"`, `font-arabic`, `aria-label` non vocalisé. Bannir le texte arabe brut en code.
4. **Storybook + addon i18n + RTL toggle** : 3 langues × 2 directions × 2 thèmes par composant.
5. **CI bloquante axe-core + pa11y** sur les 3 langues. Test NVDA manuel en AR ≥1× avant démo.
6. **Priorité de langue** : `user.preferredInterfaceLanguage` (DB) > localStorage > `navigator.language` > `fr`.
