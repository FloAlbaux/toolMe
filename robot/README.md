# Robot Framework — E2E QA (Auth)

Tests E2E avec **Robot Framework** et **Browser library** (Playwright) pour automatiser la checklist QA auth (signup, login, routes protégées).

## Prérequis

- Python 3.10+
- **Backend** et **frontend** lancés :
  - Backend : `make dev-backend` (port 8030)
  - Frontend : `make dev-frontend` (port 5173)
- Node.js (LTS) pour Playwright

## Installation (une fois)

```bash
# À la racine du projet (utilise uv, comme le backend)
make install-robot
# ou manuellement :
cd robot && uv sync && uv run rfbrowser init
```

`rfbrowser init` télécharge les binaires Playwright (Chromium, etc.).

## Lancer les tests

```bash
# À la racine du projet (frontend + backend doivent tourner)
make test-robot
# ou depuis robot/ :
robot tests/
```

Variables optionnelles :

```bash
# URL du frontend (défaut: http://localhost:5173)
robot -v BASE_URL:http://localhost:3000 tests/

# Lancer avec le navigateur visible (non headless)
uv run robot -v HEADLESS:False tests/

# Exclure un test (ex. duplicate email si flaky)
uv run robot --exclude "Signup Duplicate*" tests/
```

## Structure

```
robot/
├── requirements.txt
├── README.md
├── resources/
│   ├── variables.robot   # BASE_URL, sélecteurs, textes EN
│   └── auth.resource.robot  # Keywords (Open App, Fill Signup, …)
└── tests/
    ├── auth_signup.robot    # Inscription, bouton disabled, duplicate email
    ├── auth_login.robot     # Login, logout, erreur mauvais mot de passe
    └── auth_protected.robot # /publish → /login, retour après login
```

## Correspondance avec la checklist QA

| Checklist QA | Fichier Robot |
|--------------|----------------|
| Signup: bouton désactivé (email invalide, password court, passwords différents) | `auth_signup.robot` |
| Signup: bouton activé quand tout valide | `auth_signup.robot` |
| Signup: succès → home + connecté | `auth_signup.robot` |
| Signup: email déjà utilisé → erreur | `auth_signup.robot` (peut être instable après logout) |
| Login: succès, logout, mauvaise mot de passe | `auth_login.robot` |
| /publish sans auth → /login | `auth_protected.robot` |
| Après login depuis /publish → retour sur /publish | `auth_protected.robot` |

Les tests utilisent l’UI en **anglais** (sélecteurs sur "Log in", "Create account", etc.). Pour le français, adapter les variables dans `resources/variables.robot`.
