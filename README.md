# Sweeties Backend API (Node.js + TypeScript)

Backend API for **Sweeties** built with **Express + TypeScript + MongoDB (Mongoose)** following a clean, scalable structure inspired by the Workout App API:

- **Modules** (auth, users, items, orders, adminSettings, themes, dashboard, public, refreshTokens)
- **Controller / Service / Schemas (Zod) / Routes**
- Production-ready middleware and config patterns

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Validation**: Zod
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (Access + Refresh)
- **Uploads**: Cloudinary (multer + cloudinary storage)
- **Tooling**: pnpm, nodemon, tsx

---

## Project Structure

```
src/
  app.ts
  server.ts
  config/
  middlewares/
  utils/
  integrations/
  modules/
    auth/
    users/
    items/
    orders/
    adminSettings/
    themes/
    dashboard/
    public/
    refreshTokens/
```

---

## Getting Started

### 1) Install dependencies

```bash
pnpm install
```

### 2) Environment variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=4000

MONGO_URI=
MONGO_DB_NAME=sweeties

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

CORS_ORIGINS=http://localhost:5173

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> Do not commit `.env`. Use `.env.example` as a template.

### 3) Run in development

```bash
pnpm dev
```

The API should be available at:

- `http://localhost:4000/health`

---

## Scripts

- `pnpm dev` — run with nodemon + tsx
- `pnpm build` — compile TypeScript to `/dist`
- `pnpm start` — run production build from `/dist`

---

## API Health Check

- `GET /health`
  - Returns `{ ok: true }`

---

## Authentication Strategy

This API follows a secure pattern:

- **Access token** is returned in JSON (client may store it in memory/Zustand).
- **Refresh token** is stored server-side and is intended to be delivered via **HttpOnly cookie** with **rotation** on refresh (Spring parity).

> Note: Cross-domain deployments (Vercel + Railway) usually require cookies with:
- `SameSite=None`
- `Secure=true`

---

## Development Notes

- Keep controllers thin and move business logic into services.
- All request/response validation should be handled via Zod schemas + a validation middleware.
- Prefer consistent error handling with a centralized error middleware.

---

## Next Milestones (Spring Parity)

- Auth refresh token rotation (cookie-based)
- Themes module (`GET /api/themes`, `PUT /api/themes/me`)
- Dashboard stats (`GET /api/dashboard/stats`)
- Public endpoints:
  - Contact (`POST /api/public/contact`)
  - Track order (`POST /api/public/orders/track`)
- Advanced Orders:
  - Search filters
  - CSV export

---

## License

Private / Internal project.
