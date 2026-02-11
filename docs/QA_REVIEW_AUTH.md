# QA Review — Auth & Validations

Checklist pour valider le flux d’authentification et les validations (retour QA).

---

## Prérequis

- [ ] Backend lancé (ex. `make run` ou port 8030)
- [ ] Frontend lancé (ex. `npm run dev`)
- [ ] Navigateur avec console ouverte (onglet Network si besoin)

---

## 1. Inscription (Sign up)

### Formulaire

- [ ] **Email invalide** : saisir `toto` ou `sans-arobase.com` → le bouton « Créer mon compte » reste **désactivé**
- [ ] **Email valide** : saisir `test@example.com` → le bouton reste désactivé tant que mot de passe / confirmation invalides
- [ ] **Mot de passe < 8 caractères** : le bouton reste **désactivé**
- [ ] **Password ≠ Confirm password** : le bouton reste **désactivé**
- [ ] **Tout valide** (email valide, password ≥ 8, identiques) → le bouton s’**active**

### Soumission

- [ ] Inscription réussie → redirection vers la home, **connecté** (email + « Se déconnecter » dans le header)
- [ ] Inscription avec **email déjà utilisé** → message d’erreur (ex. « Email already registered »)
- [ ] Inscription avec **passwords différents** côté front (si contournement) : le backend renvoie **401** « Passwords do not match »
- [ ] Inscription avec **email invalide** (ex. `x`) envoyé au back → **422** (validation)

### i18n (FR / EN)

- [ ] Changer la langue → libellés signup corrects (email, mot de passe, confirmation, bouton, erreurs)

---

## 2. Connexion (Login)

### Formulaire

- [ ] Connexion avec **email + mot de passe corrects** (compte existant) → 200, token stocké, redirection (ex. home ou page demandée)
- [ ] Connexion avec **mauvais mot de passe** → message d’erreur (ex. « Email ou mot de passe incorrect »)
- [ ] Connexion avec **email inexistant** → même message d’erreur (pas de fuite d’info)

### Redirection après login

- [ ] Aller sur `/publish` **sans être connecté** → redirection vers `/login`
- [ ] Se connecter → redirection vers **/publish** (page demandée)
- [ ] Aller sur `/login` puis se connecter sans avoir été redirigé → redirection vers **/** (home)

### Header

- [ ] **Non connecté** : liens « Se connecter » et « Créer un compte »
- [ ] **Connecté** : email affiché + « Se déconnecter »
- [ ] **Se déconnecter** → token supprimé, header affiche à nouveau « Se connecter » / « Créer un compte »

---

## 3. Routes protégées

- [ ] **GET /projects** (liste projets) : accessible sans auth
- [ ] **POST /projects** (créer un projet) : sans token → **401**
- [ ] **PUT /projects/:id** : sans token → **401**
- [ ] **DELETE /projects/:id** : sans token → **401**
- [ ] Depuis le front : aller sur « Publier un projet » sans être connecté → redirection vers `/login`, puis après login → retour sur `/publish`

---

## 4. Validations backend (optionnel via API)

- [ ] **POST /auth/signup** sans `password_confirm` → **422**
- [ ] **POST /auth/signup** avec `password` ≠ `password_confirm` → **401** + détail « Passwords do not match »
- [ ] **POST /auth/signup** avec `email: "not-an-email"` → **422**
- [ ] **POST /auth/login** avec email invalide (format) → **422**

---

## 5. Persistance & token

- [ ] Se connecter → rafraîchir la page → toujours **connecté** (token en localStorage)
- [ ] Se déconnecter → rafraîchir → **non connecté**
- [ ] Connecté, publier un projet (POST /projects) → requête contient **Authorization: Bearer &lt;token&gt;** (onglet Network)

---

## 6. Récap technique

| Élément | Frontend | Backend |
|--------|----------|---------|
| Regex email | `utils.ts` + `isValidEmail()` | `schemas/user.py` `EMAIL_REGEX` + validators |
| Password = confirm | CTA désactivé si différents | 401 si différents |
| Token | localStorage + AuthContext | JWT, vérifié dans `dependencies.py` |
| Routes protégées | `RequireAuth` sur `/publish` | 401 si pas de token valide sur POST/PUT/DELETE projects |

---

## Bugs / remarques

_À remplir pendant la review :_

- 
- 
- 
