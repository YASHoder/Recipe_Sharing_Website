import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);   // array of recipe IDs

  // Load favorites from backend whenever the logged-in user changes
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    api.get("/recipes/favorites")
      .then((recipes) => setFavorites(recipes.map((r) => r.id)))
      .catch(() => setFavorites([]));
  }, [user]);

  const toggleFavorite = useCallback(async (id) => {
    try {
      const { favorited } = await api.post(`/recipes/${id}/favorite`);
      setFavorites((prev) =>
        favorited ? [...prev, id] : prev.filter((f) => f !== id)
      );
    } catch {
      // silently ignore
    }
  }, []);

  const isFavorite = useCallback(
    (id) => favorites.includes(id),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
