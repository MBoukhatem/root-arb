# Changelog Waves

Synthèse consolidée des trois vagues d'implémentation agentique (10 agents chacune). Pour les détails complets, consulter les fiches individuelles dans `design/wave{1,2,3}/`.

---

## Wave 1 — Audit + Validation Design (10 agents)

**Période** : S1 (design + spike)

**Délivrables** :

- **130+ findings** dans 10 audits complets (visuel, technique, QA, dataviz, i18n, a11y, responsive, data, architecture)
  - `agent_01_viz_architect.md` : critères d3 radial vs force-directed
  - `agent_02_data_planner.md` : pipeline extraction Quranic Corpus
  - `agent_03_audit_landing.md` : hero visuel, accessibilité landing
  - `agent_04_audit_explore_detail.md` : filtres, pagination, performance
  - `agent_05_audit_dashboard_learn.md` : SM-2 validation, streaks IANA
  - `agent_06_audit_constellation_notes.md` : XSS mitigation, Collections design
  - `agent_07_audit_i18n_rtl.md` : RTL technique, polices arabes
  - `agent_08_audit_responsive_a11y.md` : WCAG AA, mobile <375px
  - `agent_09_audit_tech.md` : DevOps, CI/CD, Vercel+Render
  - `agent_10_qa_functional.md` : test matrix, smoke tests

**Bugs CRITICAL identifiés** :

- RootTree layout non stable sous React 19 StrictMode
- SM-2 timezone-naive (nextReviewDate minuit UTC, pas user TZ)
- i18n AR droppée à 25% (NICE DROPPED)
- Collection.slug index global (conflit multi-user)

**Décisions design validées** :

- ConcentricLetters viz pour lettres co-occurrentes
- D3 hybride (React JSX + math pur, pas mutation directe DOM)
- sanitize-html allowlist backend

---

## Wave 2 — Implémentation Core (10 agents)

**Période** : S2-S4 (implémentation)

**Délivrables** : 61 fichiers modifiés/créés, 5 nouveaux endpoints, 4 nouveaux modèles/services, composant ConcentricLetters.

### Backend — SM-2 & Stats (agent_01)

- `progressService.js` : SM-2 réparé (rating mapping `failed|hard|good|perfect`, timezone-aware via date-fns-tz)
- `progressValidation.js` : Joi xor `rating` ou `success` (rétrocompat)
- `statsController.js` : dashboard étendu avec `weeklyActivity` heatmap
- `timezone.js` : helpers TZ (startOfDayInTz, addDaysInTz, toDateStringInTz)
- Dépendance : `date-fns-tz`
- **Tests curl** : 8/8 cas verts (rating mapping, streak, weekly activity)

### Backend — Letters API (agent_02)

- `lettersService.js` + `lettersController.js` + `lettersValidation.js` : nouveaux fichiers
- `GET /api/letters` : liste 28 lettres arabes + count par racine
- `GET /api/letters/:letter/cooccurrences?includeRoots=true` : co-occurrences avec optionnel sharedRootIds
- Performance : 19 ms local (Atlas M0 estimé <50 ms)
- Lettres absentes → 200 OK avec cooccurrences:[]
- **Typecheck** : zéro erreur

### Backend — Misc Fixes (agent_03)

1. `NOTE_TYPES` enrichi de `'personal'`
2. Collection.slug index converti en composite unique `{user, slug}`
3. `sanitize-html` activé dans `noteService.create/update` (tags autorisés : b, i, em, strong, p, br, ul, ol, li, code, blockquote)
4. Constellation fallback preview : racines essentielles à masteryLevel=0 si zéro progression
5. `/api/health/ready` → `{success:true, data:{status,db}}` standardisé

### Data — Seed +8 Racines (agent_04)

- **Racines ajoutées** : ج-ل-س, ن-ظ-ر, ف-ت-ح, خ-ر-ج, ذ-ه-ب, ص-ب-ر, ط-ل-ب, و-ز-ن
- **Mots ajoutés** : 40 nouveaux (5 par racine)
- **Total après Wave 2** : **16 racines + 87 mots** (de 8 + 47)
- **Couverture lettres** : 25/29 présentes (ا, ث, ض, غ absentes — rares pédagogiquement)
- **Viz exploitable** : 11 lettres avec ≥2 racines (exploitables pour ConcentricLetters)
- **Validation** : curl 16 racines confirmées en base, 0 erreurs Joi

### Frontend — ConcentricLetters Viz (agent_05)

- **Fichiers créés** : 8 nouveaux (types, colors, useConcentricLayout, ConcentricLetters.tsx, lettersApi, hooks, LettersPage)
- **1 035 lignes** réparties en couches (types → colors → layout-hook → composant → hooks API → page)
- **Layout algorithm** : angulaire équidistant, tri fréquence, 2-3 anneaux adaptatifs, rayon log-scale
- **Palette oklch** : light/dark cohérente avec design tokens existants
- **Animations** : Framer Motion layoutId swap fluide, stagger par anneau, reduced-motion compatible
- **Page** `/letters` (publique) : picker 28 lettres, stats bar, viz, side panel racines partagées
- **Typecheck** : zéro erreur

### Frontend — Pages (agents_06, 07, 08)

- **Landing + Explore** : 100% i18n AR sync
- **Dashboard + Learn** : stats Widget, SM-2 visuel (rating buttons), streak counter
- **Constellation + Notes + Collections** : CRUD complètes, XSS mitigé

### i18n — AR Complète (agent_09)

