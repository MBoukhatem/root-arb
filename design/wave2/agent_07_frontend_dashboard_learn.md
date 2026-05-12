# agent_07 — Frontend Dashboard + Learn fixes

## Fixes appliqués (13/15 côté frontend)

| #   | Priorité | Fichier:ligne                        | Fix                                                                                          |
| --- | -------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| 1   | HIGH     | `progressApi.ts:4-7`                 | Déjà correct — envoi `{rootId, rating}` conforme                                             |
| 2   | HIGH     | `DashboardPage.tsx:22-27`            | Lecture null-safe via `stats.data?.field ?? 0`                                               |
| 3   | HIGH     | `DashboardPage.tsx:191-213`          | `WeeklyBars` accepte `data?` + early-return `<p>—</p>` si vide                               |
| 5   | HIGH     | `DashboardPage.tsx:99-107`           | `streak` lu depuis `stats.data?.streak ?? 0` → StatCard animé                                |
| 6   | MEDIUM   | `DashboardPage.tsx:127-146, 217-240` | Section MasteryBars barres colorées `--cat-*-fill` niveaux 0-5                               |
| 7   | MEDIUM   | `StatCard.tsx` (déjà implémenté)     | Count-up rAF 600 ms déjà présent — conforme                                                  |
| 8   | MEDIUM   | `DashboardPage.tsx:31-52`            | EmptyState plein écran si `totalRootsLearned===0 && todayItems===[]` + CTA `/explore`        |
| 9   | MEDIUM   | `DashboardPage.tsx:62-73`            | Bouton `RefreshCw` header invoquant `stats.refetch()` + `today.refetch()`                    |
| 10  | MEDIUM   | `useProgress.ts:22-53`               | Optimistic update `onMutate` retire l'item, `onError` rollback                               |
| 11  | MEDIUM   | `LearnPage.tsx:149-152`              | `displayArabic` = premier mot vocalisé `root.words?.[0].arabicWord` ou fallback `letters`    |
| 12  | MEDIUM   | `LearnPage.tsx:132-141`              | Toast `react-hot-toast` "Niveau X → revoir le YYYY-MM-DD" dans `onSuccess` mutation          |
| 13  | LOW      | `LearnPage.tsx:171-172`              | Wrapper `style={{ perspective: 1000 }}` + motion `style={{ transformStyle: 'preserve-3d' }}` |
| 14  | LOW      | `LearnPage.tsx:157-160`              | `progressPct = (index / items.length) * 100` — incrément à handleRate                        |
| 15  | LOW      | `LearnPage.tsx:81-83`                | `description={review.error instanceof Error ? review.error.message : undefined}`             |

### Snippets clés

**#3 WeeklyBars null-safe**

```tsx
function WeeklyBars({ data }: { data?: { date: string; count: number }[] }) {
  const safe = data ?? [];
  if (safe.length === 0) return <p className="text-center text-sm text-(--text-muted)">—</p>;
```

**#10 Optimistic update**

```ts
onMutate: async (payload) => {
  await qc.cancelQueries({ queryKey: TODAY_KEY });
  const previous = qc.getQueryData<TodayReview>(TODAY_KEY);
  qc.setQueryData<TodayReview>(TODAY_KEY, (old) => ({
    ...old!, rootsToReview: old!.rootsToReview.filter((r) => r.root._id !== payload.rootId),
  }));
  return { previous };
},
```

**#12 Toast SM-2**

```ts
onSuccess: (result) => {
  const level = result?.masteryLevel;
  const nextDate = result?.nextReviewDate ? new Date(result.nextReviewDate).toLocaleDateString('fr-FR') : null;
  if (level != null && nextDate) toast.success(`Niveau ${level} → revoir le ${nextDate}`, { duration: 3000 });
},
```

**#14 Progress bar à handleRate**

```tsx
const progressPct = (index / items.length) * 100;
// <div style={{ width: `${progressPct}%` }} />
```

## Output typecheck

```
npm run typecheck -w client → 0 erreurs dans les fichiers modifiés
Erreurs pré-existantes (hors scope) : AppLayout.tsx, Modal.tsx, ConcentricLetters.tsx, CollectionsPage.tsx
```

## Types modifiés

- `models.ts:196` — `ProgressStats.levels?: Record<number, number>` ajouté

## Résumé (< 150 mots)

13 fixes appliqués sur Dashboard et Learn. Côté Dashboard : lecture null-safe des stats (`?.` + `?? 0/[]`), `WeeklyBars` protégée contre `undefined`, section MasteryBars (niveaux 0-5 en barres `--cat-*-fill`), EmptyState global pour nouvel utilisateur avec CTA `/explore`, bouton `RefreshCw` en header. Côté Learn : flashcard affiche le mot arabe vocalisé (tashkil) si disponible dans `root.words`, toast `react-hot-toast` "Niveau X → revoir le JJ/MM/AAAA" après chaque rating, wrapper `perspective: 1000` pour flip 3D correct, barre de progression incrémentée à la validation (non au flip), message d'erreur réseau réel dans l'EmptyState. Dans `useProgress.ts` : mise à jour optimiste retire l'item courant de `['progress','today']` dès `onMutate`, rollback complet en `onError`. Zéro nouvelle erreur TypeScript introduite.
