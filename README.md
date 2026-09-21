# Aurelia Store — HAXCAMP Technical Task

Aurelia is a polished full-stack e-commerce application built for the HAXCAMP Full Stack Web Developer technical task. It includes a customer storefront, cart and checkout flow, a Node/Express API, PostgreSQL persistence, admin authentication, catalogue management, order management, and an analytics dashboard.

## Architecture

```text
React + Vite
     │
     ▼
Node.js + Express REST API
     │
     ▼
PostgreSQL (Supabase/Neon)
```

The browser talks to the Express API. Database credentials stay on the server; the React client only receives API responses.

## Tech stack

- React 19 + Vite
- React Router
- Recharts
- Node.js + Express
- PostgreSQL via `pg`
- JWT + bcryptjs authentication
- Supabase PostgreSQL (development/demo database)

## Features

### Storefront
- Landing page with featured product
- Product catalogue with search and category filters
- Product details
- Cart with quantity controls
- Checkout and order confirmation
- Immediate loading/success feedback
- Responsive layout

### Admin
- JWT-protected admin login
- Dashboard KPI cards
- Six-month revenue trend
- Revenue by category
- Top products
- Order-status breakdown
- Recent orders
- Product create/edit/delete
- Order status management
- Clear loading and error states

## Project structure

```text
client/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Feedback.jsx
│   │   ├── Icons.jsx
│   │   ├── Layout.jsx
│   │   └── ProductCard.jsx
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── OrderManager.jsx
│   │   │   ├── Overview.jsx
│   │   │   └── ProductManager.jsx
│   │   └── store/
│   │       ├── Cart.jsx
│   │       ├── Checkout.jsx
│   │       ├── Home.jsx
│   │       ├── ProductDetails.jsx
│   │       └── Products.jsx
│   ├── api.js
│   ├── main.jsx
│   ├── styles.css
│   └── utils.js
└── package.json

server/
├── sql/schema.sql
├── src/
│   ├── auth.js
│   ├── db.js
│   ├── index.js
│   └── seed.js
└── package.json
```

## Local setup

### 1. Database

Create a PostgreSQL database. Supabase or Neon can be used. Run the contents of `server/sql/schema.sql` in the database SQL editor.

### 2. Server

```powershell
cd server
npm install
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Set these variables in `server/.env`:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

Then:

```bash
npm run seed
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Client

```powershell
cd client
npm install
copy .env.example .env
npm run dev
```

On macOS/Linux use `cp .env.example .env`.

The Vite development URL is normally `http://localhost:5173`.

## Important security notes

- Real `.env` files are intentionally excluded from Git.
- Never commit `DATABASE_URL`, `JWT_SECRET`, or admin passwords.
- Demo credentials should be shared with evaluators separately rather than embedded in the client application.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health check |
| POST | `/api/auth/login` | Admin login |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Product details |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| POST | `/api/orders` | Create order |
| GET | `/api/admin/overview` | Dashboard analytics (admin) |
| GET | `/api/admin/orders` | List orders (admin) |
| PATCH | `/api/admin/orders/:id/status` | Update order status (admin) |

## Deployment

Recommended free-tier demo setup:

```text
Vercel / Render static site
          │
          ▼
     React frontend
          │
          ▼
     Render web service
          │
          ▼
      Supabase DB
```

For production deployment, set `VITE_API_URL` on the frontend to the live backend `/api` URL. On the backend, set `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, and the live `CLIENT_URL`.

## Demo limitations

This is an assessment/demo application. Checkout intentionally stops at order creation and does not process real payments. Product images are loaded from remote Unsplash URLs.
