# Buy Me A Coffee - Creator Support Dapp

Fullstack app:
- Frontend: React (Vite), CSS animation, ethers.js
- Backend: Node.js + Express + MongoDB (Mongoose)

## Quick Start

1. Install dependencies:
```bash
npm install
npm --prefix client install
```

2. Create env file:
```bash
copy server\\.env.example server\\.env
```

Admin credentials for `/admin` are read from `server/.env`:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_TOKEN_SECRET=replace_with_a_strong_secret
ADMIN_TOKEN_EXPIRES_SECONDS=43200
```

3. Start MongoDB locally, then seed data:
```bash
npm run seed
```

4. Run backend and frontend:
```bash
npm run dev:server
npm run dev:client
```

No local MongoDB? Run memory mode:
```bash
npm run dev:server:memory
```

Frontend default: `http://localhost:5173`  
Backend default: `http://localhost:4000`

## API

- `GET /api/creators`
- `GET /api/creators/:id`
- `POST /api/creators`
- `PATCH /api/creators/:id`
- `DELETE /api/creators/:id`
- `POST /api/admin/login`
- `GET /api/admin/session`
- `POST /api/follow/:creatorId`
- `DELETE /api/follow/:creatorId`
- `POST /api/donate`
- `GET /api/donations/:creatorId`

## Main Features Implemented

- Landing animation grid with zig-zag column motion (infinite loop)
- Creator profile page at `/creator/:id`
- Admin page at `/admin` with login, create, search, edit, delete creator
- Follow/Unfollow toggle persisted in DB
- Donate form + MetaMask transaction via ethers.js
- Donation message history per creator
- Loading states, hover effects, and responsive layout
- Lazy loading creators on landing page
