import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import RecipeCard from '../components/RecipeCard'
import { api } from '../api/client'
import './RecipeDetail.css'

const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
    <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.44.91-5.32L2.27 6.62l5.34-.78z" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16">
    <circle cx="10" cy="10" r="8" />
    <path d="M10 5.5V10l3 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 20 20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" width="20" height="20">
    <path d="M10 17s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 17 8c0 4.65-7 9-7 9z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function RecipeDetail() {
  const { id } = useParams()
  const { isFavorite, toggleFavorite } = useFavorites()

  const [recipe, setRecipe]   = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/recipes/${id}`)
      .then((r) => {
        setRecipe(r)
        // Fetch related (same category, exclude current)
        return api.get(`/recipes/?category=${encodeURIComponent(r.category)}`)
      })
      .then((all) => setRelated(all.filter((r) => r.id !== id).slice(0, 3)))
      .catch(() => setError('Recipe not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p style={{ textAlign: 'center', padding: '4rem' }}>Loading…</p>
  if (error || !recipe) return <p style={{ textAlign: 'center', padding: '4rem' }}>{error || 'Recipe not found.'}</p>

  const fav = isFavorite(recipe.id)

  return (
    <div className="recipe-detail-page">
      {/* Hero */}
      <div className="recipe-hero" style={{ backgroundImage: `url(${recipe.image})` }}>
        <div className="recipe-hero-overlay">
          <div className="container">
            <span className="eyebrow">{recipe.category}</span>
            <h1>{recipe.title}</h1>
            <div className="recipe-meta">
              <span><StarIcon /> {recipe.rating} ({recipe.reviews} reviews)</span>
              <span><ClockIcon /> {recipe.time} min</span>
              <span>Serves {recipe.servings}</span>
              <span>{recipe.difficulty}</span>
            </div>
            <p className="recipe-author">By {recipe.author || recipe.authorName}</p>
          </div>
        </div>
      </div>

      <div className="container recipe-body">
        {/* Favorite button */}
        <button
          className={`btn ${fav ? 'btn-primary' : 'btn-outline'} recipe-fav-btn`}
          onClick={() => toggleFavorite(recipe.id)}
        >
          <HeartIcon filled={fav} />
          {fav ? 'Saved' : 'Save Recipe'}
        </button>

        <p className="recipe-description">{recipe.description}</p>

        <div className="recipe-columns">
          {/* Ingredients */}
          <section className="recipe-ingredients">
            <h2>Ingredients</h2>
            <ul>
              {recipe.ingredients.map((ing, i) => (
                <li key={ing.id || i}>
                  {ing.amount} {ing.unit} {ing.name}
                </li>
              ))}
            </ul>
          </section>

          {/* Steps */}
          <section className="recipe-steps">
            <h2>Method</h2>
            <ol>
              {(Array.isArray(recipe.steps) ? recipe.steps : []).map((step, i) => (
                <li key={i}>
                  {typeof step === 'string' ? step : step.text}
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="recipe-tags">
            {recipe.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="related-recipes">
            <h2>More {recipe.category}</h2>
            <div className="recipes-grid">
              {related.map((r) => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
