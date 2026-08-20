import { useState, useEffect, useCallback } from 'react'
import { categories } from '../data/recipes'
import RecipeCard from '../components/RecipeCard'
import { api } from '../api/client'
import './Recipes.css'

export default function Recipes() {
  const [recipes, setRecipes]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeCategory, setCategory] = useState('All')
  const [query, setQuery]             = useState('')
  const [sort, setSort]               = useState('')

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeCategory !== 'All') params.set('category', activeCategory)
      if (query.trim())             params.set('q', query.trim())
      if (sort)                     params.set('sort', sort)
      const data = await api.get(`/recipes/?${params}`)
      setRecipes(data)
    } catch {
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }, [activeCategory, query, sort])

  useEffect(() => { fetchRecipes() }, [fetchRecipes])

  return (
    <div className="recipes-page">
      <div className="recipes-header">
        <div className="container">
          <span className="eyebrow">The Box</span>
          <h1>All Recipes</h1>
          <p className="recipes-sub">
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} and counting.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Search + Sort */}
        <div className="recipes-toolbar">
          <input
            className="recipes-search"
            type="search"
            placeholder="Search recipes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="recipes-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Newest first</option>
            <option value="rating">Top rated</option>
            <option value="time">Quickest</option>
          </select>
        </div>

        {/* Category pills */}
        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`pill ${activeCategory === cat ? 'is-active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading recipes…</p>
        ) : recipes.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem' }}>No recipes found.</p>
        ) : (
          <div className="recipes-grid">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
