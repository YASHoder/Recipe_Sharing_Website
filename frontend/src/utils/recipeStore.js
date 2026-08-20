import { recipes as defaultRecipes } from "../data/recipes";

// ======================================================
// STORAGE KEYS
// ======================================================
// "recipes"          -> array of recipes submitted by users at runtime
// "recipeOverrides"  -> { [recipeId]: partialRecipeFields } edits applied
//                       on top of either a default recipe or a user recipe
// "deletedRecipeIds" -> array of recipe ids that should be hidden, even if
//                       they still exist in the bundled defaults array
// ======================================================

const STORED_KEY = "recipes";
const OVERRIDES_KEY = "recipeOverrides";
const DELETED_KEY = "deletedRecipeIds";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable, ignore
  }
}

export function getStoredRecipes() {
  return readJSON(STORED_KEY, []);
}

export function getOverrides() {
  return readJSON(OVERRIDES_KEY, {});
}

export function getDeletedIds() {
  return readJSON(DELETED_KEY, []);
}

// Returns the full, de-duplicated, edited, non-deleted recipe list.
// This is the single source of truth every page should read from.
export function getAllRecipes() {
  const overrides = getOverrides();
  const deleted = new Set(getDeletedIds());
  const stored = getStoredRecipes();

  const merged = [...defaultRecipes, ...stored].map((recipe) => {
    const override = overrides[recipe.id];
    return override ? { ...recipe, ...override } : recipe;
  });

  // de-dupe by id, keeping the last occurrence (user edits win)
  const byId = new Map();
  merged.forEach((r) => byId.set(r.id, r));

  return Array.from(byId.values()).filter((r) => !deleted.has(r.id));
}

export function getRecipeById(id) {
  return getAllRecipes().find((r) => String(r.id) === String(id)) || null;
}

// Add a brand new user-submitted recipe (used by the Submit page).
export function addRecipe(recipe) {
  const stored = getStoredRecipes();
  stored.push(recipe);
  writeJSON(STORED_KEY, stored);
  return recipe;
}

// Edit any recipe — default or user-submitted.
// If it's a user-submitted recipe, patch it directly in "recipes".
// If it's a bundled default recipe, keep the patch in "recipeOverrides"
// so the change survives reloads without touching the source bundle.
export function updateRecipe(id, updates) {
  const stored = getStoredRecipes();
  const idx = stored.findIndex((r) => r.id === id);

  if (idx !== -1) {
    stored[idx] = { ...stored[idx], ...updates };
    writeJSON(STORED_KEY, stored);
  } else {
    const overrides = getOverrides();
    overrides[id] = { ...(overrides[id] || {}), ...updates };
    writeJSON(OVERRIDES_KEY, overrides);
  }
}

// Delete any recipe — default or user-submitted.
export function deleteRecipe(id) {
  // Remove it from user-submitted recipes if it lives there.
  const stored = getStoredRecipes().filter((r) => r.id !== id);
  writeJSON(STORED_KEY, stored);

  // Also mark it deleted in case it was one of the bundled defaults
  // (harmless no-op for recipes that were only ever user-submitted).
  const deleted = getDeletedIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    writeJSON(DELETED_KEY, deleted);
  }

  // Clean up any lingering override for the deleted id.
  const overrides = getOverrides();
  if (overrides[id]) {
    delete overrides[id];
    writeJSON(OVERRIDES_KEY, overrides);
  }
}

export function isDefaultRecipe(id) {
  return defaultRecipes.some((r) => r.id === id);
}
