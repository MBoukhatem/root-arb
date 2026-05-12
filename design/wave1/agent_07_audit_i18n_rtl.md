# Agent 07 — Audit i18n (FR/EN/AR) + Direction RTL + Typo arabe

**Branche**: `rush` — **Scope**: `client/src/shared/i18n/**`, locales, composants `useTranslation`, `index.html`, styles arabes.
**Coverage**: FR 176 clés • EN 176 clés • AR 44 clés → **AR = 25,0 %** (132 clés manquantes sur 176).
**Verdict**: REQUEST CHANGES — 3 CRITICAL bloquent une UX AR cohérente.

## Findings

### F1 — [CRITICAL/HIGH] Couverture AR catastrophique : 25 %

`client/src/shared/i18n/locales/ar.json:1-54` ne couvre que `common`, `nav`, `auth` (partiel), `errors` (partiel). Manquent **132 clés** dans 7 namespaces (`roots`, `dashboard`, `learn`, `constellation`, `notes`, `collections`, `landing`) + 4 clés `auth` (`roleLabel`, `interfaceLanguage`, `preferredTheme`, `timezone`) + 2 clés `errors` (`networkError`, `validation`). En AR, l'utilisateur voit le code-clé brut (`roots.exploreTitle`) faute de fallback explicite.
**Fix**: ajouter les 132 entrées ou expliciter `fallbackLng: { ar: ['fr'], default: ['fr'] }` dans `i18n.ts:25` pour dégrader vers FR plutôt qu'afficher les clés.

### F2 — [CRITICAL] `<html lang="fr">` codé en dur, jamais sync au boot

`client/index.html:2` initialise `<html lang="fr">` sans `dir`. `LanguageContext.tsx:35-39` ne sync qu'au montage du provider ; pendant le FOUC initial (avant React), un AR détecté via `localStorage` rend en LTR + Inter. **Bug visible** au reload AR.
**Fix**: ajouter un script bloquant inline dans `index.html` qui lit `localStorage.art_lang` et pose `document.documentElement.lang/dir` avant `<script type="module">`.

### F3 — [HIGH] Tooltip Constellation hardcodé en EN

`client/src/shared/viz/Constellation/Constellation.tsx:394` : `<div>Mastery: {tooltip.node.masteryLevel}</div>` — string EN hardcodée, ignore i18n. Aria-label aussi : `Constellation.tsx:186,340` `aria-label="Constellation des racines"` (FR uniquement, jamais traduit).
**Fix**: `t('roots:mastery', { level })` + `t('constellation:title')` via `useTranslation`.

### F4 — [HIGH] Chaînes hardcodées dans labels accessibilité

- `LoadingSpinner.tsx:16` `aria-label="loading"` (EN)
- `Navbar.tsx:46` `aria-label="Toggle navigation"` (EN)
- `Sidebar.tsx:50` `aria-label="Close menu"` (EN)
- `Pagination.tsx:44` `aria-label="pagination"` (EN)
  Aucune ne passe par `t()`. NVDA/JAWS lit EN même en mode AR/FR.
  **Fix**: ajouter clés `common:loading`, `nav:toggle`, `nav:close`, `common:pagination` et utiliser `t()`.

### F5 — [HIGH] Namespace `auth` incomplet en AR

`ar.json:38-48` arrête `auth` à `has-account`. Les 4 clés `roleLabel|interfaceLanguage|preferredTheme|timezone` (utilisées par `ProfilePage.tsx`) renvoient la clé brute en AR.
**Fix**: compléter le bloc `auth` AR.

### F6 — [MEDIUM] Plurals AR absents (`_zero`, `_two`, `_few`, `_many`)

`fr.json:69-70,180-181` déclarent `_one/_other`. L'arabe ICU exige `zero/one/two/few/many/other`. `compatibilityJSON: 'v4'` est posé (`i18n.ts:42`) mais aucune entrée AR existe pour `wordsCount`/`rootsCount`. En AR, le pluriel sera erroné dès `count=2` (forme duel) ou 3-10 (`few`).
**Fix**: ajouter les 6 formes pour chaque clé `*_one/*_other` en AR.

### F7 — [MEDIUM] `i18n.ts` n'expose pas `debug:false` en prod

`i18n.ts:24-56` ne pose pas `debug`. i18next loggue verbeux en dev _et_ prod. Pas de garde `import.meta.env.PROD`.
**Fix**: `debug: !import.meta.env.PROD`.

### F8 — [MEDIUM] Ordre de détection ignore `?lng=` URL et `htmlTag` après nav

`i18n.ts:46-50` : `order: ['localStorage','navigator','htmlTag']`. Un deep-link `?lng=ar` n'est pas pris en compte (manque `'querystring'` en tête). `LanguageContext.tsx:42-52` écoute bien `languageChanged`, mais le détecteur ne le pose jamais sans `querystring`.
**Fix**: `order: ['querystring','localStorage','navigator','htmlTag']`.

