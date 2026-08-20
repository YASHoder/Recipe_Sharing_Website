import { useEffect, useState } from 'react'
import { recipes } from '../data/recipes'

const showcaseCards = recipes.slice(0, 5).map((r) => ({
  category: r.category,
  title: r.title,
  author: r.author,
  time: r.time,
}))

export default function AuthShowcase({ eyebrow, heading, copy }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % showcaseCards.length)
    }, 3200)
    return () => clearInterval(id)
  }, [])

  const prev = (active - 1 + showcaseCards.length) % showcaseCards.length

  return (
    <div className="auth-showcase">
      <div className="auth-showcase-top">
        <span className="nav-brand">
          <span className="auth-brand-mark">TT</span>
          <span className="auth-brand-name">Tasty Table</span>
        </span>
      </div>

      <div className="auth-showcase-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{heading}</h1>
        <p>{copy}</p>

        <div className="card-box" aria-hidden="true">
          {showcaseCards.map((c, i) => {
            let cls = ''
            if (i === active) cls = 'is-active'
            else if (i === prev) cls = 'is-prev'
            return (
              <div key={c.title} className={`index-card ${cls}`}>
                <span className="index-card-cat">{c.category}</span>
                <span className="index-card-title">{c.title}</span>
                <span className="index-card-meta">
                  <span>by <strong>{c.author}</strong></span>
                  <span>{c.time} min</span>
                </span>
              </div>
            )
          })}
        </div>

        <div className="card-box-dots">
          {showcaseCards.map((c, i) => (
            <span key={c.title} className={i === active ? 'is-active' : ''} />
          ))}
        </div>
      </div>

      <div className="auth-showcase-stats">
        <div>
          <strong>2,400+</strong>
          <span>Recipes shared</span>
        </div>
        <div>
          <strong>18k</strong>
          <span>Home cooks</span>
        </div>
        <div>
          <strong>4.8★</strong>
          <span>Avg. rating</span>
        </div>
      </div>
    </div>
  )
}
