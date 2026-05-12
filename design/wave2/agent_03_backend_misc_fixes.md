# Agent 03 — Backend Misc Fixes (Wave 2)

## Fichiers modifiés

| Fichier                                     | Changement                                                                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `server/src/utils/enums.js:32`              | Ajout de `'personal'` dans `NOTE_TYPES`                                                                                            |
| `server/src/models/Collection.js:28,40`     | Retrait de `unique:true` sur `slug` seul ; ajout index composite `{user:1, slug:1} unique`                                         |
| `server/src/services/noteService.js`        | Import `sanitize-html` + `sanitizeContent()` appliqué dans `create()` et `update()`                                                |
| `server/src/controllers/statsController.js` | Constellation : fallback preview (racines essentielles à masteryLevel=0 si zéro progression) + query param `includeUnstudied=true` |
| `server/src/routes/healthRoutes.js`         | `/api/health/ready` utilise `sendSuccess` → format `{success:true, data:{status,db}}`                                              |

## Outputs curl

### Fix 1 + 3 — Note type "personal" + sanitize XSS

```
POST /api/notes  body: {"type":"personal","content":"<script>alert(1)</script><b>OK</b>"}

HTTP 201
{
  "success": true,
  "data": {
    "content": "<b>OK</b>",
    "type": "personal",
    ...
  },
  "message": "Note created"
}
```

`<script>alert(1)</script>` supprimé, `<b>OK</b>` conservé (tag autorisé).

### Fix 5 — Health ready standardisé

```
GET /api/health/ready

HTTP 200
{"success":true,"data":{"status":"ready","db":{"state":1,"ready":true}}}
```

### Fix 4 — Constellation fallback preview

Avant (0 progression) : `nodes:[], links:[]`

Après (0 progression) :

```
{"success":true,"data":{"nodes":[{"letters":"ك-ت-ب","semanticField":"knowledge","masteryLevel":0},...],
 "links":[...],"meta":{"total":8,"fields":[...],"isPreview":true}}}
```

## Migrations Mongo nécessaires

**Index Collection à synchroniser** : l'ancien index `slug_1` (unique global) doit être supprimé et remplacé par le composite `user_1_slug_1`.

```js
// À exécuter une fois sur la base existante :
db.collections.dropIndex('slug_1');
db.collections.createIndex({ user: 1, slug: 1 }, { unique: true });
```

Mongoose crée l'index composite au démarrage si la collection est vide ou si `syncIndexes()` est appelé. En prod, exécuter manuellement pour éviter un conflit d'index dupliqué.

---

## Résumé (< 150 mots)

Cinq correctifs backend appliqués sans toucher aux fichiers des autres agents. (1) `NOTE_TYPES` enrichi de `'personal'` — la validation Joi en hérite automatiquement. (2) Index `slug` Collection converti en composite `{user, slug}` unique, conforme à la spec "unique par utilisateur". (3) `sanitize-html` (déjà en dépendance) branché dans `noteService.create/update` : les balises `<script>` sont supprimées, les tags sûrs (`<b>`, `<em>`, etc.) sont conservés. (4) Constellation enrichie d'un fallback : si l'utilisateur n'a aucune progression, les racines essentielles sont renvoyées en mode preview (`masteryLevel:0`, `isPreview:true`) au lieu d'un tableau vide. (5) `/api/health/ready` retourne désormais `{success:true, data:{status,db}}` via `sendSuccess`, conforme au contrat standardisé de l'API.
