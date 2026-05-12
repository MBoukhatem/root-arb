# Audit Explore & RootDetail — agent_04

**Fichiers audités** : `client/src/features/roots/ExplorePage.tsx`, `client/src/features/roots/RootDetailPage.tsx`, `client/src/features/roots/hooks/useRoots.ts`, `client/src/api/rootsApi.ts`, `client/src/shared/ui/{SearchBar,RootCard,Pagination,FilterPill,Skeleton,EmptyState}.tsx`, `client/src/shared/hooks/useDebounce.ts`, `client/src/app/router.tsx`.

## Résumé

- **Total findings** : 14 (CRITICAL 0 / HIGH 4 / MEDIUM 7 / LOW 3)
- **Verdict** : REQUEST CHANGES

## Findings

### [HIGH] 1. Route `/roots/:id` 404 → redirige vers `/404` au lieu d'afficher EmptyState contextuel

**Fichier** : `client/src/app/router.tsx:49` + `RootDetailPage.tsx:74-84`
**Issue** : Si l'API renvoie 404 sur un id valide-format mais inexistant, le composant affiche un EmptyState générique "common:error" avec bouton Retry — aucun message dédié "racine introuvable", pas de lien retour `/explore` proéminent.
**Fix** : Différencier `error.response?.status === 404` (afficher `roots:rootNotFound` + lien explore) vs autres erreurs (afficher Retry).

### [HIGH] 2. SearchBar : `onChange` dans deps manquantes provoque debounce sur clear remount

**Fichier** : `client/src/shared/ui/SearchBar.tsx:31-35`
**Issue** : `useEffect([debounced])` exclut `onChange` via eslint-disable. Au **premier mount**, `debounced === ""` déclenche immédiatement `onChange("")` → reset `page=1` non désiré.
**Fix** : Utiliser un `useRef` pour skip le 1er run.

### [HIGH] 3. Recherche transliteration FR/EN/AR non implémentée côté UI/API

**Fichier** : `client/src/api/rootsApi.ts:24-34`
**Issue** : Le param `search` est envoyé tel quel ; aucune normalisation (NFD, suppression diacritiques, mapping `dh→ذ`). Aucun indicateur UX ne précise sur quel champ on cherche.
**Fix** : Ajouter un sélecteur `searchIn` (auto/letters/translit/meaning) ou détecter automatiquement (Arabic chars → letters, latin → translit+meaning).

### [HIGH] 4. Reset filtres ne reset PAS la recherche `search`

**Fichier** : `client/src/features/roots/ExplorePage.tsx:37-43`
**Issue** : `resetFilters()` nettoie semanticField/difficulty/isEssential/isQuranic mais conserve `search`. Le bouton "reset" dans l'EmptyState (ligne 145) ne supprimera pas la query qui a causé le 0-result.
**Fix** : `setSearch('')` dans `resetFilters` ; envisager 2 boutons distincts.

### [MEDIUM] 5. i18n : changement de langue ne re-fetch pas

**Fichier** : `ExplorePage.tsx:25-35`
**Issue** : `query` n'inclut pas `lang`. La queryKey ne change pas au switch FR↔EN↔AR.
**Fix** : Inclure `lang` dans la queryKey et/ou invalider `ROOTS_QUERY_KEY` au changement de langue.

### [MEDIUM] 6. Pagination ne scroll pas en haut au changement de page

**Fichier** : `ExplorePage.tsx:158`
**Issue** : `onPageChange={setPage}` ne déclenche aucun `window.scrollTo`.
**Fix** : `onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}`.

### [MEDIUM] 7. RootDetail : RootTree rendu sans skeleton dédié pendant chargement

**Fichier** : `RootDetailPage.tsx:182-194`
**Issue** : Une fois `data` reçu, `RootTree` se monte instantanément. FOUC possible.
**Fix** : Lazy-loader `RootTree` (`React.lazy`) avec fallback skeleton tree.

### [MEDIUM] 8. Mapping `VIZ_CATEGORY_MAP` perd info `adverb`, `pluriel-brise`, `derive`

**Fichier** : `RootDetailPage.tsx:24-33`
**Issue** : 3 catégories sur 8 fusionnées en `'noun'` côté viz. Discordance avec la liste qui groupe par 8 catégories.
**Fix** : Étendre le type `VizCategory` pour couvrir les 8 catégories PLAN-FINAL.

### [MEDIUM] 9. Filtre boolean `isEssential`/`isQuranic` impossible à passer à `false`

**Fichier** : `ExplorePage.tsx:98-115`
**Issue** : Le pill toggle ne permet que `null ↔ true`. Impossible de filtrer "non-essentielles".
**Fix** : Tri-state (off / true / false) avec labels distincts.

### [MEDIUM] 10. `useRoot(id)` ne gère pas l'id `undefined`

**Fichier** : `useRoots.ts:15-22` + `RootDetailPage.tsx:46`
**Fix** : Ajouter `if (!id) return <Navigate to="/explore" replace />`.

### [MEDIUM] 11. RootCard : bouton Star sans role distinct

**Fichier** : `RootCard.tsx:31-65`
**Issue** : Lecteur d'écran annonce confusément "essential, link to root".
**Fix** : Star doit être `aria-hidden` + texte SR-only.

### [LOW] 12. `Skeleton variant="tree"` h-96 ne matche pas la hauteur réelle RootTree

**Fichier** : `Skeleton.tsx:16`
**Fix** : Aligner sur la `defaultHeight` du composant RootTree.

### [LOW] 13. Reset link sémantique : `<button>` underline plutôt qu'un `<Button variant="ghost">`

**Fichier** : `ExplorePage.tsx:117-124`
**Fix** : Utiliser `<Button variant="ghost" size="sm">`.

### [LOW] 14. SearchBar : pas d'attribut `enterKeyHint` ni `inputMode`

**Fichier** : `SearchBar.tsx:62-68`
**Fix** : `enterKeyHint="search"` ; `lang={lang}` pour suggestion clavier arabe.

## Open Questions

- Le serveur `/api/roots?search=...` indexe-t-il les 3 langues + transliteration ? Non vérifié.

## Positive Observations

- `keepPreviousData` sur `useRoots` → pas de flash blanc à la pagination.
- Skeleton sur 6 cartes en grid responsive 1/2/3 col.
- `aria-pressed` correct sur FilterPill et tabs de catégorie.
- Logical properties (`ms-auto`, `ps-10`, `pe-10`, `start-3`, `end-2`) → RTL ready.
- `encodeURIComponent(root._id)` sur le `Link` (sécurité URL).
- Breadcrumb retour `/explore` présent.

## Synthèse

Top correctif prioritaire : `ExplorePage.tsx:37-43` ajouter `setSearch('')` à `resetFilters()` + fix `SearchBar.tsx:31-35` (skip 1er run du debounce via `useRef`). Ces deux fix débloquent immédiatement l'UX d'exploration.
