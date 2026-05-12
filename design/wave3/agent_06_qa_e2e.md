# QA E2E Post-Wave 2

## Endpoints

| #   | Path                                            | Expect                                     | Got                                                   | ✅/❌ |
| --- | ----------------------------------------------- | ------------------------------------------ | ----------------------------------------------------- | ----- |
| 1   | GET /api/health                                 | status:ok                                  | status:ok                                             | ✅    |
| 2   | GET /api/roots?limit=50                         | ≥16 racines                                | 16 racines, pagination OK                             | ✅    |
| 3   | GET /api/roots?page=1&limit=5                   | pagination object                          | {page:1,limit:5,total:16,totalPages:4}                | ✅    |
| 4   | GET /api/roots/:id                              | objet root                                 | letters:ك-ت-ب retourné                                | ✅    |
| 5   | GET /api/words/by-root/:rootId                  | liste mots                                 | 7 mots pour ك-ت-ب                                     | ✅    |
| 6   | GET /api/words (sans auth)                      | 401                                        | 401 Unauthorized                                      | ✅    |
| 7   | GET /api/roots?search=كتب                       | résultats filtrés                          | [] — recherche retourne vide (bug)                    | ❌    |
| 8   | POST /api/auth/login (admin)                    | accessToken                                | accessToken présent                                   | ✅    |
| 9   | GET /api/auth/me                                | email+role                                 | admin@arabicwordroot.com, role:admin                  | ✅    |
| 10  | POST /api/auth/register                         | success:true                               | "Account created"                                     | ✅    |
| 11  | GET /api/progress                               | liste                                      | success:true, data:list                               | ✅    |
| 12  | POST /api/progress rating:"good"                | mastery monte                              | success:true, masteryLevel:4 après 4 appels           | ✅    |
| 13  | POST /api/progress rating:4 (int)               | rejet validation                           | VALIDATION error: rating must be string               | ✅    |
| 14  | nextReviewDate aligné minuit                    | T00:00:00.000Z                             | "2026-06-20T00:00:00.000Z"                            | ✅    |
| 15  | GET /api/stats (constellation)                  | route inexistante                          | 404 "Route not found: GET /api/stats/constellation"   | ❌    |
| 16  | GET /api/stats (dashboard)                      | weeklyActivity[7]+streak+totalRootsLearned | weeklyActivity:7 items, streak:1, totalRootsLearned:0 | ✅    |
| 17  | GET /api/notes                                  | liste                                      | success:true, data:list                               | ✅    |
| 18  | POST /api/notes type:"personal" sans targetType | rejet ou champ optionnel                   | VALIDATION error: targetType required (bug spec)      | ❌    |
| 19  | GET /api/collections                            | liste                                      | success:true, data:list                               | ✅    |
| 20  | POST /api/collections coverColor                | objet avec coverColor                      | coverColor:#FF5733 retourné                           | ✅    |
| 21  | GET /api/letters                                | ≥28 lettres avec count                     | 35 lettres                                            | ✅    |
| 22  | GET /api/letters/ك/cooccurrences                | 5 co-occ (ل ت ب أ م)                       | 5 lettres exactes                                     | ✅    |
| 23  | GET /api/letters/ج/cooccurrences                | ≥2 co-occ (ل, س)                           | 4 co-occ dont ل et س                                  | ✅    |
| 24  | Rate limit login 6e tentative = 429             | HTTP 429                                   | 429 dès la 1re (fenêtre 15min déjà remplie)           | ✅\*  |

> \*24 : le rate limit fonctionne (5/15min confirmé dans la config et observé), mais X-Forwarded-For n'est pas honnoré par le limiter — chaque IP spoofée compte indépendamment. Test manuel depuis 127.0.0.1 : fenêtre épuisée en début de session.

## Pages

| Route          | HTTP |
| -------------- | ---- |
| /              | 200  |
| /explore       | 200  |
| /letters       | 200  |
| /register      | 200  |
| /login         | 200  |
| /dashboard     | 200  |
| /learn         | 200  |
| /constellation | 200  |
| /notes         | 200  |
| /collections   | 200  |
| /roots/:id     | 200  |

Toutes les 11 pages frontend retournent 200 (SPA, auth check côté client).

## i18n

- ar.json : **163 clés** (seuil requis ≥176 — **MANQUANT 13 clés**)

## Builds

- typecheck: **1 erreur TS** — `useAuthContext` introuvable dans `AuthContext` (`src/features/auth/useAuth.ts:3`)
- lint: **10 errors, 1 warning** (10 erreurs dont `react-hooks/rules-of-hooks` dans `RootDetailPage.tsx`, `react-hooks/set-state-in-effect` dans `StatCard.tsx`, plus 8 autres non répertoriées à cause de l'arrêt anticipé d'ESLint)
- build: **FAIL** — 8 erreurs TS bloquantes :
  - `useLanguage` non exporté par `LanguageContext` (5 fichiers)
  - `useAuthContext` non exporté par `AuthContext`
  - `@dnd-kit/modifiers` module introuvable (`SortableRootsList.tsx`)
  - Conversion `string[]` → `{ _id: string }[]` invalide (`useCollections.ts`)

## Bugs détectés

1. **[CRITIQUE] Build client échoue** — `useLanguage` et `useAuthContext` ne sont pas exportés depuis leurs contextes respectifs. 5 fichiers impactés. Le build Vite ne peut pas se terminer.
2. **[CRITIQUE] Module `@dnd-kit/modifiers` absent** — dépendance manquante dans `client/package.json`, bloque la compilation de `SortableRootsList.tsx`.
3. **[MAJEUR] GET /api/roots?search=كتب retourne []** — la recherche textuelle sur les racines ne fonctionne pas (0 résultat pour une racine existante).
4. **[MAJEUR] POST /api/notes type:"personal" requiert targetType+target** — le schéma Joi force `targetType` et `target` comme obligatoires pour toutes les notes, rendant les notes "personnelles" sans cible impossibles à créer.
5. **[MAJEUR] GET /api/stats/constellation introuvable** — la route est `/api/constellation` (montée sur `/` dans statsRoutes), pas `/api/stats/constellation`. La constellation publique est en réalité sur `GET /api/roots/constellation` mais retourne une erreur de validation (attend un `:id` hexadécimal).
6. **[MINEUR] ar.json 163 clés** — seuil de 176 non atteint, 13 clés manquantes.
7. **[MINEUR] TypeScript : 1 erreur typecheck** — `useAuthContext` inexistant dans `AuthContext`.
8. **[MINEUR] rate limit login** — X-Forwarded-For non pris en compte : chaque IP spoofée obtient son propre compteur. En production derrière proxy, la config `trust proxy` est nécessaire.
9. **[INFO] masteryLevel vs mastery** — le champ s'appelle `masteryLevel` dans la réponse, non `mastery` comme attendu dans la spec Wave 2.

## Verdict

**FAIL**

- Endpoints : 19/24 OK (79%) — 3 échecs fonctionnels + 1 note de spec
- Pages : 11/11 OK (100%)
- Build : FAIL (8 erreurs TS, dépendance manquante)
- Typecheck : FAIL (1 erreur)
- Lint : FAIL (10 erreurs)
- i18n : PARTIAL (163/176 clés)
