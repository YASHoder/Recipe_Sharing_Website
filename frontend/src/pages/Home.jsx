import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { categories } from '../data/recipes'
import RecipeCard from '../components/RecipeCard'
import { api } from '../api/client'
import './Home.css'

export default function Home() {
  const [recipes, setRecipes] = useState([])

  useEffect(() => {
    api.get('/recipes/').then(setRecipes).catch(() => setRecipes([]))
  }, [])

  const featured = recipes.slice(0, 3)
  const trending  = [...recipes].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 6)

  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Recipe box, volume four</span>
            <h1>Cook something worth writing down.</h1>
            <p className="hero-lede">
              Tasty Table is a growing collection of recipes from home cooks
              who actually tested them twice on a weeknight with regular groceries.
            </p>
            <div className="hero-actions">
              <Link to="/recipes" className="btn btn-primary">Browse recipes</Link>
              <Link to="/submit"  className="btn btn-outline">Share your own</Link>
            </div>
            <div className="hero-stats">
              <div><strong>{recipes.length}+</strong><span>Tested recipes</span></div>
              <div><strong>{categories.length - 1}</strong><span>Categories</span></div>
              <div><strong>4.7</strong><span>Average rating</span></div>
            </div>
          </div>

          <div className="hero-media">
            <img src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=900&q=80" alt="Hero" />
            {featured.length > 0 && (
              <div className="hero-card">
                <span className="hero-card-label">This week's pick</span>
                <strong>{featured[0].title}</strong>
                <span className="hero-card-meta">{featured[0].time} min · {featured[0].difficulty}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section-tight categories-strip">
        <div className="container">
          <div className="categories-row">
            {categories.filter((c) => c !== 'All').map((cat) => (
              <Link key={cat} to={`/recipes?category=${cat}`} className="category-chip">{cat}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Editor's Picks</span>
              <h2>Featured This Week</h2>
            </div>
            <Link to="/recipes" className="section-link">View all recipes →</Link>
          </div>
          <div className="card-grid">
            {featured.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-tight how">
        <div className="container how-grid">
          <div>
            <span className="eyebrow">How it works</span>
            <h2>Built by cooks, for cooks</h2>
          </div>
          <div className="how-steps">
            <div className="how-step">
              <span className="how-num">01</span>
              <h3>Browse by mood</h3>
              <p>Filter by category, cooking time, or difficulty until you find today's perfect recipe.</p>
            </div>
            <div className="how-step">
              <span className="how-num">02</span>
              <h3>Cook with confidence</h3>
              <p>Every recipe includes ingredients, timing, and detailed instructions from real home cooks.</p>
            </div>
            <div className="how-step">
              <span className="how-num">03</span>
              <h3>Save & Share</h3>
              <p>Save your favourites and upload your own recipes for everyone to enjoy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Community Favorites</span>
              <h2>Most Cooked This Month</h2>
            </div>
          </div>
          <div className="card-grid card-grid-wide">
            {trending.length === 0 ? (
              <p style={{ textAlign: 'center', width: '100%' }}>No recipes available.</p>
            ) : (
              trending.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container cta-inner">
          <h2>Have a recipe people always ask for?</h2>
          <p>Share your favourite recipe with the community and inspire thousands of food lovers.</p>
          <Link to="/submit" className="btn btn-primary">Share a Recipe</Link>
        </div>
      </section>

    </div>
  )
}