- **Avant** : 44 clés AR (25% couverture)
- **Après** : 188 clés AR (~100% couverture vs FR 176 clés)
- **Namespaces ajoutés** : roots, dashboard, learn, constellation, notes, collections, landing
- **Pluriels ICU** : 6 formes AR (zero, one, two, few, many, other)
- **Pre-paint sync** : script inline `<head>` pose `<html lang dir>` avant parse CSS (anti-FOUC RTL)
- **Aria-labels** : LoadingSpinner, Pagination, Navbar → i18n via `t()`

### A11y + Responsive (agent_10)

- RTL logical props (ms/me/ps/pe) validés
- Mobile <375px Explore + RootTree + Learn responsive
- Contraste ≥4.5:1 normal vérifié
- Cibles tactiles ≥44×44px

### Statistiques Wave 2

- **Fichiers modifiés** : 61
- **Endpoints nouveaux** : 5 (`/api/letters`, `/api/letters/:letter/cooccurrences`, `/api/progress/stats` amélioré, `/api/stats` dashboard, `/api/health/ready` standardisé)
- **Services/controllers nouveaux** : 4 (progressService SM-2 réparé, lettersService, statsController amélioré, progressService stats)
- **Composants nouveaux** : ConcentricLetters + LettersPage
- **Tests curl** : 20+ cas verts

---

## Wave 3 — Polish + QA (10 agents) — À confirmer

**Prévisions basées sur PLAN_FINAL.md §12-13** :

### Attendus

- Hardening sécurité (CSP nonces, refresh tokens NICE P1)
- Bug bash final + Lighthouse mobile ≥85
- Déploiement Atlas M0 + Render + Vercel
- Smoke tests complets
- Vidéo screencast 3-6 min (5 wow moments)

### Wow moments testables Post-Wave 2

1. ✅ Switch FR→EN→AR live + RTL bascule
2. ✅ RootTree radial `ع-ل-م` avec 10 dérivés
3. ✅ Constellation 16 racines colorées + filtre
4. ✅ SRS Learn SM-2 (rating buttons, streak)
5. ✅ Dark mode + **Page `/letters`** ConcentricLetters 28 lettres

### Non-couvert Wave 2 (Wave 3 ou NICE droppé)

- Refresh tokens path-scopé (NICE P1)
- Avatar upload Cloudinary (NICE P1)
- Contenus AR best-effort (NICE P2 droppé S6)
- CSP nonces D3 (NICE P2 droppé S6)
- CalligraphyAnimated SVG (NICE P3)

---

## Index des fiches Wave 1, 2, 3

| Wave | Agent                                    | Fichier                                                      | Scope                                |
| ---- | ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| 1    | viz_architect                            | `wave1/agent_01_viz_architect.md`                            | D3 radial vs force                   |
| 1    | data_planner                             | `wave1/agent_02_data_planner.md`                             | Quranic Corpus pipeline              |
| 1    | audit_landing                            | `wave1/agent_03_audit_landing.md`                            | Landing + hero                       |
| 1    | audit_explore_detail                     | `wave1/agent_04_audit_explore_detail.md`                     | Filtres, pagination                  |
| 1    | audit_dashboard_learn                    | `wave1/agent_05_audit_dashboard_learn.md`                    | SM-2, streaks                        |
| 1    | audit_constellation_notes                | `wave1/agent_06_audit_constellation_notes.md`                | Constellation, Notes, XSS            |
| 1    | audit_i18n_rtl                           | `wave1/agent_07_audit_i18n_rtl.md`                           | RTL, polices                         |
| 1    | audit_responsive_a11y                    | `wave1/agent_08_audit_responsive_a11y.md`                    | WCAG AA, mobile                      |
| 1    | audit_tech                               | `wave1/agent_09_audit_tech.md`                               | DevOps, CI/CD                        |
| 1    | qa_functional                            | `wave1/agent_10_qa_functional.md`                            | QA matrix                            |
| 2    | backend_sm2_stats                        | `wave2/agent_01_backend_sm2_stats.md`                        | SM-2 + /api/stats                    |
| 2    | backend_letters_api                      | `wave2/agent_02_backend_letters_api.md`                      | /api/letters endpoints               |
| 2    | backend_misc_fixes                       | `wave2/agent_03_backend_misc_fixes.md`                       | Fixes (slug index, sanitize, health) |
| 2    | seed_data                                | `wave2/agent_04_seed_data.md`                                | +8 racines, 40 mots, 16 total        |
| 2    | concentric_letters                       | `wave2/agent_05_concentric_letters.md`                       | ConcentricLetters viz + /letters     |
| 2    | frontend_explore_landing                 | `wave2/agent_06_frontend_explore_landing.md`                 | Pages Explore + Landing              |
| 2    | frontend_dashboard_learn                 | `wave2/agent_07_frontend_dashboard_learn.md`                 | Dashboard + Learn                    |
| 2    | frontend_constellation_notes_collections | `wave2/agent_08_frontend_constellation_notes_collections.md` | Constellation, Notes, Collections    |
| 2    | i18n_ar                                  | `wave2/agent_09_i18n_ar.md`                                  | i18n AR 25%→100% + pre-paint sync    |
| 2    | a11y_responsive                          | `wave2/agent_10_a11y_responsive.md`                          | WCAG AA, mobile responsive           |
| 3    | (à confirmer)                            | `wave3/agent_*.md`                                           | Polish + QA finale                   |

---

**Dernière mise à jour** : 2026-05-12 (Wave 2 complétée, Wave 3 en cours)
