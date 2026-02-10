# ToolMe

**The sandbox where your projects matter.**  
*Le bac à sable où tes projets comptent.*

---

ToolMe is a **non-profit** product for **individuals only**, **fully free**. This repository contains the frontend (React) and backend (Python API) for ToolMe.

## Identity (source of truth)

| Item | Value |
|------|--------|
| **Name** | ToolMe |
| **Tagline (EN)** | The sandbox where your projects matter. |
| **Tagline (FR)** | Le bac à sable où tes projets comptent. |
| **Positioning** | Non-profit, individuals only, fully free. |

## Project structure

- **`frontend/`** — React app (Vite), minimal shell for the public site.
- **`backend/`** — Python API (FastAPI), health endpoint and structure for projects/submissions.

## Prerequisites

- **Node.js** (v18+) and npm/pnpm for the frontend.
- **Python 3.12+** and [uv](https://docs.astral.sh/uv/) for the backend.

## Quick start

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

- Dev server: http://localhost:5173  
- Tests: `npm run test`

### Backend (FastAPI)

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health

## License

See repository or usage guidelines for terms of use.
