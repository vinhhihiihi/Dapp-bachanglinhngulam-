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
- `POST /api/follow/:creatorId`
- `DELETE /api/follow/:creatorId`
- `POST /api/donate`
- `GET /api/donations/:creatorId`

## Main Features Implemented

- Landing animation grid with zig-zag column motion (infinite loop)
- Creator profile page at `/creator/:id`
- Follow/Unfollow toggle persisted in DB
- Donate form + MetaMask transaction via ethers.js
- Donation message history per creator
- Loading states, hover effects, and responsive layout
- Lazy loading creators on landing page
