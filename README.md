# 🍽️ Tasty Table — Flask + React Full-Stack

A recipe sharing web app with a **Flask REST API backend** and a **React (Vite) frontend**.

---

## Project Structure

```
tasty_table_flask/
├── backend/                  # Flask application package
│   ├── __init__.py           # App factory (create_app)
│   ├── extensions.py         # SQLAlchemy, JWT, CORS instances
│   ├── seed.py               # Seeds 12 built-in recipes on first run
│   ├── models/
│   │   └── models.py         # User, Recipe SQLAlchemy models
│   └── routes/
│       ├── auth.py           # /api/auth/* — register, login, profile
│       ├── recipes.py        # /api/recipes/* — CRUD, favorites
│       └── admin.py          # /api/admin/* — admin panel endpoints
├── frontend/                 # React + Vite source
│   ├── src/
│   │   ├── api/client.js     # Thin fetch() wrapper with JWT injection
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Auth state backed by Flask API
│   │   │   └── FavoritesContext.jsx # Favorites backed by Flask API
│   │   └── pages/            # All pages updated to use API
│   ├── dist/                 # Built frontend (served by Flask)
│   └── vite.config.js        # Proxy /api → Flask in dev mode
├── run.py                    # Entry point: python run.py
├── requirements.txt
└── README.md
```

---

## Quick Start

### 1. Install Python dependencies

```bash
cd tasty_table_flask
pip install -r requirements.txt
```

### 2. Run the server

```bash
python run.py
```

Open **http://localhost:5000** — Flask serves the pre-built React frontend.

> The SQLite database (`tasty_table.db`) and all 12 seed recipes are created automatically on first run.

---

## Development Mode (hot-reload)

Run Flask and Vite dev server simultaneously:

**Terminal 1 — Flask backend:**
```bash
cd tasty_table_flask
python run.py
```

**Terminal 2 — Vite frontend (hot-reload):**
```bash
cd tasty_table_flask/frontend
npm install
npm run dev
```

Open **http://localhost:5173** — Vite proxies `/api/*` to Flask at port 5000.

---

## Rebuild the Frontend

After making changes to the React source:

```bash
cd tasty_table_flask/frontend
npm run build
```

Then restart Flask — it will serve the new `dist/`.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | `change-me-in-production` | Flask secret key |
| `JWT_SECRET_KEY` | `jwt-secret-change-me` | JWT signing key |
| `DATABASE_URL` | `sqlite:///tasty_table.db` | SQLAlchemy DB URI |

Set them in a `.env` file or export before running.

---

## API Reference

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register new user |
| POST | `/login` | — | Login, returns JWT token |
| POST | `/logout` | ✅ | Logout (client discards token) |
| GET | `/me` | ✅ | Get current user profile |
| PUT | `/me` | ✅ | Update name / email / image / password |
| DELETE | `/me` | ✅ | Delete own account |

### Recipes — `/api/recipes`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all recipes (`?category=&q=&sort=`) |
| POST | `/` | ✅ | Create new recipe |
| GET | `/:id` | — | Get single recipe |
| PUT | `/:id` | ✅ | Update recipe (owner or admin) |
| DELETE | `/:id` | ✅ | Delete recipe (owner or admin) |
| POST | `/:id/favorite` | ✅ | Toggle favorite |
| GET | `/favorites` | ✅ | List current user's favorites |
| GET | `/my` | ✅ | List current user's submitted recipes |

### Admin — `/api/admin` (admin role required)

| Method | Path | Description |
|---|---|---|
| GET | `/stats` | Dashboard stats |
| GET | `/users` | List all users |
| PUT | `/users/:id/role` | Promote / demote user |
| DELETE | `/users/:id` | Delete user |
| GET | `/recipes` | List all recipes (with search/filter) |
| PUT | `/recipes/:id` | Edit any recipe |
| DELETE | `/recipes/:id` | Delete any recipe |

---

## Admin Access

- The **first registered user** is automatically made an admin.
- Subsequent users can get admin access by entering the code **`TASTY-ADMIN-2024`** in the Admin Access Code field during registration.
- Change this code in `backend/routes/auth.py` → `ADMIN_CODE` before deploying.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, Flask 3, SQLAlchemy, Flask-JWT-Extended, Flask-CORS |
| Database | SQLite (swap to PostgreSQL via `DATABASE_URL`) |
| Frontend | React 18, Vite 5, React Router 6 |
| Auth | JWT (Bearer token, stored in localStorage) |
| Passwords | Werkzeug `generate_password_hash` / `check_password_hash` |
