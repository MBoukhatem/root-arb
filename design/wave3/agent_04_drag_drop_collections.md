# Agent 04 — Drag & Drop Collections (Wave 3)

## Fichiers créés / modifiés

| Fichier                                                            | Action                                                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `client/package.json`                                              | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers` ajoutés                                      |
| `client/src/api/collectionsApi.ts`                                 | `reorderRoots(collectionId, rootIds[])` → `PUT /collections/:id/roots/order`                            |
| `client/src/features/collections/hooks/useCollections.ts`          | `useReorderCollectionRoots(collectionId)` — mutation + optimistic update                                |
| `client/src/features/collections/components/SortableRootItem.tsx`  | NEW — item draggable avec `useSortable`, drag handle `GripVertical`, bouton remove                      |
| `client/src/features/collections/components/SortableRootsList.tsx` | NEW — `DndContext` + `SortableContext` + `arrayMove` + appel mutation                                   |
| `client/src/features/collections/CollectionDetailPage.tsx`         | Grille statique remplacée par `<SortableRootsList>`                                                     |
| `server/src/validations/collectionValidation.js`                   | `reorderRoots` Joi schema — `rootIds: array of ObjectId hex(24)`                                        |
| `server/src/services/collectionService.js`                         | `reorderRoots(userId, id, rootIds)` — filtre les ids valides, sauvegarde, renvoie la collection populée |
| `server/src/controllers/collectionController.js`                   | Handler `reorderRoots` via `asyncHandler`                                                               |
| `server/src/routes/collectionRoutes.js`                            | `PUT /:id/roots/order` avec validation params + body                                                    |

## Endpoint API

```
PUT /api/collections/:id/roots/order
Authorization: Bearer <token>
Content-Type: application/json

{ "rootIds": ["664a1b...", "664a1c...", "664a1d..."] }
```

**Curl test :**

```bash
curl -X PUT http://localhost:5000/api/collections/<ID>/roots/order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rootIds":["664a1b2c3d4e5f6a7b8c9d01","664a1b2c3d4e5f6a7b8c9d02"]}'
```

Réponse : `200 { success: true, data: <collection populée> }`.

## Snippet `useSortable`

```tsx
// SortableRootItem.tsx
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
  id: entry.id,
});

const style: React.CSSProperties = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.4 : 1,
  boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.18)' : undefined,
};

// Drag handle — keyboard + pointer
<button {...attributes} {...listeners} aria-label="Déplacer" aria-roledescription="sortable">
  <GripVertical size={16} />
</button>;
```

## Accessibility — Keyboard Reorder

- `KeyboardSensor` avec `sortableKeyboardCoordinates` activé dans `SortableRootsList`.
- Le drag handle est un `<button>` focusable (`tabIndex={0}`) avec `aria-label="Déplacer"` et `aria-roledescription="sortable"`.
- Navigation : `Tab` → focus handle → `Space`/`Enter` active le drag → `ArrowUp`/`ArrowDown` déplace l'item → `Space`/`Enter` dépose.
- `restrictToVerticalAxis` empêche les mouvements hors axe ; `restrictToParentElement` confine dans la liste.
- Touch : `PointerSensor` avec `activationConstraint: { distance: 5 }` évite les faux déclenchements sur scroll mobile.

## Optimistic Update

`useReorderCollectionRoots` applique `{ ...old, roots: rootIds }` avant la réponse serveur. En cas d'erreur réseau, `onError` restaure le snapshot `previous`. `onSettled` invalide la query pour resynchroniser.

---

## Résumé (FR)

Drag & drop vertical ajouté aux collections via `@dnd-kit`. L'endpoint `PUT /api/collections/:id/roots/order` reçoit un tableau ordonné d'ObjectIds, filtre les ids valides et persiste l'ordre. Côté client, `SortableRootsList` orchestre `DndContext` + `arrayMove` avec optimistic update ; `SortableRootItem` expose un drag handle accessible clavier (`GripVertical`, `aria-roledescription="sortable"`). `CollectionDetailPage` utilise désormais cette liste au lieu de la grille statique. Typecheck : 0 erreur dans les fichiers modifiés.
