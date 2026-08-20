# Tasty Table

A professional, multi-page recipe sharing website built with React, Vite, and React Router.

## Pages

- **Home** (`/`) — hero, featured recipes, categories, trending recipes
- **Recipes** (`/recipes`) — searchable, filterable recipe browser
- **Recipe detail** (`/recipes/:id`) — full recipe with a servings scaler and ingredient checklist
- **Saved** (`/favorites`) — your saved recipes (persisted to localStorage)
- **Share a recipe** (`/submit`) — multi-field submission form
- **About** (`/about`) — story, team, FAQ, and contact form

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Tech

- React 18 + Vite
- React Router v6 for client-side routing
- Plain CSS with a shared design-token system (`src/index.css`)
- No backend — recipe data lives in `src/data/recipes.js`, and saved
  recipes persist to `localStorage` via `src/context/FavoritesContext.jsx`

## Customizing

- Add or edit recipes in `src/data/recipes.js`
- Colors, fonts, and spacing tokens are defined at the top of `src/index.css`
- Each page has its own co-located CSS file in `src/pages/`

## Troubleshooting

**"Failed to resolve import react-router-dom"**
This means `npm install` didn't finish before `npm run dev` was run. Fix it with a clean install:

```bash
# Windows
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev

# Mac / Linux
rm -rf node_modules package-lock.json
npm install
npm run dev
```

Wait for `npm install` to print a summary line (it will look like `added 63 packages in 4s`) before running `npm run dev`. It's normal for `npm install` to end with a line like `2 vulnerabilities (1 moderate, 1 high)` — that's just an advisory about dev tooling and does not mean the install failed.
