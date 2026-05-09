# 🌱 ArabicWordRoot

> **Application web fullstack pour l'apprentissage du vocabulaire arabe via la visualisation interactive du système des racines trilitères.**

---

## 📑 Table des Matières

1. [Vue d'Ensemble](#-vue-densemble)
2. [Le Concept en Détail](#-le-concept-en-détail)
3. [Stack Technique](#-stack-technique)
4. [Architecture du Projet (Monorepo)](#-architecture-du-projet-monorepo)
5. [Modèles de Données (MongoDB)](#-modèles-de-données-mongodb)
6. [API Backend (Express)](#-api-backend-express)
7. [Frontend React](#-frontend-react)
8. [Fonctionnalités Métier](#-fonctionnalités-métier)
9. [Système de Design](#-système-de-design)
10. [Sécurité & Validation](#-sécurité--validation)
11. [Préparation des Données](#-préparation-des-données-seed)
12. [Planning de Développement](#-planning-de-développement)
13. [Conformité Cahier des Charges](#-conformité-cahier-des-charges)
14. [Démo & Présentation](#-démo--présentation)

---

## 🎯 Vue d'Ensemble

### Le Pitch en 1 Phrase

Une plateforme moderne où l'apprenant explore l'arabe à travers des **arbres visuels animés** : chaque racine de 3 lettres devient une **constellation interactive** révélant tous les mots qu'elle génère, leurs significations et schémas grammaticaux.

### Le Problème Résolu

L'arabe est une langue à **morphologie non-concaténative** : 85% des mots sont construits à partir de racines trilitères (3 consonnes) qui se "moulent" dans des schémas (wazn) pour créer des familles de mots sémantiquement liés.

**Apprendre l'arabe mot par mot** (comme Duolingo) est inefficace car cela ignore cette logique générative. **Apprendre par racines** est scientifiquement prouvé 2 à 3 fois plus rapide.

#### Exemple concret

La racine **ك-ت-ب** (k-t-b, idée d'écriture) génère :

| Mot arabe | Translittération | Traduction | Schéma |
|-----------|-----------------|------------|--------|
| كَتَبَ | kataba | il a écrit | فَعَلَ |
| كِتَاب | kitāb | livre | فِعَال |
| كَاتِب | kātib | écrivain | فَاعِل |
| مَكْتَبَة | maktaba | bibliothèque | مَفْعَلَة |
| مَكْتَب | maktab | bureau | مَفْعَل |
| اِكْتَتَبَ | iktataba | il s'est inscrit | اِفْتَعَلَ |
| مَكَاتَبَة | mukātaba | correspondance | مُفَاعَلَة |

**1 racine = 10-15 mots reliés sémantiquement.** Comprendre le système = vocabulaire qui s'auto-débloque.

### Le Marché

#### Ce qui existe déjà

- **Hans Wehr Dictionary apps** → dictionnaire académique, statique, austère
- **Bayyinah TV** → cours vidéo payants, non interactifs
- **Decks Anki communautaires** → flashcards textuelles, sans visualisation
- **Apps mainstream** (Duolingo, AlifBee, Memrise, Drops) → approche mot-par-mot inefficace

#### La place vide

**Aucune application moderne, belle, interactive et grand public** n'enseigne l'arabe via la visualisation des arbres de racines. C'est la niche que comble ArabicWordRoot.

### L'Effet Wow Visuel

L'utilisateur clique sur une racine (ex: ك-ت-ب) et voit s'animer un **arbre radial interactif** où :

- La racine au centre en grosse calligraphie arabe
- Les mots dérivés rayonnent en branches colorées par catégorie grammaticale
- Verbes en bleu, noms en vert, lieux en orange, agents en rouge, instruments en violet
- Au survol : tooltip avec traduction + translittération
- Au clic : panneau détaillé avec exemple en contexte, schéma grammatical animé, tracé calligraphique

L'utilisateur sauvegarde sa **constellation personnelle** des racines maîtrisées qui grandit dans le temps : visualisation interactive de tout son vocabulaire arabe sous forme de carte mentale animée.

### Les Différenciateurs Clés

1. **Visualisation interactive D3.js** des arbres de racines (inexistant dans le marché actuel)
2. **Pédagogie des wazn** (schémas grammaticaux) intégrée et visualisée
3. **Algorithme de répétition espacée** adapté aux racines arabes
4. **Constellation personnelle** de progression évolutive
5. **Calligraphie animée** des mots
6. **Multilingue avec support RTL** natif pour l'arabe
7. **Dimension communautaire** légère (notes publiques, collections partagées)

---

## 💡 Le Concept en Détail

### L'Expérience Utilisateur Type

#### Premier contact (utilisateur non connecté)

L'utilisateur arrive sur la **landing page** : hero animé avec une racine qui se déploie en arbre interactif sous ses yeux. Il comprend instantanément le concept. Bouton "Explorer sans compte" pour tester immédiatement.

#### Mode exploration libre

Sans compte, l'utilisateur peut :
- Parcourir le catalogue de racines
- Cliquer sur une racine pour voir son arbre interactif
- Voir les traductions et translittérations
- Lire les exemples en contexte

Le tout sans friction, pour valider l'intérêt.

#### Inscription et personnalisation

À l'inscription, l'utilisateur choisit :
- Sa langue maternelle (FR, EN)
- Son niveau actuel d'arabe (débutant, intermédiaire, avancé)
- Son objectif (Coran, MSA, conversation)

#### Mode apprentissage

L'app calcule chaque jour les **racines à réviser** selon l'algorithme de répétition espacée. L'utilisateur :
- Voit sa "session du jour" (ex: 5 racines en 10 min)
- Passe par chaque racine en mode flashcard premium
- Évalue sa maîtrise (raté / difficile / bien / parfait)
- Voit son niveau de maîtrise évoluer visuellement

#### Mode découverte

L'utilisateur explore librement, sauvegarde ses racines préférées dans des collections, prend des notes mnémoniques, partage avec la communauté.

#### Tableau de bord

Statistiques visuelles motivantes : streak de jours consécutifs, racines maîtrisées, mots débloqués, heatmap d'activité annuelle, prédictions de progression.

### Pourquoi C'est Addictif

- **Streak quotidien** visualisé (style Duolingo)
- **Niveaux de maîtrise** colorés évolutifs (gris → bleu → vert → doré)
- **Constellation personnelle** qui grandit visuellement
- **Quick wins** : chaque session = au moins 1 racine maîtrisée + animation
- **Sessions courtes** : 10 min/jour suffisent (anti-friction)

---

## 🏗️ Stack Technique

### Backend

```
- Node.js 20+
- Express 4.x
- MongoDB Atlas (free tier)
- Mongoose 8.x
- bcrypt (hashage password)
- jsonwebtoken (JWT)
- joi (validation schemas)
- cors
- helmet (sécurité headers)
- express-rate-limit (rate limiting auth)
- dotenv (variables environnement)
- multer (upload avatars - bonus)
- nodemailer (emails confirmation - bonus)
```

### Frontend

```
- React 18+ avec Vite
- React Router v6
- Tailwind CSS 3.x
- Axios (requêtes HTTP)
- D3.js v7 (visualisations arbres et constellations)
- Framer Motion (animations premium)
- react-i18next (multilingue)
- react-hot-toast (notifications)
- Recharts (graphiques statistiques)
- Lucide React (icônes)
- react-circular-progressbar (anneaux progression)
- date-fns (manipulation dates)
```

### Outils de Développement

```
- Git + GitHub (monorepo unique)
- ESLint + Prettier
- Postman (test API)
- MongoDB Compass (visualisation BDD)
- Vercel/Netlify (frontend deploy)
- Render (backend deploy)
```

---

## 📁 Architecture du Projet (Monorepo)

> **Architecture monorepo** : un seul repository GitHub `arabic-word-root` contenant backend et frontend côte à côte, avec un `package.json` racine pour orchestrer les scripts.

### Structure Globale

```
arabic-word-root/
├── package.json                     # ⭐ Scripts racine (concurrently)
├── .gitignore
├── .env.example
├── README.md
│
├── server/                          # ===== BACKEND =====
│   ├── package.json
│   ├── nodemon.json
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # Connexion MongoDB
│   │   │   └── env.js               # Validation variables env
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Root.js
│   │   │   ├── Word.js
│   │   │   ├── Progress.js
│   │   │   ├── Note.js
│   │   │   └── Collection.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── rootController.js
│   │   │   ├── wordController.js
│   │   │   ├── progressController.js
│   │   │   ├── noteController.js
│   │   │   ├── collectionController.js
│   │   │   └── statsController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── rootRoutes.js
│   │   │   ├── wordRoutes.js
│   │   │   ├── progressRoutes.js
│   │   │   ├── noteRoutes.js
│   │   │   ├── collectionRoutes.js
│   │   │   └── statsRoutes.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js     # Vérification JWT
│   │   │   ├── adminMiddleware.js    # Vérification rôle admin
│   │   │   ├── validateMiddleware.js # Validation Joi générique
│   │   │   └── errorHandler.js       # Gestion centralisée erreurs
│   │   │
│   │   ├── validations/
│   │   │   ├── authValidation.js
│   │   │   ├── rootValidation.js
│   │   │   ├── wordValidation.js
│   │   │   ├── progressValidation.js
│   │   │   ├── noteValidation.js
│   │   │   └── collectionValidation.js
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js                # Génération/vérification tokens
│   │   │   ├── spacedRepetition.js   # Algorithme SM-2 simplifié
│   │   │   └── formatResponse.js     # Format API standardisé
│   │   │
│   │   ├── seeds/
│   │   │   ├── seedRoots.js
│   │   │   ├── seedWords.js
│   │   │   └── data/
│   │   │       ├── roots.json        # Dataset 30+ racines
│   │   │       └── words.json        # Dataset 300+ mots
│   │   │
│   │   └── server.js                 # Entry point
│   │
│   └── .env.example
│
├── client/                           # ===== FRONTEND =====
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   │
│   ├── public/
│   │   └── fonts/                    # Polices arabes (Amiri, Noto Naskh)
│   │
│   └── src/
│       ├── api/
│       │   ├── axiosInstance.js       # Configuration Axios + intercepteurs
│       │   ├── authApi.js
│       │   ├── rootsApi.js
│       │   ├── wordsApi.js
│       │   ├── progressApi.js
│       │   ├── notesApi.js
│       │   └── collectionsApi.js
│       │
│       ├── assets/
│       │   ├── images/
│       │   └── icons/
│       │
│       ├── components/
│       │   ├── common/
│       │   │   ├── Button.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Pagination.jsx
│       │   │   ├── SearchBar.jsx
│       │   │   ├── FilterPanel.jsx
│       │   │   ├── LoadingSpinner.jsx
│       │   │   ├── ErrorMessage.jsx
│       │   │   └── ConfirmDialog.jsx
│       │   │
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── ThemeToggle.jsx
│       │   │   └── LanguageSelector.jsx
│       │   │
│       │   ├── auth/
│       │   │   ├── LoginForm.jsx
│       │   │   ├── RegisterForm.jsx
│       │   │   └── ProtectedRoute.jsx
│       │   │
│       │   ├── roots/
│       │   │   ├── RootCard.jsx
│       │   │   ├── RootTree.jsx      # ⭐ Composant phare D3.js
│       │   │   ├── RootDetail.jsx
│       │   │   ├── RootList.jsx
│       │   │   └── RootFilters.jsx
│       │   │
│       │   ├── words/
│       │   │   ├── WordCard.jsx
│       │   │   ├── WordDetail.jsx
│       │   │   ├── CalligraphyAnimated.jsx
│       │   │   └── PatternVisualizer.jsx
│       │   │
│       │   ├── progress/
│       │   │   ├── ProgressRing.jsx
│       │   │   ├── MasteryBadge.jsx
│       │   │   ├── StreakDisplay.jsx
│       │   │   ├── LearningSession.jsx
│       │   │   └── HeatmapActivity.jsx
│       │   │
│       │   ├── constellation/
│       │   │   └── Constellation.jsx  # ⭐ Visualisation D3
│       │   │
│       │   ├── stats/
│       │   │   ├── StatsCard.jsx
│       │   │   ├── ProgressChart.jsx
│       │   │   └── SemanticDonut.jsx
│       │   │
│       │   ├── notes/
│       │   │   ├── NoteCard.jsx
│       │   │   ├── NoteForm.jsx
│       │   │   └── NotesList.jsx
│       │   │
│       │   └── collections/
│       │       ├── CollectionCard.jsx
│       │       ├── CollectionForm.jsx
│       │       └── CollectionDetail.jsx
│       │
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── ExplorePage.jsx
│       │   ├── RootDetailPage.jsx
│       │   ├── WordDetailPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── LearnPage.jsx
│       │   ├── ConstellationPage.jsx
│       │   ├── NotesPage.jsx
│       │   ├── CollectionsPage.jsx
│       │   ├── CollectionDetailPage.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── CommunityPage.jsx
│       │   └── NotFoundPage.jsx
│       │
│       ├── contexts/
│       │   ├── AuthContext.jsx
│       │   ├── ThemeContext.jsx
│       │   └── LanguageContext.jsx
│       │
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useRoots.js
│       │   ├── useRoot.js
│       │   ├── useProgress.js
│       │   ├── useTodayReview.js
│       │   ├── useTheme.js
│       │   ├── useLanguage.js
│       │   ├── useDebounce.js
│       │   └── useToast.js
│       │
│       ├── utils/
│       │   ├── constants.js
│       │   ├── formatters.js
│       │   ├── validators.js
│       │   └── d3Helpers.js           # Helpers visualisations D3
│       │
│       ├── locales/
│       │   ├── fr.json
│       │   ├── en.json
│       │   └── ar.json
│       │
│       ├── styles/
│       │   ├── globals.css
│       │   └── tailwind.css
│       │
│       ├── App.jsx
│       ├── main.jsx
│       └── i18n.js
│
└── shared/                           # ===== PARTAGÉ (optionnel) =====
    └── constants.js                  # Constantes partagées (enums, etc.)
```

### Package.json Racine (Orchestrateur)

```json
{
  "name": "arabic-word-root",
  "version": "1.0.0",
  "private": true,
  "description": "Monorepo ArabicWordRoot - Apprentissage arabe par racines",
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "install:all": "npm install && cd server && npm install && cd ../client && npm install",
    "build": "cd client && npm run build",
    "start": "cd server && npm start",
    "seed": "cd server && npm run seed",
    "lint": "concurrently \"npm run lint:server\" \"npm run lint:client\"",
    "lint:server": "cd server && npm run lint",
    "lint:client": "cd client && npm run lint"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

---

## 📊 Modèles de Données (MongoDB)

### 1. User (Utilisateur)

```javascript
{
  _id: ObjectId,
  email: String,                    // unique, required, validé
  password: String,                  // hashé bcrypt, required
  username: String,                  // unique, required, 3-30 chars
  avatar: String,                    // URL image (optionnel)
  nativeLanguage: String,            // enum: ['fr', 'en'], default: 'fr'
  learningLevel: String,             // enum: ['beginner', 'intermediate', 'advanced']
  learningGoal: String,              // enum: ['quran', 'msa', 'conversation', 'general']
  preferredTheme: String,            // enum: ['light', 'dark'], default: 'light'
  preferredInterfaceLanguage: String, // enum: ['fr', 'en', 'ar'], default: 'fr'
  role: String,                      // enum: ['user', 'admin'], default: 'user'
  streak: {
    current: Number,                 // streak actuel en jours
    longest: Number,                 // record perso
    lastActivityDate: Date
  },
  totalRootsLearned: Number,         // compteur dénormalisé
  totalWordsLearned: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Root (Racine)

```javascript
{
  _id: ObjectId,
  letters: String,                   // ex: "ك-ت-ب", required, unique
  lettersArray: [String],            // ex: ["ك", "ت", "ب"] pour faciliter recherche
  transliteration: String,           // ex: "k-t-b"
  coreMeaning: {
    fr: String,                      // ex: "écriture, action d'écrire"
    en: String                       // ex: "writing, act of writing"
  },
  semanticField: String,             // enum: ['knowledge', 'action', 'place', 'emotion', 'movement', 'time', 'social', 'nature', 'body', 'spiritual']
  frequency: Number,                 // occurrences dans corpus de référence
  difficulty: Number,                // 1-5
  isEssential: Boolean,              // racines fondamentales (top 100)
  isQuranic: Boolean,                // présente dans le Coran
  metadata: {
    quranOccurrences: Number,
    msaFrequencyRank: Number
  },
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Word (Mot dérivé)

```javascript
{
  _id: ObjectId,
  arabicWord: String,                // ex: "كِتَاب", required, vocalisé
  arabicWordUnvocalized: String,     // ex: "كتاب", pour recherche
  transliteration: String,           // ex: "kitāb"
  translations: {
    fr: String,                      // ex: "livre"
    en: String                       // ex: "book"
  },
  root: { type: ObjectId, ref: 'Root', required: true }, // ⭐ RELATION
  pattern: String,                   // wazn, ex: "فِعَال"
  patternDescription: {
    fr: String,                      // ex: "schéma de noms abstraits"
    en: String
  },
  grammaticalCategory: String,       // enum: ['verb', 'noun', 'adjective', 'place', 'agent', 'instrument', 'verbal_noun', 'participle']
  examples: [{
    sentence: String,                // phrase complète vocalisée
    translation: { fr: String, en: String }
  }],
  difficulty: Number,                // 1-5
  isCommon: Boolean,                 // mots les plus fréquents
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Progress (Progression utilisateur)

```javascript
{
  _id: ObjectId,
  user: { type: ObjectId, ref: 'User', required: true },     // ⭐ RELATION
  root: { type: ObjectId, ref: 'Root', required: true },     // ⭐ RELATION
  masteryLevel: Number,              // 0-5: nouveau → permanent
  wordsLearned: [{ type: ObjectId, ref: 'Word' }],          // ⭐ RELATION
  reviewCount: Number,               // nb total de révisions
  successCount: Number,
  failureCount: Number,
  successRate: Number,               // calculé en pourcentage
  lastReviewed: Date,
  nextReviewDate: Date,              // calculé par algo répétition espacée
  intervalDays: Number,              // intervalle actuel
  easinessFactor: Number,            // facteur SM-2, default 2.5
  notes: String,                     // notes rapides sur cette racine
  createdAt: Date,
  updatedAt: Date
}

// Index unique composé : { user: 1, root: 1 }
```

### 5. Note (Note personnelle)

```javascript
{
  _id: ObjectId,
  user: { type: ObjectId, ref: 'User', required: true },     // ⭐ RELATION
  targetType: String,                // enum: ['Root', 'Word'], required
  target: {                          // ref dynamique avec refPath
    type: ObjectId,
    refPath: 'targetType',
    required: true
  },
  content: String,                   // texte libre, max 1000 chars, required
  type: String,                      // enum: ['mnemonic', 'context', 'cultural', 'grammar', 'general']
  isPublic: Boolean,                 // default: false
  likes: [{ type: ObjectId, ref: 'User' }],                 // ⭐ RELATION
  likesCount: Number,                // dénormalisé pour tri
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Collection (Liste thématique)

```javascript
{
  _id: ObjectId,
  user: { type: ObjectId, ref: 'User', required: true },     // ⭐ RELATION
  name: String,                      // ex: "Racines essentielles du Coran", max 100
  description: String,               // max 500
  roots: [{ type: ObjectId, ref: 'Root' }],                 // ⭐ RELATION
  isPublic: Boolean,                 // default: false
  coverColor: String,                // hex color pour identité visuelle
  icon: String,                      // emoji ou nom icône Lucide
  followers: [{ type: ObjectId, ref: 'User' }],
  createdAt: Date,
  updatedAt: Date
}
```

### Relations Populate Principales

| Modèle | Champ | Relation |
|--------|-------|----------|
| Word | root | populate Root |
| Progress | user | populate User |
| Progress | root | populate Root |
| Progress | wordsLearned | populate Words[] |
| Note | target | populate Root ou Word (refPath) |
| Note | user | populate User |
| Collection | user | populate User |
| Collection | roots | populate Roots[] |

---

## 🛣️ API Backend (Express)

### Conventions Générales

- Tous les endpoints retournent du JSON
- Format de réponse standardisé :
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Optional message",
    "pagination": { "page": 1, "limit": 20, "total": 100 }
  }
  ```
- Codes HTTP appropriés : 200, 201, 400, 401, 403, 404, 500
- Validation Joi sur toutes les routes POST/PUT/PATCH
- Tous les passwords hashés bcrypt (10 salt rounds)
- JWT signé avec secret env, expiration 7 jours

### Routes Publiques

#### Authentification

```
POST   /api/auth/register
       Body: { email, password, username, nativeLanguage, learningLevel }
       Response: 201 { user, token }

POST   /api/auth/login
       Body: { email, password }
       Response: 200 { user, token }

POST   /api/auth/forgot-password    (bonus)
       Body: { email }
       Response: 200 { message }
```

#### Racines

```
GET    /api/roots
       Query: page, limit, search, semanticField, difficulty,
              isEssential, isQuranic, sort
       Response: 200 { roots[], pagination }

GET    /api/roots/:id
       Response: 200 { root, words[] }

GET    /api/roots/essential
       Response: 200 { roots[] }

GET    /api/roots/search?q=xxx
       Response: 200 { roots[] }
```

#### Mots

```
GET    /api/words/:id
       Response: 200 { word }

GET    /api/words/by-root/:rootId
       Query: page, limit
       Response: 200 { words[], pagination }
```

#### Collections publiques

```
GET    /api/collections/public
       Query: page, limit, sort
       Response: 200 { collections[], pagination }

GET    /api/collections/:id
       Response: 200 { collection } (si public ou propriétaire)
```

#### Notes publiques

```
GET    /api/notes/public
       Query: page, limit, sort, type
       Response: 200 { notes[], pagination }
```

### Routes Protégées (JWT requis)

#### Profil

```
GET    /api/auth/me
       Response: 200 { user }

PUT    /api/auth/me
       Body: { username?, avatar?, preferredTheme?, ... }
       Response: 200 { user }

PUT    /api/auth/password
       Body: { currentPassword, newPassword }
       Response: 200 { message }

POST   /api/auth/logout
       Response: 200 { message }
```

#### Progression

```
GET    /api/progress
       Query: page, limit, masteryLevel
       Response: 200 { progress[], pagination }

GET    /api/progress/today
       Response: 200 { rootsToReview[] } // racines dues aujourd'hui

GET    /api/progress/stats
       Response: 200 { totalLearned, streak, weeklyActivity, ... }

POST   /api/progress
       Body: { rootId, masteryLevel, success: boolean }
       Response: 201 { progress }

PUT    /api/progress/:id
       Body: { masteryLevel, success: boolean }
       Response: 200 { progress } // recalcule nextReviewDate

DELETE /api/progress/:id
       Response: 200 { message }
```

#### Notes (CRUD complet)

```
GET    /api/notes
       Query: page, limit, targetType, type
       Response: 200 { notes[], pagination }

GET    /api/notes/:id
       Response: 200 { note }

POST   /api/notes
       Body: { targetType, targetId, content, type, isPublic }
       Response: 201 { note }

PUT    /api/notes/:id
       Body: { content?, type?, isPublic? }
       Response: 200 { note }

DELETE /api/notes/:id
       Response: 200 { message }

POST   /api/notes/:id/like
       Response: 200 { likesCount }
```

#### Collections (CRUD complet)

```
GET    /api/collections
       Query: page, limit
       Response: 200 { collections[], pagination }

GET    /api/collections/:id
       Response: 200 { collection } // populate roots

POST   /api/collections
       Body: { name, description, coverColor, icon, isPublic, roots? }
       Response: 201 { collection }

PUT    /api/collections/:id
       Body: { name?, description?, coverColor?, icon?, isPublic? }
       Response: 200 { collection }

DELETE /api/collections/:id
       Response: 200 { message }

POST   /api/collections/:id/roots
       Body: { rootIds: [] }
       Response: 200 { collection }

DELETE /api/collections/:id/roots/:rootId
       Response: 200 { collection }
```

#### Constellation & Stats

```
GET    /api/constellation
       Response: 200 { nodes[], links[] } // données pour D3 force-directed graph

GET    /api/stats
       Response: 200 {
         totalRootsLearned, totalWordsLearned,
         streak: { current, longest },
         weeklyActivity: [],
         monthlyActivity: [],
         masteryDistribution: {},
         semanticFieldDistribution: {},
         heatmap: []
       }
```

### Routes Admin (rôle admin requis)

```
POST   /api/admin/roots
PUT    /api/admin/roots/:id
DELETE /api/admin/roots/:id

POST   /api/admin/words
PUT    /api/admin/words/:id
DELETE /api/admin/words/:id

GET    /api/admin/users
PUT    /api/admin/users/:id/role
```

---

## 🖥️ Frontend React

### Pages & Routes (React Router)

#### Routes Publiques

| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | `LandingPage` | Hero animé + démo interactive |
| `/login` | `LoginPage` | Connexion |
| `/register` | `RegisterPage` | Inscription |
| `/explore` | `ExplorePage` | Catalogue racines (sans compte) |
| `/roots/:id` | `RootDetailPage` | Détail racine + arbre interactif |
| `/words/:id` | `WordDetailPage` | Détail mot |

#### Routes Protégées

| Route | Composant | Description |
|-------|-----------|-------------|
| `/dashboard` | `DashboardPage` | Tableau de bord stats |
| `/learn` | `LearnPage` | Mode apprentissage du jour |
| `/constellation` | `ConstellationPage` | Constellation personnelle |
| `/notes` | `NotesPage` | Mes notes |
| `/collections` | `CollectionsPage` | Mes collections |
| `/collections/:id` | `CollectionDetailPage` | Détail collection |
| `/profile` | `ProfilePage` | Paramètres |
| `/community` | `CommunityPage` | Notes/collections publiques |

### Composants Clés

#### `<RootTree />` - Le Composant Phare

Visualisation D3.js radiale interactive d'une racine et ses mots dérivés.

**Props :**
- `root: Root` - L'objet racine
- `words: Word[]` - Mots dérivés
- `onWordClick: (word) => void` - Callback clic
- `interactive: boolean` - Mode lecture vs édition

**Comportement :**
- Racine au centre (cercle) avec lettres en grosse calligraphie
- Branches partant en étoile (radial layout D3)
- Couleurs par catégorie grammaticale
- Animation de déploiement progressif (Framer Motion)
- Hover : agrandissement + tooltip avec traduction et translittération
- Clic : ouverture panneau détaillé latéral
- Zoom et pan possibles
- Animation continue subtile (rotation très lente)

#### `<Constellation />` - Visualisation Globale

Force-directed graph D3 de toutes les racines maîtrisées par l'utilisateur.

**Comportement :**
- Chaque racine = un nœud
- Liens entre racines du même champ sémantique
- Couleurs selon niveau de maîtrise
- Filtres (par champ, par date d'apprentissage)
- Zoom infini
- Animations physiques fluides

#### `<CalligraphyAnimated />` - Tracé Animé

Animation SVG du tracé d'un mot arabe.

**Comportement :**
- SVG paths préparés
- `stroke-dasharray` + `stroke-dashoffset` pour effet écriture
- Bouton replay
- Vitesse ajustable

#### `<PatternVisualizer />` - Schéma Grammatical

Visualisation animée d'un wazn (ex: فاعل → كاتب).

**Comportement :**
- 2 colonnes : pattern abstrait et mot concret
- Flèches animées montrant l'insertion des consonnes racine dans le moule
- Couleurs distinctes pour racine vs schéma

#### `<LearningSession />` - Mode Flashcard Premium

Interface de révision quotidienne.

**Comportement :**
- Une racine à la fois en plein écran
- Animation de retournement carte 3D
- 4 boutons d'évaluation (raté/difficile/bien/parfait)
- Compteur de progression
- Confettis (canvas-confetti) sur réussite
- Animation finale de session avec stats

### Hooks Personnalisés

#### `useAuth()`

```javascript
const { user, login, logout, register, isAuthenticated, loading } = useAuth();
```

#### `useRoots(filters)`

```javascript
const { roots, loading, error, pagination, refetch } = useRoots({
  search, semanticField, difficulty, page, limit
});
```

#### `useTodayReview()`

```javascript
const { rootsToReview, loading, markAsReviewed } = useTodayReview();
```

#### `useTheme()`

```javascript
const { theme, toggleTheme, setTheme } = useTheme();
// Persistance localStorage
```

#### `useLanguage()`

```javascript
const { language, changeLanguage, isRTL } = useLanguage();
// Gère aussi le RTL pour l'arabe
```

#### `useDebounce(value, delay)`

```javascript
const debouncedSearch = useDebounce(searchTerm, 500);
```

### Contextes Globaux

#### `AuthContext`

```javascript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  login: (credentials) => Promise,
  logout: () => void,
  register: (data) => Promise,
  updateUser: (updates) => Promise
}
```

#### `ThemeContext`

```javascript
{
  theme: 'light' | 'dark',
  toggleTheme: () => void
}
```

#### `LanguageContext`

```javascript
{
  language: 'fr' | 'en' | 'ar',
  changeLanguage: (lang) => void,
  isRTL: boolean,
  t: (key) => string  // helper i18next
}
```

---

## ⚙️ Fonctionnalités Métier

### 1. Visualisation Interactive des Arbres de Racines

**Description :** Composant central de l'application. Affichage radial D3 d'une racine et ses dérivés.

**Détails techniques :**
- Layout D3 : `d3.tree()` avec configuration radiale ou `d3.forceSimulation()`
- Animations d'entrée : Framer Motion + D3 transitions
- Interactions : zoom, pan, clic, hover
- Performance : virtualization si >50 mots
- Responsive : adaptation mobile (vertical sur petits écrans)

### 2. Algorithme de Répétition Espacée

**Description :** Adaptation simplifiée de SM-2 (SuperMemo) appliquée aux racines.

**Logique :**

```
masteryLevel 0 (nouveau) :
  - Si succès : +1 niveau, intervalDays = 1
  - Si échec : reste 0, intervalDays = 1

masteryLevel 1 (apprenant) :
  - Si succès : +1 niveau, intervalDays = 3
  - Si échec : -1 niveau, intervalDays = 1

masteryLevel 2 (familier) :
  - Si succès : +1 niveau, intervalDays = 7
  - Si échec : -1 niveau

masteryLevel 3 (connu) :
  - Si succès : +1 niveau, intervalDays = 14
  - Si échec : -1 niveau

masteryLevel 4 (maîtrisé) :
  - Si succès : +1 niveau, intervalDays = 30
  - Si échec : -1 niveau

masteryLevel 5 (permanent) :
  - intervalDays = 90 (révision occasionnelle)

nextReviewDate = lastReviewed + intervalDays
```

**Bonus :** Ajustement du easinessFactor selon historique de réussite.

### 3. Mode Apprentissage Quotidien

**Flow :**

1. L'app calcule `rootsToReview` = roots dont `nextReviewDate <= today`
2. Si l'utilisateur n'a aucune racine en révision et veut apprendre, l'app suggère 5 nouvelles racines
3. Présentation séquentielle, une racine à la fois
4. Pour chaque racine :
   - Affichage de la racine (3 lettres)
   - Question : "Que signifie cette racine ?" ou "Quel mot vient de cette racine ?"
   - Bouton "Voir la réponse"
   - Réponse + arbre visuel + translittération
   - 4 boutons d'évaluation
5. À la fin : écran de résumé avec stats animées

### 4. Constellation Personnelle

**Description :** Visualisation force-directed graph D3 de toute la progression de l'utilisateur.

**Calcul :**
- Nodes = racines apprises (masteryLevel >= 1)
- Links entre racines du même semanticField
- Taille du node = masteryLevel
- Couleur = champ sémantique
- Animation physique fluide

**Interactions :**
- Drag des nodes
- Hover : highlight + infos
- Clic : ouverture détail racine
- Filtres : par champ, par niveau, par date

### 5. Recherche Avancée Multi-Filtres

**Filtres disponibles :**
- Recherche textuelle (translittération, traduction, sens)
- Lettre commençante (28 lettres arabes)
- Champ sémantique (knowledge, action, place...)
- Difficulté (1-5)
- Statut perso (apprises, à apprendre, ratées récemment)
- Fréquence (très commun, commun, rare)
- Coranique (oui/non)

**Tri :**
- Alphabétique
- Difficulté
- Fréquence
- Date d'ajout
- Mon niveau de maîtrise

### 6. Pagination

**Implémentation :**
- Pagination côté serveur (limit + skip)
- Composant `<Pagination />` réutilisable
- Pages : 1, 2, 3 ... N
- Limit par défaut : 20 items
- URL avec query params (`?page=2`)

### 7. Système Multilingue (i18n)

**Langues supportées :**
- Français (par défaut)
- English
- العربية (avec RTL natif)

**Implémentation :**
- react-i18next avec fichiers JSON
- Interface complètement traduite
- Traductions des mots dans la langue choisie
- Switch dynamique sans rechargement
- Détection automatique langue navigateur
- Persistance choix utilisateur (localStorage + DB)

### 8. Thème Dark/Light

**Implémentation :**
- CSS variables (`--bg`, `--text`, `--primary`...)
- Tailwind config avec `darkMode: 'class'`
- ThemeContext avec persistance localStorage
- Animation de transition fluide
- Préférence système détectée par défaut
- Couleurs sémantiques restent constantes (verbes bleu, etc.)

### 9. Notes & Collections (CRUD complet)

**Notes :**
- Texte mnémonique sur une racine ou un mot
- Types : mnemonic, context, cultural, grammar, general
- Privées par défaut, partage public optionnel
- Likes communautaires
- Recherche dans ses notes

**Collections :**
- Listes thématiques de racines
- Personnalisation (nom, description, couleur, icône)
- Privées ou publiques
- Suivi de collections d'autres utilisateurs

### 10. Statistiques Personnelles

**Dashboard contient :**

- **Compteurs animés** (react-countup)
  - Racines apprises
  - Mots maîtrisés
  - Streak actuel
  - Temps total appris

- **Heatmap annuelle** (style GitHub contributions)
  - Activité jour par jour
  - Couleurs progressives selon intensité
  - Tooltips au survol

- **Graphiques (Recharts)**
  - Line chart : progression dans le temps
  - Donut : répartition par champ sémantique
  - Bar chart : activité hebdomadaire
  - Radar : niveau par compétence

- **Progress rings**
  - Objectif quotidien (style Apple Watch)
  - Niveau global
  - Couverture des essentielles

---

## 🎨 Système de Design

### Palette de Couleurs

#### Light Mode

```
--bg-primary:     #fafaf9    // Background principal (off-white chaud)
--bg-secondary:   #f5f5f4    // Sections secondaires
--bg-card:        #ffffff    // Cards
--text-primary:   #1f2937    // Texte principal
--text-secondary: #6b7280    // Texte secondaire
--text-muted:     #9ca3af    // Texte estompé
--primary:        #1e40af    // Bleu profond (actions)
--primary-hover:  #1e3a8a
--accent:         #d4a574    // Doré (calligraphie, cultural)
--success:        #10b981
--warning:        #f59e0b
--error:          #e23923    // Couleur erreur exigée par CDC
--border:         #e5e7eb
```

#### Dark Mode

```
--bg-primary:     #0a0a0f    // Noir nuit étoilée
--bg-secondary:   #14141f
--bg-card:        #1a1a2e
--text-primary:   #f3f4f6
--text-secondary: #d1d5db
--text-muted:     #9ca3af
--primary:        #60a5fa    // Bleu lumineux
--primary-hover:  #93c5fd
--accent:         #fbbf24    // Doré chaud
--success:        #34d399
--warning:        #fbbf24
--error:          #ef4444
--border:         #2d2d44
```

#### Couleurs Sémantiques (Catégories Grammaticales)

```
--cat-verb:        #3b82f6   // Bleu - Verbes
--cat-noun:        #10b981   // Vert - Noms
--cat-adjective:   #f59e0b   // Jaune - Adjectifs
--cat-place:       #f97316   // Orange - Lieux
--cat-agent:       #ef4444   // Rouge - Agents (ceux qui font)
--cat-instrument:  #8b5cf6   // Violet - Instruments
--cat-vnoun:       #ec4899   // Rose - Noms verbaux
--cat-participle:  #06b6d4   // Cyan - Participes
```

### Typographie

```
Font UI :        'Inter', sans-serif
Font Arabic :    'Amiri', 'Noto Naskh Arabic', serif
Font Display :   'Cinzel', serif (titres élégants)

Scales :
  text-xs:   0.75rem
  text-sm:   0.875rem
  text-base: 1rem
  text-lg:   1.125rem
  text-xl:   1.25rem
  text-2xl:  1.5rem
  text-3xl:  1.875rem
  text-4xl:  2.25rem
  text-5xl:  3rem        // Titres landing
  text-6xl:  3.75rem     // Calligraphie racines (3 lettres)
  text-7xl:  4.5rem      // Hero racine
```

### Spacing & Layout

```
Container max-width: 1280px
Sidebar width: 280px
Card padding: 1.5rem (24px)
Section spacing: 4rem (64px)
Border radius:
  - sm: 0.375rem (boutons)
  - md: 0.5rem  (inputs)
  - lg: 0.75rem (cards)
  - xl: 1rem    (modals)
  - full: 9999px (pills, avatars)
```

### Animations (Framer Motion)

#### Transitions globales

```javascript
// Apparition de page
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: "easeOut" }}

// Apparition de carte
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.3 }}

// Stagger pour listes
variants={{
  visible: {
    transition: { staggerChildren: 0.05 }
  }
}}
```

#### Animations spécifiques

- **RootTree déploiement :** branches qui apparaissent une par une (0.1s delay)
- **Calligraphie :** stroke-dashoffset de length à 0 (1.5s)
- **Compteurs stats :** countUp from 0 to value (2s ease-out)
- **Hover cards :** scale 1.02 + shadow boost (0.2s)
- **Loading skeleton :** shimmer effect (1.5s loop)
- **Toast notifications :** slide-in from top + fade-out (3s total)
- **Confetti victory :** canvas-confetti burst (1s)

### Iconographie

Bibliothèque : **Lucide React**

Icônes principales utilisées :
- `BookOpen` - Apprentissage
- `Sparkles` - Découverte
- `TrendingUp` - Progression
- `Target` - Objectifs
- `Star` - Favoris
- `Bookmark` - Sauvegardes
- `MessageCircle` - Notes
- `Layers` - Collections
- `Search` - Recherche
- `Filter` - Filtres
- `Sun` / `Moon` - Theme toggle
- `Globe` - Langue
- `User` - Profil
- `LogOut` - Déconnexion
- `RotateCw` - Replay

### Responsive Design

```
Breakpoints Tailwind :
  sm:  640px   (tablette portrait)
  md:  768px   (tablette paysage)
  lg:  1024px  (desktop)
  xl:  1280px  (large desktop)
  2xl: 1536px  (très large)
```

#### Adaptations mobiles clés

- **Navbar :** burger menu + drawer
- **Sidebar :** drawer mobile, fixed desktop
- **RootTree :** layout vertical sur mobile, radial sur desktop
- **Tables stats :** cards stackées sur mobile
- **Modals :** plein écran sur mobile, centrés sur desktop
- **Forms :** champs full-width sur mobile

---

## 🔐 Sécurité & Validation

### Validation Backend (Joi)

#### authValidation.js

```javascript
registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'Le mot de passe doit contenir majuscule, minuscule et chiffre'
    }),
  username: Joi.string().alphanum().min(3).max(30).required(),
  nativeLanguage: Joi.string().valid('fr', 'en').default('fr'),
  learningLevel: Joi.string().valid('beginner', 'intermediate', 'advanced').default('beginner')
})

loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})
```

#### rootValidation.js

```javascript
createRootSchema = Joi.object({
  letters: Joi.string().required().length(5), // ex: "ك-ت-ب" = 5 chars (3 lettres + 2 tirets)
  transliteration: Joi.string().required(),
  coreMeaning: Joi.object({
    fr: Joi.string().required(),
    en: Joi.string().required()
  }).required(),
  semanticField: Joi.string().valid(
    'knowledge', 'action', 'place', 'emotion',
    'movement', 'time', 'social', 'nature', 'body', 'spiritual'
  ).required(),
  difficulty: Joi.number().integer().min(1).max(5).default(3),
  isEssential: Joi.boolean().default(false),
  isQuranic: Joi.boolean().default(false)
})
```

#### progressValidation.js

```javascript
createProgressSchema = Joi.object({
  rootId: Joi.string().hex().length(24).required(), // ObjectId valide
  masteryLevel: Joi.number().integer().min(0).max(5).default(0),
  success: Joi.boolean().required()
})
```

### Middleware d'Authentification

```javascript
// authMiddleware.js
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};
```

### Sécurité Globale

- **Bcrypt** : 10 salt rounds pour hashage passwords
- **JWT** : signé avec `JWT_SECRET` (env), expiration 7 jours
- **Helmet** : headers HTTP sécurisés
- **CORS** : whitelist du domaine frontend uniquement
- **Rate limiting** : 5 tentatives/15min sur `/api/auth/login`
- **Mongoose strict mode** : rejette champs non définis
- **Validation Joi** : avant chaque controller
- **Sanitization** : protection contre injection NoSQL (express-mongo-sanitize)
- **HTTPS** : obligatoire en production
- **Environment variables** : jamais commitées (.env dans .gitignore)

### Variables d'Environnement (.env)

```bash
# Racine ou server/.env
NODE_ENV=development
PORT=5000
DB_URI=mongodb+srv://...
JWT_SECRET=very_long_random_string_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
BCRYPT_ROUNDS=10

# Bonus
CLOUDINARY_URL=...
NODEMAILER_USER=...
NODEMAILER_PASS=...
```

```bash
# client/.env
VITE_API_URL=http://localhost:5000/api
VITE_DEFAULT_LANGUAGE=fr
```

---

## 📦 Préparation des Données (Seed)

### Phase 1 : MVP (30 racines essentielles)

#### Champs sémantiques à couvrir

| Champ | Exemples de racines |
|-------|---------------------|
| **Knowledge (savoir)** | ع-ل-م, د-ر-س, ف-ه-م, ق-ر-أ, ك-ت-ب |
| **Action (action)** | ف-ع-ل, ع-م-ل, ج-ع-ل, ص-ن-ع |
| **Communication** | ق-و-ل, س-م-ع, ك-ل-م, ن-ط-ق |
| **Movement (mouvement)** | م-ش-ي, ذ-ه-ب, ر-ج-ع, د-خ-ل, خ-ر-ج |
| **Body/Life** | أ-ك-ل, ش-ر-ب, ن-و-م, ح-ي-ي |
| **Emotion** | ح-ب-ب, ك-ر-ه, ف-ر-ح, ح-ز-ن |
| **Time** | ي-و-م, ل-ي-ل, ز-م-ن |
| **Spiritual** | إ-ل-ه, ر-ب-ب, ذ-ك-ر, ع-ب-د |
| **Place** | م-ك-ن, ب-ي-ت |
| **Social** | أ-ه-ل, ص-د-ق |

### Sources de Données

#### Pour les racines

- **Quranic Arabic Corpus** ([corpus.quran.com](http://corpus.quran.com)) - Open data, racines avec fréquences
- **Wiktionary** - Open data, racines + dérivés
- **Hans Wehr Dictionary** - Référence académique (data extractable)

#### Pour les traductions

- Traductions FR : Larousse, Reverso (curation manuelle)
- Traductions EN : Hans Wehr, Wehr-Cowan dictionary

### Format du Seed

#### `roots.json` (extrait)

```json
[
  {
    "letters": "ك-ت-ب",
    "lettersArray": ["ك", "ت", "ب"],
    "transliteration": "k-t-b",
    "coreMeaning": {
      "fr": "écriture, action d'écrire, fixer par écrit",
      "en": "writing, act of writing, putting in writing"
    },
    "semanticField": "knowledge",
    "frequency": 319,
    "difficulty": 1,
    "isEssential": true,
    "isQuranic": true,
    "metadata": {
      "quranOccurrences": 319,
      "msaFrequencyRank": 12
    }
  },
  {
    "letters": "ع-ل-م",
    "lettersArray": ["ع", "ل", "م"],
    "transliteration": "ʿ-l-m",
    "coreMeaning": {
      "fr": "savoir, connaissance, science",
      "en": "knowing, knowledge, science"
    },
    "semanticField": "knowledge",
    "frequency": 854,
    "difficulty": 1,
    "isEssential": true,
    "isQuranic": true,
    "metadata": {
      "quranOccurrences": 854,
      "msaFrequencyRank": 5
    }
  }
]
```

#### `words.json` (extrait pour ك-ت-ب)

```json
[
  {
    "rootLetters": "ك-ت-ب",
    "arabicWord": "كَتَبَ",
    "arabicWordUnvocalized": "كتب",
    "transliteration": "kataba",
    "translations": {
      "fr": "il a écrit",
      "en": "he wrote"
    },
    "pattern": "فَعَلَ",
    "patternDescription": {
      "fr": "Verbe à la 3e personne du masculin singulier au passé",
      "en": "Verb 3rd person masculine singular past tense"
    },
    "grammaticalCategory": "verb",
    "examples": [
      {
        "sentence": "كَتَبَ الطَّالِبُ الدَّرْسَ",
        "translation": {
          "fr": "L'étudiant a écrit la leçon",
          "en": "The student wrote the lesson"
        }
      }
    ],
    "difficulty": 1,
    "isCommon": true
  },
  {
    "rootLetters": "ك-ت-ب",
    "arabicWord": "كِتَاب",
    "arabicWordUnvocalized": "كتاب",
    "transliteration": "kitāb",
    "translations": {
      "fr": "livre",
      "en": "book"
    },
    "pattern": "فِعَال",
    "grammaticalCategory": "noun",
    "examples": [
      {
        "sentence": "هَذَا كِتَابٌ مُفِيدٌ",
        "translation": {
          "fr": "C'est un livre utile",
          "en": "This is a useful book"
        }
      }
    ],
    "difficulty": 1,
    "isCommon": true
  }
]
```

### Effort Estimé

- **30 racines × 10-15 mots = 300-450 mots à préparer**
- Temps estimé : 3-4 jours de travail data
- Outils suggérés : Excel/Google Sheets pour organiser, puis export JSON
- Priorité : commencer par les 10 racines les plus fréquentes

### Phase 2 : Post-MVP (Extension)

- 50 racines additionnelles (top 80 du Coran)
- Exemples additionnels en contexte
- Étymologies historiques

---

## 📅 Planning de Développement

### Vue d'ensemble : 8 semaines

```
Semaine 1  : Setup Monorepo & Auth
Semaine 2  : CRUD & Données
Semaine 3  : Visualisation Arbre (D3)
Semaine 4  : Progression Utilisateur
Semaine 5  : Constellation & Filtres
Semaine 6  : Polish UX (i18n, Dark mode, animations)
Semaine 7  : Features Sociales & Tests
Semaine 8  : Déploiement & Démo
```

### Détail Semaine par Semaine

#### Semaine 1 : Setup Monorepo & Auth (Foundation)

**Objectifs :** Bases solides de l'application dans un monorepo

**Monorepo :**
- ☐ Init repo unique `arabic-word-root` sur GitHub
- ☐ Créer `package.json` racine avec `concurrently`
- ☐ Créer dossiers `server/` et `client/`
- ☐ Configurer `.gitignore` global (node_modules, .env, dist)
- ☐ Script `npm run dev` qui lance backend + frontend simultanément

**Backend (server/) :**
- ☐ Init Node.js + Express dans `server/`
- ☐ Configuration MongoDB Atlas
- ☐ Création modèles Mongoose (User, Root, Word skeleton)
- ☐ Routes auth (register, login, me, logout)
- ☐ Middleware authentification JWT
- ☐ Middleware validation Joi
- ☐ Configuration .env + dotenv
- ☐ Tests Postman des routes auth

**Frontend (client/) :**
- ☐ Init projet Vite + React + Tailwind dans `client/`
- ☐ Configuration React Router (routes principales)
- ☐ AuthContext + ThemeContext + LanguageContext
- ☐ Composants common (Button, Input, Modal, etc.)
- ☐ Pages Login + Register fonctionnelles
- ☐ Hook useAuth
- ☐ Configuration Axios + intercepteurs
- ☐ ProtectedRoute component

**Livrable :** Utilisateur peut s'inscrire, se connecter, accéder à un dashboard vide. Un seul `npm run dev` lance tout.

---

#### Semaine 2 : CRUD & Données (Core)

**Objectifs :** Données en place, premières interactions

**Backend :**
- ☐ Modèles complets (Root, Word, Progress, Note, Collection)
- ☐ Validation Joi sur tous les modèles
- ☐ Routes CRUD Roots (admin + public lecture)
- ☐ Routes CRUD Words
- ☐ Routes CRUD Notes (toutes opérations)
- ☐ Routes CRUD Collections (toutes opérations)
- ☐ Pagination implémentée
- ☐ Recherche basique sur Roots

**Frontend :**
- ☐ Page Explore avec liste racines paginée
- ☐ Composant RootCard
- ☐ SearchBar fonctionnelle
- ☐ Page RootDetail (sans visualisation D3 encore, juste data)
- ☐ Composant WordCard
- ☐ Hook useRoots, useRoot

**Data :**
- ☐ Seed script créé dans `server/src/seeds/`
- ☐ 10 premières racines préparées avec leurs mots
- ☐ Import en BDD validé

**Livrable :** Utilisateur peut parcourir les racines, voir leurs mots dérivés en liste classique.

---

#### Semaine 3 : Visualisation Arbre (Le Wow)

**Objectifs :** La feature signature

**Frontend :**
- ☐ Étude D3.js radial tree layout
- ☐ Composant `<RootTree />` v1 (statique)
- ☐ Animation de déploiement Framer Motion
- ☐ Couleurs par catégorie grammaticale
- ☐ Hover interactions + tooltips
- ☐ Clic → panneau latéral détail
- ☐ Composant `<CalligraphyAnimated />` (SVG paths)
- ☐ Composant `<PatternVisualizer />` pour les wazn
- ☐ Responsive (vertical mobile, radial desktop)

**Data :**
- ☐ 20 racines additionnelles (total 30)
- ☐ SVG paths préparés pour mots clés

**Livrable :** L'utilisateur clique sur une racine et voit l'arbre interactif magnifique. Le moment magique.

---

#### Semaine 4 : Progression Utilisateur (Apprentissage)

**Objectifs :** Boucle pédagogique active

**Backend :**
- ☐ Routes CRUD Progress complètes
- ☐ Algorithme répétition espacée (utils/spacedRepetition.js)
- ☐ Calcul `nextReviewDate` automatique
- ☐ Route `GET /api/progress/today`
- ☐ Route `GET /api/progress/stats`

**Frontend :**
- ☐ Page Dashboard avec stats basiques
- ☐ Composant `<ProgressRing />`
- ☐ Composant `<MasteryBadge />`
- ☐ Composant `<StreakDisplay />`
- ☐ Page Learn (mode apprentissage)
- ☐ Composant `<LearningSession />` (flashcards)
- ☐ Animation 3D flip cards
- ☐ 4 boutons d'évaluation
- ☐ Confettis sur réussite (canvas-confetti)
- ☐ Hook useProgress, useTodayReview

**Livrable :** L'utilisateur peut faire sa session quotidienne, voir sa progression évoluer.

---

#### Semaine 5 : Constellation & Filtres (Découverte)

**Objectifs :** Visualisation globale + recherche puissante

**Backend :**
- ☐ Route `GET /api/constellation`
- ☐ Recherche avancée multi-filtres sur Roots
- ☐ Optimisation requêtes (indexes MongoDB)

**Frontend :**
- ☐ Composant `<Constellation />` (D3 force-directed)
- ☐ Page Constellation avec filtres
- ☐ Composant `<FilterPanel />` complet
- ☐ Recherche avec autocomplete (debounce)
- ☐ Page Notes complète (CRUD)
- ☐ Page Collections complète (CRUD)
- ☐ ConfirmDialog pour suppressions

**Livrable :** Utilisateur a une vraie expérience de découverte et de recherche.

---

#### Semaine 6 : Polish UX (Premium Feel)

**Objectifs :** Design premium et internationalisation

**Frontend :**
- ☐ Dark mode complet (toutes les pages)
- ☐ CSS variables et Tailwind config dark
- ☐ Multilingue FR/EN/AR avec react-i18next
- ☐ Fichiers de traduction complets
- ☐ Switch langue dynamique
- ☐ RTL pour arabe (auto)
- ☐ Polices arabes (Amiri/Noto Naskh)
- ☐ Toast notifications partout (react-hot-toast)
- ☐ États loading skeletons
- ☐ Gestion erreurs avec couleur #e23923
- ☐ Animations de transition entre pages
- ☐ Micro-interactions (hover, focus, active)
- ☐ Responsive mobile complet

**Livrable :** Application qui ressemble à un vrai produit premium.

---

#### Semaine 7 : Features Sociales & Tests (Communauté)

**Objectifs :** Dimension sociale + qualité

**Backend :**
- ☐ Route notes publiques avec pagination
- ☐ Route collections publiques
- ☐ Route like/unlike notes
- ☐ Tests des cas limites (validation erreurs)

**Frontend :**
- ☐ Page Community (notes/collections publiques)
- ☐ Like sur notes
- ☐ Profile public utilisateurs (visualiser leurs collections)
- ☐ Page Profile complète (settings)
- ☐ Upload avatar (multer backend - bonus)
- ☐ Validation temps réel formulaires
- ☐ Tests utilisateurs sur appareils différents
- ☐ Bug fixes globaux

**Livrable :** App complète, polie, testée.

---

#### Semaine 8 : Déploiement & Démo (Final)

**Objectifs :** Mise en production + préparation soutenance

**DevOps :**
- ☐ Déploiement backend sur Render (depuis `server/`)
- ☐ Déploiement frontend sur Netlify/Vercel (depuis `client/`)
- ☐ Configuration variables env production
- ☐ MongoDB Atlas en production
- ☐ Tests post-déploiement

**Documentation :**
- ☐ README professionnel à la racine du monorepo avec captures
- ☐ Documentation API (Postman collection ou Swagger)
- ☐ Guide d'installation locale (un seul `npm run install:all` + `npm run dev`)
- ☐ Architecture documentée

**Démo :**
- ☐ Préparation pitch
- ☐ Slides de soutenance
- ☐ Préparation questions techniques
- ☐ Backup data démo (50 racines minimum)
- ☐ Compte démo prérempli avec progression

**Livrable :** Application live + dossier de soutenance complet.

---

## ✅ Conformité Cahier des Charges

### ✅ Backend (Node.js + Express + MongoDB)

#### Authentification & Sécurité

- ✅ Système d'authentification complet avec JWT
- ✅ Inscription avec hashage bcrypt (10 salt rounds)
- ✅ Connexion qui génère un token JWT (expiration 7 jours)
- ✅ Middleware `authMiddleware` pour routes protégées
- ✅ Validation des données avec **Joi** (toutes routes POST/PUT/PATCH)

#### Base de Données

- ✅ **6 modèles Mongoose** (User, Root, Word, Progress, Note, Collection)
- ✅ **Multiples relations populate** :
  - Word.root → Root
  - Progress.user → User
  - Progress.root → Root
  - Progress.wordsLearned → Word[]
  - Note.target → Root ou Word (refPath dynamique)
  - Note.user → User
  - Collection.user → User
  - Collection.roots → Root[]
- ✅ Schémas avec validation (required, unique, enum, min/max, regex)

#### API RESTful

- ✅ **CRUD complet sur 3 ressources** (au lieu de 2 minimum) :
  - Notes : POST, GET (liste/détail), PUT, DELETE
  - Collections : POST, GET, PUT, DELETE
  - Progress : POST, GET, PUT, DELETE
- ✅ Routes publiques (auth, exploration) ET protégées (progression, notes, collections)
- ✅ Gestion d'erreurs avec status codes appropriés (400, 401, 403, 404, 500)
- ✅ Variables d'environnement (.env) pour DB_URI, JWT_SECRET, etc.
- ✅ Vérifications complètes (champs obligatoires, types, formats)
- ✅ Validation Joi sur toutes les routes

### ✅ Frontend (React)

#### Structure & Organisation

- ✅ Application créée avec **Vite**
- ✅ **15+ composants React** réutilisables (largement plus que 5 minimum)
- ✅ React Router avec **14 routes** (largement plus que 4-5)

#### Authentification & Routing

- ✅ Pages Login et Register fonctionnelles avec validation
- ✅ Stockage du token JWT en localStorage
- ✅ Composant `<ProtectedRoute />` avec redirection login
- ✅ Bouton de déconnexion qui supprime le token
- ✅ **3 contextes globaux** : AuthContext, ThemeContext, LanguageContext

#### Interaction avec l'API

- ✅ Tous les appels HTTP avec **Axios**
- ✅ Affichage des données API partout (listings, détails)
- ✅ Formulaires CREATE et UPDATE pour Notes et Collections
- ✅ Suppression DELETE avec composant `<ConfirmDialog />`
- ✅ États de chargement (`<LoadingSpinner />`, skeletons)
- ✅ Gestion des erreurs avec couleur **#e23923**
- ✅ **Pagination implémentée** (composant réutilisable)

#### UX/UI

- ✅ Interface responsive (mobile-first Tailwind)
- ✅ Framework CSS : **Tailwind CSS**
- ✅ Feedback visuel pour toutes les actions (loaders, toasts, animations)
- ✅ Notifications via **react-hot-toast**

### ✅ Fonctionnalités Métier

- ✅ **Multiples fonctionnalités spécifiques** :
  - Visualisation interactive arbres de racines (D3)
  - Algorithme de répétition espacée
  - Constellation personnelle
  - Mode apprentissage flashcards
  - Calligraphie animée
- ✅ Filtrage, recherche **ET** tri sur racines
- ✅ **Recherche avancée multi-filtres** (10+ critères)
- ✅ **9 hooks personnalisés** (useAuth, useRoots, useProgress, useTheme, useLanguage, useDebounce, useToast, useRoot, useTodayReview)
- ✅ Thème sombre/clair complet
- ✅ Système de thème global cohérent (CSS variables + Tailwind config)
- ✅ Animations partout (Framer Motion)
- ✅ Système multilingue **FR/EN/AR** avec react-i18next + RTL

### ✅ Directives Générales

- ✅ Code propre et structure modulaire (séparation claire des responsabilités)
- ✅ **Monorepo** : un seul repo GitHub, scripts orchestrés par `concurrently`
- ✅ Normes ES6+ partout :
  - Spread operator (`...`)
  - Optional chaining (`?.`)
  - Template strings (`` `${}` ``)
  - Arrow functions
  - Destructuring
  - Async/await

### 🚀 Bonus Implémentés

- ✅ Upload d'images (avatar utilisateur via multer)
- ✅ Validation en temps réel côté frontend
- ✅ Déploiement (Render + Netlify)
- ⚠️ Email de confirmation (nodemailer) - optionnel
- ⚠️ Refresh tokens - optionnel
- ⚠️ Tests unitaires - optionnel
- ⚠️ Websockets - non pertinent pour ce projet

---

## 🎬 Démo & Présentation

### Les 5 Moments Wow de la Démo

#### 1. Hero Animé Landing Page (0-15 sec)

**Action :** Tu ouvres l'app, le hero affiche une racine qui se déploie en arbre interactif sous les yeux du jury.

**Effet :** "Wow, c'est beau et c'est unique."

#### 2. Démonstration Arbre Interactif (15-60 sec)

**Action :** Tu vas sur Explorer, tu cliques sur ك-ت-ب. L'arbre radial se déploie avec animation, les mots apparaissent en branches colorées. Tu hoveres sur "كِتَاب" → tooltip avec "livre" + translittération. Tu cliques → panneau latéral avec exemple, calligraphie animée, schéma grammatical.

**Effet :** "Le concept est puissant et bien exécuté."

#### 3. Mode Apprentissage (60-120 sec)

**Action :** Tu vas sur `/learn`, l'app présente 5 racines à réviser. Animation flashcard 3D flip, tu réponds, confettis sur réussite, transition fluide à la suivante. Écran final avec stats animées.

**Effet :** "L'expérience pédagogique est addictive et premium."

#### 4. Constellation Personnelle (120-180 sec)

**Action :** Tu vas sur `/constellation`. Force-directed graph D3 magnifique avec toutes tes racines apprises connectées par champ sémantique. Tu zoomes, tu drag, tu cliques sur un node.

**Effet :** "C'est une œuvre d'art ET un outil pédagogique."

#### 5. Switch Multilingue + Dark Mode (180-240 sec)

**Action :** Tu changes la langue d'interface : FR → EN → AR. L'interface bascule en RTL, les polices arabes apparaissent. Tout fonctionne nativement. Tu actives le dark mode. Transition fluide, palette nuit étoilée, calligraphie en doré sur fond sombre.

**Effet :** "Le projet est mature, accessible, et le souci du détail est exceptionnel."

### Pitch en 30 Secondes

> "ArabicWordRoot transforme l'apprentissage de l'arabe en exploration visuelle. Au lieu de mémoriser des mots isolés comme Duolingo, l'apprenant comprend la **logique générative de la langue** à travers des arbres interactifs des racines trilitères. Chaque racine de 3 lettres devient une **constellation visuelle** révélant des dizaines de mots reliés sémantiquement. C'est scientifiquement prouvé 2 à 3 fois plus efficace, et personne ne le fait bien. Mon application combine pédagogie validée, visualisations D3 modernes, et expérience utilisateur premium."

### Stats à Présenter

- **6 modèles** Mongoose avec relations complexes
- **35+ endpoints** API avec validation Joi
- **15+ composants** React réutilisables
- **14 pages** avec routing protégé
- **9 hooks** personnalisés
- **3 langues** supportées avec RTL
- **30 racines** + 300+ mots préparés
- **Algorithme** de répétition espacée custom
- **1 monorepo** : architecture propre et maintenable

### Questions Anticipées du Jury

#### "Pourquoi ce projet plutôt qu'un autre ?"

> "Parce qu'il combine tech moderne (D3, animations Framer, multilingue RTL), pédagogie scientifiquement validée, et niche premium peu concurrencée. C'est techniquement riche, visuellement bluffant, et utile concrètement."

#### "Comment tu gères les performances avec D3 et beaucoup de données ?"

> "J'utilise React.memo et useMemo pour éviter les re-renders inutiles. D3 manipule directement le DOM via refs (pas de virtual DOM React qui ralentirait). Pour la constellation avec beaucoup de nodes, j'implémente un système de niveau de détail (LOD) qui simplifie le rendu au zoom out."

#### "Pourquoi MongoDB plutôt que PostgreSQL pour ce projet ?"

> "Mes données ont une structure flexible (traductions multilingues, exemples variés, métadonnées). Les relations sont importantes mais pas relationnelles strictes. MongoDB me permet d'embedder des sous-documents (translations, examples) sans tables JOIN. Et populate gère bien les références User/Root/Word."

#### "Comment tu gères la sécurité ?"

> "JWT avec expiration courte, bcrypt pour passwords, validation Joi obligatoire avant chaque controller, middleware d'auth sur routes sensibles, helmet pour headers HTTP, rate limiting sur login, CORS strict, variables env jamais commitées, mongoose strict mode."

#### "Et la scalabilité ?"

> "MongoDB Atlas scale horizontalement. Backend stateless (JWT) donc facile à load-balancer. Pagination obligatoire sur toutes les listes. Indexes MongoDB sur les champs de recherche. Cache localStorage pour preferences user. Si besoin futur : Redis pour cache, CDN pour assets, lazy loading des arbres."

#### "Pourquoi un monorepo plutôt que deux repos séparés ?"

> "Le monorepo simplifie le workflow : un seul clone, un seul `npm run dev` lance tout, les PRs touchant backend + frontend sont atomiques, les constantes partagées (enums, types) vivent dans `shared/`, et le déploiement est orchestré depuis un seul endroit. Pour un projet de cette taille avec un seul développeur, c'est le sweet spot entre simplicité et organisation."

---

## 🌟 Pourquoi Ce Projet Va Marquer

### En Termes Techniques

- Architecture MERN moderne et propre en monorepo
- Multiples relations Mongoose maîtrisées
- Visualisations data complexes (D3 + Framer Motion)
- Algorithme custom (répétition espacée)
- Multilingue avec RTL natif
- Design system cohérent et premium

### En Termes Produit

- Concept original et différenciant
- Pédagogie scientifiquement fondée
- Public engagé et passionné
- UX léchée et addictive
- Niche peu couverte par les concurrents

### En Termes Personnel

- Tu peux pitcher avec passion en entretien
- Démontrable instantanément (effet wow)
- Différenciant en portfolio (pas un énième CRUD)
- Apprentissage technique réel (D3, i18n, RTL)
- Sujet qui a du sens (culture, langue, éducation)

---

## 🚀 Démarrage Immédiat

### Étapes pour Commencer Aujourd'hui

1. **Créer le monorepo** : `arabic-word-root` sur GitHub
2. **Setup MongoDB Atlas** (free tier, 512MB suffit largement)
3. **Préparer le dataset** : Google Sheets avec 5-10 racines de démarrage
4. **Init monorepo** : package.json racine + concurrently
5. **Init backend** : Express + Mongoose dans `server/`
6. **Init frontend** : Vite + React + Tailwind dans `client/`
7. **Setup environnements** : .env, .gitignore, README
8. **Premier commit** : "Initial monorepo setup"

### Commandes de Démarrage

#### Initialisation du Monorepo

```bash
mkdir arabic-word-root && cd arabic-word-root
git init
npm init -y

# Installer l'orchestrateur
npm install --save-dev concurrently

# Créer la structure
mkdir server client shared
```

#### Backend (server/)

```bash
cd server
npm init -y
npm install express mongoose bcrypt jsonwebtoken joi cors helmet \
  express-rate-limit dotenv express-mongo-sanitize
npm install --save-dev nodemon

# Créer la structure de dossiers
mkdir -p src/{config,models,controllers,routes,middlewares,validations,utils,seeds/data}
touch src/server.js .env .env.example

# Premier serveur Express
echo 'console.log("ArabicWordRoot Backend Ready")' > src/server.js
cd ..
```

#### Frontend (client/)

```bash
cd client
npm create vite@latest . -- --template react
npm install
npm install axios react-router-dom tailwindcss postcss autoprefixer \
  framer-motion d3 react-i18next i18next react-hot-toast \
  recharts lucide-react react-circular-progressbar date-fns \
  canvas-confetti
npx tailwindcss init -p

# Créer la structure de dossiers
mkdir -p src/{api,assets,components,pages,contexts,hooks,utils,locales,styles}
mkdir -p src/components/{common,layout,auth,roots,words,progress,constellation,stats,notes,collections}
cd ..
```

#### Lancer le Tout

```bash
# Depuis la racine du monorepo
npm run dev
# → Lance simultanément backend (port 5000) et frontend (port 5173)
```

---

## 📚 Ressources & Liens Utiles

### Documentation Officielle

- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [D3.js Documentation](https://d3js.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [react-i18next](https://react.i18next.com/)

### APIs & Datasets

- [Quranic Arabic Corpus](http://corpus.quran.com/)
- [Wiktionary API](https://en.wiktionary.org/w/api.php)

### Inspirations Design

- [Linear](https://linear.app/) - UI moderne et clean
- [Stripe Dashboard](https://stripe.com/) - Data viz premium
- [Notion](https://notion.so/) - Patterns de productivité
- [Duolingo](https://duolingo.com/) - Gamification d'apprentissage

### Outils de Développement

- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI BDD
- [Postman](https://www.postman.com/) - Test API
- [Vercel](https://vercel.com/) / [Netlify](https://netlify.com/) - Frontend hosting
- [Render](https://render.com/) - Backend hosting

---

## 🎓 Notes Finales pour Claude

Ce document est le **brief complet** du projet ArabicWordRoot. Il sert de référence pour tout développement futur.

### Principes à respecter

1. **Code propre et modulaire** - Chaque composant a une responsabilité claire
2. **ES6+ partout** - Spread, optional chaining, template strings, async/await
3. **Validation systématique** - Joi côté backend, validation custom côté frontend
4. **Sécurité d'abord** - JWT, bcrypt, helmet, rate limiting, sanitization
5. **UX premium** - Animations Framer Motion, micro-interactions, feedback constant
6. **Performance** - Pagination, debounce, memoization, lazy loading
7. **Accessibilité** - ARIA labels, contrastes, navigation clavier
8. **Multilingue** - RTL natif pour l'arabe, traductions complètes
9. **Monorepo** - Tout dans un seul repo, scripts orchestrés, structure claire

### En cas de doute

- Privilégier la qualité à la quantité de features
- Le wow visuel l'emporte sur la complétude fonctionnelle pour la démo
- Le concept doit être démontrable en 30 secondes
- L'utilisateur final est l'apprenant d'arabe (pas un linguiste expert)

### Le sweet spot

ArabicWordRoot est l'intersection parfaite entre :
- **Tech moderne** (MERN, D3, Framer)
- **Pédagogie validée** (répétition espacée, racines)
- **Esthétique premium** (calligraphie, animations, dark mode)
- **Niche premium** (apprenants arabe, peu couverts)
- **Faisabilité** (1-2 mois, dev intermédiaire)

**C'est l'application MERN parfaite pour démontrer maîtrise technique + créativité + sensibilité produit.** 🌱✨

---

*Document version 2.0 - Spécifications complètes du projet ArabicWordRoot (Monorepo, sans audio/vocal)*
