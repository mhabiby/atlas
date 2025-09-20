<<<<<<< HEAD
# atlas
atalas directory
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

# Atlas Prototype (DoctorsFAQ)

## Quick Start

Frontend (React + Vite):
1. Node >= 20.17.0 (recommend upgrading to >=20.19.0 to silence engine warning).
2. Install deps:
	```bash
	npm install
	```
3. Run dev:
	```bash
	npm run dev
	```
4. Open the printed http://localhost:5173 (or next free port).

Backend (Flask + Vector Search):
1. Python 3.10+ recommended.
2. Install Python deps:
	```bash
	pip install -r server/requirements.txt
	```
3. (Optional) Set environment variables in a `.env` at project root:
	```env
	OPENAI_API_KEY=sk-...
	TOP_K=3
	```
4. Run backend:
	```bash
	python -m server.run
	```
5. Health check: http://localhost:5001/health

## SCSS / Bootstrap Theming
`src/custom-bootstrap.scss` customizes Bootstrap theme colors. Vite requires a SASS implementation:

Install (already added if you followed npm install):
```bash
npm install -D sass-embedded
```
If that fails (older Node / platform), fallback:
```bash
npm install -D sass
```

## Common Dev Issues
Blank page & no React render:
- Ensure `index.html` contains: `<script type="module" src="/src/main.jsx"></script>`
- Check console for SASS preprocessor error and install `sass-embedded`.

`Cannot respond. No request with id ...` during HMR:
- Hard refresh (Ctrl+Shift+R) or restart Vite after clearing `node_modules`.

SCSS compile error (missing sass-embedded):
- Install as above or temporarily comment out `import "./custom-bootstrap.scss";` in `App.jsx`.

OpenAI key not set (backend 500 on /ask):
- Set `OPENAI_API_KEY` or use the simple vector results only (modify `/ask` to fallback) or add a `/semantic_search` proxy via `server/server.js`.

## Testing
Run API tests (will skip /ask if key missing):
```bash
pytest -q
```

## Next Improvements
- Normalize `/ask` search result structure (current vector search returns objects wrapping doc under `doc`).
- Add dev fallback when no API key: return top-k vector docs directly.
- Add CI (GitHub Actions) for lint + pytest.

## Feature: Assistant Refactor Structure
Implemented initial decomposition:

```
src/features/assistant/
	api/askClient.js          # fetch wrapper with normalization & cancellation
	hooks/useChatReducer.js   # reducer-driven chat state (SEND/RESPONSE/ERROR)
	components/
		MessageList.jsx
		MessageItem.jsx
		DoctorPoster.jsx
		Suggestions.jsx
		InputBar.jsx
```

`GptAssistant.jsx` now orchestrates these pieces instead of storing ad-hoc logic. Next potential steps:
1. Add tests for reducer & askClient.
2. Virtualize long message lists (react-virtuoso dependency already present).
3. Extract speech + clipboard into dedicated hooks.
4. Introduce env-based backend URL (`VITE_API_BASE`).
5. Add error banner & loading skeleton components.

## Environment Variables (Frontend)
All variables must be prefixed with `VITE_` to be exposed at build time.

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_BASE` | Base URL for backend API (`/ask`, `/health`) | `http://localhost:5001` |

Usage in code:
```js
import { API_BASE } from './config';
fetch(`${API_BASE}/health`)
```

Create a `.env` or `.env.local` file (see `.env.example`):
```
VITE_API_BASE=http://localhost:5001
```

After changing env vars, restart `npm run dev`.

>>>>>>> aa78b2a (Initial commit)
