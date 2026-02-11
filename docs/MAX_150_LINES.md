# Règle : maximum 150 lignes par fichier

Les fichiers source ne doivent pas dépasser **150 lignes**. Au-delà, extraire des composants, hooks ou modules plus petits.

## Fichiers à réduire (> 150 lignes)

| Lignes | Fichier |
|--------|---------|
| 310 | `frontend/src/pages/ProjectApplyPage.tsx` |
| 283 | `backend/tests/test_api_submissions.py` |
| 278 | `backend/app/routers/auth.py` |
| 269 | `backend/app/crud/submissions.py` |
| 264 | `frontend/src/pages/ProjectDetailPage.tsx` |
| 234 | `frontend/src/pages/ProjectEditPage.tsx` |
| 219 | `frontend/src/pages/SubmissionDetailPage.tsx` |
| 189 | `frontend/src/pages/SignUpPage.tsx` |
| 189 | `backend/tests/test_crud_submissions.py` |
| 177 | `frontend/src/pages/PublishPage.tsx` |
| 174 | `frontend/src/api/submissions.test.ts` |
| 174 | `backend/tests/test_api.py` |
| 169 | `frontend/src/locales/fr.json` |
| 169 | `frontend/src/locales/en.json` |
| 151 | `frontend/src/api/auth.ts` |

*Dernière mise à jour : après extraction de `DeleteAccountSection`, `LoginForm` ; `AccountPage` et `LoginPage` sont passés sous 150 lignes.*
