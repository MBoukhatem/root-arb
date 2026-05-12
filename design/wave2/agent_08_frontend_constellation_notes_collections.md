# Agent 08 — Constellation · Notes · Collections

**Branch:** `rush` | **Typecheck:** `tsc -b --noEmit` → aucune erreur

---

## Fixes appliqués (15/16)

### CONSTELLATION

**#1 — Zoom init (drift à remount)**
`client/src/shared/viz/Constellation/Constellation.tsx:150,333`

```ts
svgSel.call(zoomBehavior.transform, zoomIdentity); // SVG
canvasSel.call(zoomBehavior.transform, zoomIdentity); // Canvas
```

Réinitialise la transform D3 à chaque remount → plus de drift visuel.

**#2 — Pinch zoom mobile**
`Constellation.tsx:193,353`

```tsx
style={{ touchAction: 'none' }}
```

Ajouté sur `<svg>` et `<canvas>`. Suppression du guard `pointer:fine` sur l'event drag → zoom pinch fonctionnel sur mobile.

**#3 — Empty state CTA → `/explore`**
`client/src/features/constellation/ConstellationPage.tsx:107`

```tsx
<Link
  to="/explore"
  className="inline-flex items-center gap-1.5 rounded-lg bg-(--cat-verb-fill) px-4 py-2 text-sm font-semibold text-white"
>
  {t('constellation:exploreRoots')}
</Link>
```

**#4 — Légende couleur sémantique**
`ConstellationPage.tsx:44,122-130`

```ts
const visibleFields = useMemo(() => {
  const seen = new Set<string>();
  for (const n of vizPayload.nodes) seen.add(n.semanticField);
  return Array.from(seen).sort();
}, [vizPayload.nodes]);
```

Rendu des pastilles colorées avec `colorForSemanticField(field)` sous le graphe.

**#5 — Nœud → page détail racine**
`Constellation.tsx:93` — chaque nœud SVG reçoit `fill` via `colorForSemanticField` et le clic navigue vers `/roots/:id` via le handler existant `onNodeClick`.

**#6 — Hash-based deps simulation**
`client/src/shared/viz/Constellation/useForceSimulation.ts:32,81`

```ts
const nodeIdHash = useMemo(
  () =>
    nodes
      .map((n) => n.id)
      .sort()
      .join(','),
  [nodes],
);
// useEffect deps: [nodeIdHash, linkIdHash, width, height]
```

Évite les rebuilds inutiles quand count stable mais contenu change.

---

### NOTES

**#7 — Type `personal` fonctionnel**
`client/src/types/models.ts:42`

```ts
export const NOTE_TYPES = [
  'mnemonic',
  'context',
  'cultural',
  'grammar',
  'general',
  'personal',
] as const;
```

**#8 — Inline edit modal avec update optimiste**
`client/src/features/notes/NotesPage.tsx:48,105`
`client/src/features/notes/hooks/useNotes.ts` — `useUpdateNote`

```ts
export function useUpdateNote() {
  return useMutation({
    mutationFn: ({ id, payload }) => notesApi.update(id, payload),
    onMutate: async ({ id, payload }) => {
      /* snapshot + optimistic patch */
    },
    onError: (_e, _v, ctx) => qc.setQueryData(['notes', filters], ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });
}
```

**#9 — Bouton Like**
`NotesPage.tsx:49,212` | `useNotes.ts` — `useToggleLike`

```ts
export function useToggleLike() {
  return useMutation({
    mutationFn: (id) => notesApi.toggleLike(id),
    onMutate: async (id) => {
      /* +1 optimiste sur likesCount */
    },
    onError: (_e, _v, ctx) => qc.setQueryData(['notes', filters], ctx?.previous),
  });
}
```

**#10 — Toggle isPublic**
`NotesPage.tsx:313,370` — checkbox dans le modal d'édition et dans le modal de création.

**#11 — Filtres targetType + type + visibility**
`NotesPage.tsx:34,137-148`

```tsx
const [targetType, setTargetType] = useState<TargetType | null>(null);
isPublic: visibility === 'both' ? null : visibility,
```

Pills filtrantes pour `targetType` (Root/Word/All) et `visibility` (mes notes/publiques/toutes).

---

### COLLECTIONS

**#12 — Renommage `coverColor`**
`client/src/types/models.ts:128` | `client/src/api/collectionsApi.ts` | `CollectionsPage.tsx:35,58,112`

```ts
coverColor?: string;
/** @deprecated use coverColor */
color?: string;
```

Rétrocompat maintenue (`c.coverColor ?? c.color` à l'affichage).

**#13 — CollectionDetailPage + route**
`client/src/features/collections/CollectionDetailPage.tsx` (nouveau, 228 lignes)
`client/src/app/router.tsx:20,46`

```tsx
const CollectionDetailPage = lazy(() => import('@/features/collections/CollectionDetailPage'));
<Route path="/collections/:id" element={<CollectionDetailPage />} />;
```

**#14 — RootPicker modal**
`CollectionDetailPage.tsx:26-117`
Recherche temps réel (debounce natif sur `queryKey`), toggle add/remove avec `useAddRootToCollection` / `useRemoveRootFromCollection`, affichage de l'état courant.

**#15 — Badge public/privé**
`CollectionsPage.tsx:123-136`

```tsx
{
  c.isPublic ? (
    <span title={t('collections:public')}>
      <Globe size={11} />
    </span>
  ) : (
    <span title={t('collections:private')}>
      <Lock size={11} />
    </span>
  );
}
```

**#16 — Slug preview**
`CollectionsPage.tsx:16-23,39,189`

```ts
function toSlugPreview(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 60);
}
```

Affiché sous le champ nom pendant la saisie.

---

## Finding non fixé

| #                                      | Raison                                                                      |
| -------------------------------------- | --------------------------------------------------------------------------- |
| Drag & drop réorganisation collections | `@dnd-kit` absent de `client/package.json` ; ajout de dépendance hors scope |

---

## Output typecheck

```
> @arb/client@0.1.0 typecheck
> tsc -b --noEmit

(aucune sortie — 0 erreur, 0 warning)
```

---

## Résumé (FR)

Les 15 corrections applicables ont été implémentées : zoom D3 initialisé à `zoomIdentity` pour éviter le drift, support pinch mobile via `touchAction:none`, légende sémantique et lien nœud→détail dans Constellation. Les Notes gèrent désormais le type `personal`, l'édition inline optimiste, le like et le filtre multi-critères. Les Collections utilisent `coverColor`, exposent une page détail avec `RootPickerModal`, affichent le badge public/privé et le slug preview. Le drag&drop est différé faute de `@dnd-kit`. Typecheck : 0 erreur.
