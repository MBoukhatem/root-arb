# Audit Wave 1 — Constellation / Notes / Collections

**Scope** : `client/src/features/{constellation,notes,collections}`, `client/src/shared/viz/Constellation/`, `server/src/{controllers,services,models,validations,routes}` (note/collection).
**Note** : aucun `constellationController.js` — la viz est alimentée par `statsApi.constellation` (`statsController`).

## Findings

### [HIGH][HIGH] Canvas zoom — pas d'init transform, drift après remount

- **File** : `client/src/shared/viz/Constellation/Constellation.tsx:320-326`
- `d3.zoom` ne reçoit pas de `zoomTransform` initial ; sur remount (filtre), `transformRef` repart à `{0,0,1}` alors que la sim est recentrée → flash. Pas non plus de `touch-action:none` → wheel scrolle la page.
- **Fix** : `zoomBehavior.transform(select(canvas), zoomIdentity)` au mount + `touch-action:none` CSS.

### [HIGH][HIGH] Pinch zoom / drag tactile manquant (missing)

- **File** : `Constellation.tsx:109`
- `matchMedia('(pointer:fine)')` exclut le mobile, **aucune** alternative tactile. PLAN §6 demande pinch zoom mobile.
- **Fix** : `touch-action:none` + activation drag sur pointer events.

### [HIGH][HIGH] Collections — payload `color` ≠ schéma `coverColor` (silencieusement perdu)

- **File** : `client/src/features/collections/CollectionsPage.tsx:34` ↔ `server/src/models/Collection.js:32` ↔ `validations/collectionValidation.js:10`
- Le front envoie `{color, icon}` ; Joi exige `coverColor` (`color` non listé → rejet strict ou drop). Toutes les collections gardent le défaut `#4F46E5`.
- **Fix** : renommer en `coverColor` côté `CreateCollectionPayload` + `CollectionsPage`.

### [HIGH][MED] Notes — pas de `sanitize-html` côté serveur

- **File** : `server/src/services/noteService.js:43` / `models/Note.js:13`
- Aucun sanitizer alors que la spec le mentionne. Rendu actuel `whitespace-pre-wrap` (sûr) mais `isPublic` = feed multi-users → XSS stockée dès qu'on activera markdown/HTML.
- **Fix** : pre-save `sanitize-html` (whitelist tags vides) ou bloquer `<script`.

### [HIGH][HIGH] Notes — features manquantes (missing)

- **File** : `client/src/features/notes/NotesPage.tsx`, `client/src/api/notesApi.ts`
- `useToggleLike` absent (checklist §8), `useUpdateNote`/édition absente (§9), toggle `isPublic` absent (§6), filtre `targetType` absent, **markdown** rendering absent (§7).
- **Fix** : étendre `notesApi` (`update`, `toggleLike`), `<EditNoteModal>`, `react-markdown` + sanitize.

### [HIGH][HIGH] Collections — édition & root picker manquants (missing)

- **File** : `client/src/features/collections/CollectionsPage.tsx`, `hooks/useCollections.ts`
- Édition (§13 : add/remove racines, drag&drop, cover) **missing** : `collectionsApi.addRoot/removeRoot` existent mais aucun composant ne les utilise. Toggle `isPublic` + badge (§14) **missing**. Pas de page `/collections/:id`.
- **Fix** : route détail + `RootPicker` + `useUpdateCollection`.

### [HIGH][MED] `useForceSimulation` rebuild raté sur changement de filtre

- **File** : `useForceSimulation.ts:72`
- Deps `[nodes.length, links.length, width, height]` — si filtre change avec même length, la sim **n'est pas reconstruite** (garde anciens ids). Le commentaire l'admet.
- **Fix** : `useMemo` clé = hash des `id` triés.

### [MEDIUM][HIGH] Notes — création limitée à `targetType:'Root'` + saisie ObjectId brute

- **File** : `NotesPage.tsx:39,153-158`
- `rootId` est un `<input type="text">` (l'utilisateur tape un hex 24). Aucun sélecteur `Root/Word`. Joi rejette si non-hex → UX cassée.
- **Fix** : `<RootCombobox>` + sélecteur targetType.

### [MEDIUM][HIGH] Légende couleurs absente

- **File** : `ConstellationPage.tsx:97-104` / `semanticFieldColors.ts`
- Nœuds colorés par `semanticField` (palette 10) mais **aucune légende** mappant couleur ↔ champ (checklist §4).
- **Fix** : composant `<ConstellationLegend>` listant `SEMANTIC_FIELDS` + swatch.

### [MEDIUM][MED] `transliteration` codée en dur `''` dans le mapping

- **File** : `ConstellationPage.tsx:32`
- Tooltip affiche un `<div italic>` vide (Constellation.tsx:393).
- **Fix** : exposer `transliteration` depuis l'endpoint stats ou masquer le `<div>` si vide.

### [MEDIUM][HIGH] Collections — `slug unique:true` global au lieu de `{user, slug}` composite

- **File** : `server/src/models/Collection.js:28`
- Spec §12 = unique par user. Aujourd'hui `shortId(6)` masque la collision mais nuit à la lisibilité.
- **Fix** : index composite `{user:1, slug:1} unique` ; retirer `unique` racine.

### [MEDIUM][HIGH] Notes — `toggleLike` leak (403 vs 404)

- **File** : `noteService.js:62-67`
- Distingue note inexistante (404) vs note privée tierce (403) → enumeration.
- **Fix** : 404 dans les deux cas.

### [LOW][HIGH] Réponse `/notes` incohérente avec front

- **File** : `noteController.js:7-10` ↔ `notesApi.ts:34-38` ↔ `NotesPage.tsx:88,101`
- Serveur renvoie `data` array, front accède à `.notes` → propriété undefined si l'enveloppe ne réécrit pas. Collections utilise `{collections}`, notes devrait utiliser `{notes}`.
- **Fix** : harmoniser `sendSuccess(res, { notes: data }, …)`.

### [LOW][HIGH] Pas d'optimistic update / spinner sur delete & like (cohérence §9)

- **File** : `NotesPage.tsx:190-201`, `useNotes.ts:24-32`
- `useMutation` ne fait qu'`invalidate` ; bouton trash sans loading state.
- **Fix** : `onMutate`+rollback pattern.

### [LOW][MED] SVG `handleTick` ignore l'argument `simNodes/simLinks` (vs canvas)

- **File** : `Constellation.tsx:39-56` (SVG) vs `259-266` (canvas)
- SVG relit via `select(g)` à chaque tick, OK ; mais inconsistance interne → bug latent si la sim est remplacée par une autre.
- **Fix** : aligner sur la signature canvas.

### [LOW][HIGH] Zoom SVG sans garde `event.sourceEvent`

- **File** : `Constellation.tsx:144-146`
- Reset programmé peut entrer en boucle ; mineur car pas de reset aujourd'hui.
- **Fix** : `if (!event.sourceEvent) return;`.

## Verdict

**REQUEST CHANGES** — 4 HIGH (canvas zoom init, pinch/drag mobile, mismatch `color/coverColor`, features manquantes Notes & Collections) bloquent wave 1.

## Positives

- Séparation SVG/Canvas seuil 50 (Constellation.tsx:12,358) conforme PLAN §6.
- Empty-state + retry + skeleton cohérents sur les 3 pages.
- Clone défensif des nodes/links (useForceSimulation.ts:34-35) protège le cache react-query.
- Anti-orphelin Note (Note.js:27-34) vérifie l'existence du target.
- Validation Joi systématique sur les routes notes/collections.