### F9 — [MEDIUM] Bidi mixed non protégé dans labels FR+AR

`LandingPage.tsx:51-54` enchaîne `<ArabicText>كَتَبَ</ArabicText> + <span>{t('landing:demoSubtitle')}</span>` côte à côte sans isolation. En contexte RTL global, l'espace + ponctuation se réordonnent (problème classique UAX#9). Aucun usage de `dir="auto"`, `<bdi>` ou `⁨` (FSI).
**Fix**: wrapper le span FR dans `<bdi>` ou `dir="auto"` quand `isRTL`.

### F10 — [MEDIUM] Sous-utilisation Tailwind logical properties

73 occurrences `ms-/me-/ps-/pe-/start-/end-` vs **1** propriété physique (`ml-/mr-`). Bon ratio global, **mais** `Pagination.tsx:53,79` utilise `gap-1` (neutre OK) tandis que des classes physiques existent dans le bundle (à vérifier en CI via ESLint plugin RTL). Pas de variant `rtl:` détecté du tout — toute la stratégie repose sur les logical properties, OK mais documenter.
**Fix**: ajouter `eslint-plugin-tailwindcss` règle `no-arbitrary-side-properties` + section README "logical-first".

### F11 — [LOW] Police arabe via Google CDN non self-hostée

`globals.css:11-13` `@import` Amiri + Noto Naskh depuis `fonts.googleapis.com`. Privacy (CNIL), perf (RTT), offline KO. `display=optional` certes mais subset complet chargé.
**Fix**: prévu en S6 (cf. commentaire `globals.css:7`) ; ajouter ticket pour self-host woff2 subset.

### F12 — [LOW] AR coreMeaning : namespaces `roots`/`landing` AR vides malgré PLAN "AR-contenu NICE droppé"

PLAN dit que le **contenu** AR (sens, traductions) est droppé — mais l'UI chrome (`landing:heroTitle`, `roots:exploreTitle`) doit rester traduite. La situation actuelle confond les deux : le **chrome AR est aussi droppé**, ce qui dégrade l'UX bien au-delà du périmètre planifié.
**Fix**: clarifier dans le PLAN que NICE = contenu lexical, et compléter le chrome AR (cf. F1).

### F13 — [LOW] `RootTree.tsx:268` `fontFamily="var(--font-arabic-title)"` sans `lang`/`dir` sur `<text>`

SVG : `<text>` au niveau racine n'a que `lang="ar"` (ligne 270) mais pas `dir="rtl"`. Pour un mot isolé (3 lettres), OK ; pour des labels plus longs (titres, transliteration mixte) ça bidi-cassera.
**Fix**: ajouter `direction="rtl"` sur les `<text>` arabes.

### F14 — [INFO] Composant `ArabicText` correct

`ArabicText.tsx:50` impose bien `lang="ar"`, `dir="rtl"`, `aria-label` depuis `unvocalized`. Bonne pratique. Reste à activer la règle ESLint custom (S2) annoncée ligne 38 pour interdire les littéraux arabes hors `<ArabicText>`.

### Observations positives

- `DirectionalIcon.tsx` — wrapper logique propre, mapping prev/next centralisé.
- `useDirection.ts:logicalKey` — mappage ArrowLeft/Right correct selon `isRTL`.
- `tokens.css:58-59` — stack font arabe avec fallback système (`Segoe UI Arabic`, `Geeza Pro`).
- `globals.css:55-58` — switch `font-family + line-height` sur `html[dir='rtl']` propre.

## Résumé final (≤150 mots)

**Chemin**: `/home/mboukhatem/root-arb/design/wave1/agent_07_audit_i18n_rtl.md`.
**Couverture AR**: **25 % (44/176 clés)** — 132 chaînes manquantes dans 7 namespaces. L'utilisateur AR voit du code brut.
**Top 3 fixes**:

1. **F2** — Injecter un script inline dans `client/index.html` pour poser `<html lang/dir>` depuis `localStorage.art_lang` **avant** le bundle React (élimine le FOUC LTR au reload AR).
2. **F1** — Compléter `ar.json` (132 clés) ou poser `fallbackLng: ['fr']` explicite pour dégrader gracieusement plutôt qu'exposer les clés.
3. **F3/F4** — Externaliser les ~6 strings hardcodées (`Mastery:`, `aria-label="loading|pagination|Toggle…"`) via `t()` ; sinon NVDA lit l'EN même en AR/FR.

Bonus structurel: ajouter `querystring` en tête de détection (F8), `debug: !PROD` (F7), formes plurielles AR (F6), `dir="auto"`/`<bdi>` pour bidi mixed (F9), self-host fonts (F11). Le pipeline RTL technique (logical properties, `DirectionalIcon`, `useDirection`) est solide ; le problème est principalement la dette de traduction AR.
