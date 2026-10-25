# ⚒️ WebForge AI

**Describe a website. Get a complete, editable, downloadable project.**

An open-source, AI-powered full-stack website builder with live preview, a built-in code editor, version history, and one-click GitHub publishing.

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite%20%2B%20Tailwind-blue)
![Backend](https://img.shields.io/badge/backend-Express%20%2B%20MongoDB-lightgrey)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-orange)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Security](#security)
- [Deployment](#deployment)
- [Project Status](#project-status)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

WebForge AI turns a plain-language prompt into a complete, structured web project: frontend, and a backend when the idea needs one. You can preview it live, refine it with follow-up prompts, edit the code directly in a Monaco editor, then download it as a ZIP or publish it straight to GitHub.

**How it works**

1. **Describe** your website in plain language.
2. **Generate**: WebForge picks the right project type (static, React, or full-stack) and builds the files.
3. **Preview** the result live on desktop, tablet, and mobile viewports.
4. **Refine** with more prompts or edit the code manually.
5. **Ship** as a ZIP download or a GitHub repository.

> 💡 No API keys? No problem. The built-in **mock provider** lets you run and evaluate the entire app offline.

---

## Features

| | |
|---|---|
| 🧠 **Natural-language generation** | Static, React, or full-stack (React + Express + MongoDB), chosen automatically from your prompt. |
| ✏️ **Incremental AI editing** | "Make the hero blue" only touches the files that need to change. |
| 👀 **Live preview** | Desktop / tablet / mobile views, refresh, and open-in-new-tab. |
| 🧑‍💻 **Monaco code editor** | File tree plus syntax highlighting for JS, JSX, TS, CSS, HTML, JSON, and Markdown. |
| 🕓 **Version history** | Automatic snapshots before AI edits and on manual saves, with one-click restore. |
| 📦 **Export** | Download as ZIP or publish to GitHub (OAuth, repo creation, commits). |
| 🔌 **Pluggable AI providers** | OpenAI (Responses API), Anthropic, bring-your-own-key, or the offline mock provider. |
| 🔐 **Real authentication** | JWT in httpOnly cookies, bcrypt hashing, email verification, password reset, rate limiting. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Monaco Editor |
| Backend | Node.js, Express |
| Database | MongoDB (in-memory fallback for local dev) |
| Auth | JWT (httpOnly cookies), bcrypt |
| AI | OpenAI, Anthropic, Mock provider |
| Integrations | GitHub OAuth, SMTP email |

---

## Quick Start

### Prerequisites

- **Node.js** 18 or newer
- **npm** 9 or newer
- **MongoDB**: *optional for local dev.* If `MONGODB_URI` is unset, the app automatically starts an in-process `mongodb-memory-server`. Data is **not** persisted across restarts in that mode.

### Install

```bash
git clone <this-repo>
cd webforge-ai

npm install                          # installs root, client, and server workspaces

cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Run

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5100 |

With the default `AI_PROVIDER=mock`, you can register an account and generate a working demo project with **zero API keys**.

### Use a real AI provider

Edit `server/.env`:

```bash
# OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

```bash
# or Anthropic
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Configuration

### `server/.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Defaults to `5100`. |
| `MONGODB_URI` | Dev: no · Prod: **yes** | Omit locally to use the in-memory database. |
| `JWT_SECRET` | Prod: **yes** | Long random string. An ephemeral one is generated in dev with a warning. |
| `AI_PROVIDER` | No | `mock` (default) \| `openai` \| `anthropic`. |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | If using that provider | Never exposed to the browser. |
| `ALLOW_BYOK` | No | Lets users supply their own provider key from Settings. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `GITHUB_CALLBACK_URL` | For GitHub publishing | See setup below. |
| `SMTP_*` / `EMAIL_FROM` | No | If omitted in development, verification and password-reset links are printed in the server console. |

See `server/.env.example` for the full list.

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Defaults to `/api`, proxied to the backend by Vite in dev. |

### GitHub OAuth setup (optional)

1. Create an OAuth App at https://github.com/settings/developers.
2. Set the authorization callback URL to `http://localhost:5100/api/github/callback` (adjust for production).
3. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `server/.env`.

### Bring your own key (BYOK)

With `ALLOW_BYOK` enabled, users can add their own key under **Settings → Bring your own AI key**. Keys are encrypted at rest with AES-256-GCM and used only for that user's requests.

---

## Architecture

```
webforge-ai/
├── client/                  # React + Vite + Tailwind
│   └── src/
│       ├── components/      # Button, Modal, FileTree, CodeEditor, PreviewFrame, ProjectCard, ...
│       ├── pages/           # Landing, Auth pages, Dashboard, Builder, Settings, ...
│       ├── context/         # AuthContext, ThemeContext
│       ├── lib/             # api.js (axios), previewBuilder.js (in-browser preview bundler)
│       └── routes/          # ProtectedRoute
│
├── server/                  # Node.js + Express
│   └── src/
│       ├── config/          # env.js, db.js
│       ├── models/          # User, Project, ProjectVersion, GitHubConnection, AIUsage, PasswordResetToken
│       ├── middleware/      # auth, errorHandler, rateLimit, validate
│       ├── controllers/     # auth, project, ai, github, version, user, download
│       ├── routes/          # REST routes, one file per resource
│       ├── services/
│       │   ├── ai/          # AIProvider interface + OpenAI / Anthropic / Mock, aiService.js orchestrator
│       │   ├── githubService.js
│       │   ├── zipService.js
│       │   └── emailService.js
│       └── utils/           # jwt, password, crypto, fileTree (path-traversal guard), logger, apiError
│
├── .env.example             # in both client/ and server/
└── README.md
```

### AI provider abstraction

`server/src/services/ai/AIProvider.js` defines one interface:

```js
complete({ systemPrompt, userPrompt, jsonSchema })
```

`OpenAIProvider`, `AnthropicProvider`, and `MockProvider` all implement it, so `aiService.js` and everything above it never touches a provider-specific SDK call. **Adding a new provider means writing one new class.**

AI responses are requested as strict JSON (OpenAI Structured Outputs, or an explicit JSON instruction for Anthropic). A malformed response triggers one repair retry before failing with a clean, user-facing error.

### Live preview

`client/src/lib/previewBuilder.js` builds the preview by transpiling generated React files with Babel Standalone inside a sandboxed iframe (loaded from a CDN at runtime), instead of running a real bundler. It handles common patterns: function components, hooks, relative imports of local components, and Tailwind via the Play CDN. Third-party npm packages beyond React are **not** resolved in preview. For full fidelity, download the project and run it locally.

---

## API Reference

<details>
<summary><b>Auth</b></summary>

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
```
</details>

<details>
<summary><b>Projects</b></summary>

```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/duplicate
GET    /api/projects/:id/download
```
</details>

<details>
<summary><b>AI</b></summary>

```
POST   /api/ai/generate
POST   /api/ai/modify
```
</details>

<details>
<summary><b>GitHub</b></summary>

```
GET    /api/github/status
GET    /api/github/connect
GET    /api/github/callback
POST   /api/github/disconnect
POST   /api/github/publish
POST   /api/github/push
```
</details>

<details>
<summary><b>Versions</b></summary>

```
GET    /api/versions/:projectId
GET    /api/versions/:projectId/compare
GET    /api/versions/:projectId/:versionId
POST   /api/versions/:projectId/:versionId/restore
```
</details>

<details>
<summary><b>Users</b></summary>

```
PUT    /api/users/profile
POST   /api/users/byok
DELETE /api/users/byok
```
</details>

---

## Security

- **Passwords**: hashed with bcrypt (12 rounds); never logged or returned in API responses.
- **Sessions**: JWTs use httpOnly cookies for same-origin deployments and a tab-scoped bearer token when the API is on another origin; the API also accepts `Authorization: Bearer` clients.
- **Secrets at rest**: GitHub tokens and BYOK keys are encrypted with AES-256-GCM and never sent back to the client.
- **Rate limiting**: dedicated limiters on `/api/auth/*` and `/api/ai/*`, plus a general limiter on the rest of `/api`.
- **Hardening**: `express-mongo-sanitize`, Helmet, and strict CORS (only `CLIENT_URL` is allowed).
- **Generated file safety**: every path is validated against path traversal, absolute paths, and reserved segments (`.git`, `node_modules`) before any save, ZIP, or GitHub push. See `server/src/utils/fileTree.js`.
- **No server-side execution**: generated backend code is never run on the WebForge server. It is stored, previewed (frontend only, in a sandboxed iframe), downloaded, or pushed to the user's own GitHub.

---

## Deployment

| Part | Suggested platforms | Notes |
|---|---|---|
| Frontend (`client/`) | GitHub Pages, Vercel, Netlify | GitHub Pages builds and deploys from the repository's Actions workflow. |
| Backend (`server/`) | Render (`render.yaml`), Railway, Fly.io | `render.yaml` defines the Express API service and health check. |
| Database | MongoDB Atlas (free tier) | `MONGODB_URI` is **required** in production. |

In production, set `CLIENT_URL` to the deployed frontend base URL and configure
`GITHUB_CALLBACK_URL` to match the callback registered with GitHub OAuth.

### GitHub Pages frontend

The workflow in `.github/workflows/deploy-pages.yml` publishes the client at
`https://atuldev-v.github.io/weforgeai/` when client or workflow changes are
pushed to `main`.
In the repository's **Settings → Pages**, set the build and deployment source
to **GitHub Actions**. GitHub Pages serves only the frontend; deploy the Express
server and MongoDB separately. Set the repository Actions variable
`VITE_API_URL` to your API's full base URL, including `/api` (for example,
`https://api.example.com/api`), and set the server's `CLIENT_URL` to the
frontend URL without a trailing slash.

### Express API and MongoDB setup

The root [`render.yaml`](render.yaml) deploys `webforge-ai/server` as a Render
web service. It starts the existing Express API, checks `/api/health`, generates
a production `JWT_SECRET`, and prompts for the database connection string.
It uses Render's free plan, which can spin down after 15 minutes idle and take
about a minute to wake up on the next API request.

1. Create a MongoDB Atlas cluster and database user. Add the Render service's
   outbound IP ranges to the Atlas IP access list, then copy Atlas's application
   connection string. Atlas accepts connections only from allowed IPs; see the
   [Atlas IP access list guide](https://www.mongodb.com/docs/atlas/security/ip-access-list/).
2. In Render, create a Blueprint from this repository and supply the Atlas URI
   when prompted for `MONGODB_URI`. Keep the URI private; don't commit it.
3. After the API deploys, set the repository Actions variable `VITE_API_URL` to
   `https://<your-render-service>.onrender.com/api`, then run the Pages workflow
   again. The API's `CLIENT_URL` is preconfigured for the Pages URL above.

For GitHub OAuth, set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in Render
and register `https://<your-render-service>.onrender.com/api/github/callback`
as the OAuth callback. The server derives this callback from Render's service
URL unless `GITHUB_CALLBACK_URL` is explicitly set.

When the API URL is on a different origin, the client uses a bearer token kept
in the current tab's `sessionStorage`; browsers may block cross-site cookies.
For deployments that require httpOnly-cookie-only auth, expose the API through
the same origin as the frontend.

### Production build

```bash
npm run build     # builds client/dist
npm run start     # starts the server (NODE_ENV=production)
```

---

## Project Status

WebForge AI is an early-stage project. The core local API flow has been smoke-checked with the mock provider and in-memory database. An automated end-to-end test suite is not included yet; optional integrations such as real AI providers, email, and GitHub OAuth need their own credentials and setup.

---

## Known Limitations

- The in-browser preview is a simplification (see [Live preview](#live-preview)). Run the downloaded project locally for full fidelity.
- Version **compare** returns a per-file added / modified / removed diff, not a line-by-line diff.
- The current scope covers the core loop (auth → generate → edit → preview → download / GitHub). There is no admin dashboard, automated test suite, or payment integration yet.
- Persistence across restarts requires setting `MONGODB_URI`.

---

## Roadmap

- [ ] Real bundler-based preview (esbuild-wasm or per-project sandboxed container)
- [ ] Line-level diffs in version compare
- [ ] Automated tests (Jest + Supertest for the API, React Testing Library for components)
- [ ] Admin dashboard and usage analytics (the `AIUsage` model already tracks token counts per generation)

---

## Contributing

Issues and PRs are welcome.

1. Fork the repo and create a feature branch.
2. Keep changes modular: one concern per file, thin controllers, business logic in `services/`.
3. Run the app locally before submitting a PR.
4. Describe what changed and why in the PR description.

---

## License

Released under the **MIT License**. See [LICENSE](./LICENSE).

WebForge AI is free and open source. If you connect a paid AI provider (OpenAI, Anthropic) with your own key, usage costs from that provider are your responsibility. Always review generated code before deploying it to production.
