# agent_01 — Backend SM-2 + /api/stats

## Fichiers modifiés

| Fichier                                        | Lignes ~modifiées | Nature                                |
| ---------------------------------------------- | ----------------- | ------------------------------------- |
| `server/src/validations/progressValidation.js` | ~10               | Joi xor rating/success                |
| `server/src/services/progressService.js`       | ~120              | recordReview + stats() + updateStreak |
| `server/src/controllers/statsController.js`    | +20               | dashboard étendu                      |
| `server/src/utils/timezone.js`                 | CRÉÉ, 42 lignes   | helpers TZ                            |
| `server/package.json`                          | +1 dep            | date-fns-tz                           |

## Nouvelles signatures

```js
// progressValidation.recordReview — Joi.object({ rootId, rating?, success? }).or('rating','success')
// rating: 'failed'|'hard'|'good'|'perfect'  OU  success: boolean (rétrocompat)

resolveSuccess(rating, successFlag) → { success: boolean, multiplier: number }
// failed→false×1.0 | hard→true×0.7 | good→true×1.0 | perfect→true×1.3

nextScheduling(current, success, multiplier, userTz) → { masteryLevel, intervalDays, nextReviewDate, lastReviewed }
// nextReviewDate aligné minuit TZ user via addDaysInTz()

updateStreak(user, now) → Promise<void>
// noop si lastActivityDate==today | streak++ si ==yesterday | streak=1 sinon

startOfDayInTz(date, tz) → Date
addDaysInTz(date, days, tz) → Date
toDateStringInTz(date, tz) → 'yyyy-mm-dd'
```

## Contrat /api/stats final

`GET /api/stats` (statsController.dashboard) retourne :

```json
{
  "user": { "streak": 1, "activeDays": 1 },
  "content": {
    "totalRoots": 16, "totalWords": 47,
    "totalRootsLearned": 0, "totalWordsMastered": 0,
    "weeklyActivity": [{ "date": "2026-05-06", "count": 0 }, ...]
  },
  "library": { "notes": 0, "collections": 0 },
  "totalRootsLearned": 0, "totalWordsMastered": 0,
  "streak": 1, "activeDays": 1,
  "weeklyActivity": [{ "date": "2026-05-12", "count": 1 }]
}
```

`GET /api/progress/stats` (progressController.stats → progressService.stats) retourne la shape exacte `ProgressStats` client :

```json
{
  "totalRootsLearned": 0, "totalWordsMastered": 0,
  "streak": 1, "activeDays": 1,
  "weeklyActivity": [{ "date": "2026-05-06", "count": 0 }, ...]
}
```

## Tests curl exécutés

| #   | Commande                                          | Résultat                                         |
| --- | ------------------------------------------------- | ------------------------------------------------ |
| 1   | GET /api/health                                   | `{status:"ok"}` ✅                               |
| 2   | GET /api/progress/stats (fresh user)              | 7 jours à 0 ✅                                   |
| 3   | GET /api/stats (fresh user)                       | contrat complet ✅                               |
| 4   | POST /api/progress `rating=good`                  | masteryLevel=1 nextReview=+3j minuit UTC ✅      |
| 5   | GET /api/progress/stats après review              | streak=1 activeDays=1 weeklyActivity[today]=1 ✅ |
| 6   | POST /api/progress `rating=failed` (nouveau root) | masteryLevel=0 failureCount=1 ✅                 |
| 7   | POST /api/progress `success=true` (rétrocompat)   | masteryLevel=1 successCount=1 ✅                 |
| 8   | POST /api/progress sans rating ni success         | 400 VALIDATION ✅                                |

## Risques / non-fix

- **TS errors client** : `DashboardPage.tsx` modifié par un autre agent avec `stats.data ?? {}` qui perd le type `ProgressStats` → 6 erreurs TS. Hors scope (fichier non assigné). Fix trivial : remplacer `?? {}` par `?? undefined` et garder les guards.
- `totalRootsLearned` : défini comme masteryLevel≥3 (PLAN §5). Peut diverger si le seuil change.
- Agrégation `weeklyActivity` basée sur `lastReviewed` par document Progress (pas par session individuelle). Pour des reviews multiples du même root le même jour, `reviewCount` est sommé — comportement correct.
- `updateStreak` est fire-and-forget (`.catch(()=>{})`) pour ne pas bloquer le retour de review en cas d'erreur Mongo transiente.
