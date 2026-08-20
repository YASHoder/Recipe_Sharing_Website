import { useEffect, useState } from 'react'
import { useFavorites } from '../context/FavoritesContext'
import RecipeCard from '../components/RecipeCard'
import { api } from '../api/client'
import './Favorites.css'

export default function Favorites() {
  const { favorites } = useFavorites()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/recipes/favorites')
      .then(setRecipes)
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false))
  }, [favorites])   // re-fetch whenever favorites list changes

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <div className="container">
          <span className="eyebrow">Your Collection</span>
          <h1>Saved Recipes</h1>
          <p className="recipes-sub">
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved.
          </p>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading…</p>
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p>You haven't saved any recipes yet.</p>
            <p>Hit the heart on any recipe to save it here.</p>
          </div>
        ) : (
          <div className="recipes-grid">
            {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        )}
      </div>
    </div>
  )
}
