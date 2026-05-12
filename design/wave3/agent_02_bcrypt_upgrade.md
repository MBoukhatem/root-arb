# Upgrade bcrypt 5.1.1 → 6.0.0

## Résumé

Upgrade `bcrypt@5.1.1` → `6.0.0` effectué avec succès. Les 3 CVE high liées à la chaîne `bcrypt → @mapbox/node-pre-gyp → tar ≤7.5.10` sont éliminées. Aucune modification de code source requise : l'API (`hash`, `compare`, `genSalt`) est identique en v6. Tests fonctionnels (login admin, register, login nouveau user) tous 200/201. La DB étant in-memory, les hashes produits en prod Atlas avec bcrypt@5 restent compatibles avec bcrypt@6 (format `$2b$` inchangé).

---

## Version avant / après

|                        | Avant             | Après                          |
| ---------------------- | ----------------- | ------------------------------ |
| `bcrypt`               | 5.1.1             | 6.0.0                          |
| `@mapbox/node-pre-gyp` | présent (≤1.0.11) | supprimé (54 packages retirés) |
| `tar` vulnérable       | présent (≤7.5.10) | supprimé                       |
| Vulnérabilités high    | **3**             | **0**                          |

Commande : `npm install bcrypt@6 -w server`
Résultat install : `added 1 package, removed 54 packages, changed 2 packages — found 0 vulnerabilities`

---

## npm audit avant / après

**Avant (`bcrypt@5.1.1`) :**

```
tar  <=7.5.10
Severity: high
- GHSA-34x7-hfp2-rc4v (path traversal via hardlink)
- GHSA-8qq5-rm4j-mr97 (symlink poisoning)
- GHSA-83g3-92jg-28cx (hardlink target escape)
- GHSA-qffp-2rhf-9h96 (hardlink path traversal drive-relative)
- GHSA-9ppj-qmqm-q256 (symlink path traversal drive-relative)
- GHSA-r6q2-hw4h-h46w (race condition unicode ligature macOS APFS)

@mapbox/node-pre-gyp  <=1.0.11  → dépend de tar vulnérable
bcrypt  5.0.1 - 5.1.1           → dépend de @mapbox/node-pre-gyp

3 high severity vulnerabilities
```

**Après (`bcrypt@6.0.0`) :**

```
found 0 vulnerabilities
```

---

## API check

Usages dans `server/src/` (2 appels, inchangés) :

```
server/src/models/User.js:79  →  bcrypt.hash(this.password, rounds)
server/src/models/User.js:84  →  bcrypt.compare(plain, this.password)
```

bcrypt@6 conserve exactement les mêmes signatures. Aucun fichier source modifié.

---

## Tests fonctionnels

**1. Login admin (hash seedé au boot)**

```
POST /api/auth/login {"email":"admin@arabicwordroot.com","password":"AdminDev2026!"}
→ HTTP 200  {"success":true,"message":"Logged in","data":{"accessToken":"eyJ..."}}
```

**2. Register nouveau user (hash créé avec bcrypt@6)**

```
POST /api/auth/register {"email":"bcrypt-test@arabicwordroot.com","password":"TestBcrypt6!","username":"bcrypttest"}
→ HTTP 201  {"success":true,"message":"Account created","data":{"accessToken":"eyJ..."}}
```

**3. Login user nouvellement créé**

```
POST /api/auth/login {"email":"bcrypt-test@arabicwordroot.com","password":"TestBcrypt6!"}
→ HTTP 200  {"success":true,"message":"Logged in","data":{"accessToken":"eyJ..."}}
```

Tous les tests passent. Le cycle complet hash/compare fonctionne avec bcrypt@6.

---

## Risque de migration production (Atlas)

- **Format de hash identique** : bcrypt@5 et bcrypt@6 produisent tous deux des hashes `$2b$10$...` (Blowfish, même cost factor, même format BCrypt). Un hash créé avec bcrypt@5 est vérifiable avec bcrypt@6 via `compare()` sans aucune migration.
- **Aucune action requise** sur les utilisateurs existants en base Atlas lors du déploiement.
- **Pas de breaking change API** : `hash`, `compare`, `genSalt` ont la même signature.
- **Suppression de la dépendance native** `@mapbox/node-pre-gyp` : bcrypt@6 utilise un binding natif direct (`node-gyp-build`), plus léger. Un `npm rebuild bcrypt` peut être nécessaire si le build natif n'est pas pré-compilé pour la cible (ex. Node.js version différente en prod). Vérifier que la version Node de l'environnement Vercel/Railway correspond à celle du build.

---

## Fichiers modifiés

| Fichier                    | Modification                                     |
| -------------------------- | ------------------------------------------------ |
| `server/package.json`      | `bcrypt: "^5.1.1"` → `"^6.0.0"`                  |
| `server/package-lock.json` | Régénéré automatiquement (54 packages supprimés) |

Aucun fichier source (`*.js`) modifié.
