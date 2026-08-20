import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categories } from '../data/recipes'
import { api } from '../api/client'
import './Submit.css'

const emptyIngredient = () => ({ id: crypto.randomUUID(), amount: '', unit: '', name: '' })
const emptyStep       = () => ({ id: crypto.randomUUID(), text: '' })

export default function Submit() {
  const navigate = useNavigate()

  const [title, setTitle]           = useState('')
  const [category, setCategory]     = useState('Mains')
  const [time, setTime]             = useState('')
  const [servings, setServings]     = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState([emptyIngredient()])
  const [steps, setSteps]           = useState([emptyStep()])
  const [image, setImage]           = useState('')
  const [submitted, setSubmitted]   = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  function updateIngredient(id, field, value) {
    setIngredients((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i))
  }
  function updateStep(id, value) {
    setSteps((prev) => prev.map((s) => s.id === id ? { ...s, text: value } : s))
  }
  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!title || !description) { setError('Please fill all required fields.'); return }

    setLoading(true)
    try {
      await api.post('/recipes/', {
        title,
        category,
        description,
        image,
        time: Number(time),
        servings: Number(servings),
        difficulty: 'Easy',
        ingredients,
        steps: steps.map((s) => s.text),
        tags: [],
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to submit recipe.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="submit-page">
        <div className="container submit-success">
          <span className="eyebrow">Recipe Added</span>
          <h1>Thank You!</h1>
          <p><strong>{title}</strong> has been added successfully.</p>
          <button className="btn btn-outline" onClick={() => {
            setSubmitted(false); setTitle(''); setCategory('Mains'); setTime('');
            setServings(''); setDescription(''); setIngredients([emptyIngredient()]);
            setSteps([emptyStep()]); setImage('');
          }}>
            Add Another Recipe
          </button>
          <button className="btn btn-primary" style={{ marginLeft: '1rem' }} onClick={() => navigate('/recipes')}>
            Browse Recipes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="submit-page">
      <div className="submit-header">
        <div className="container">
          <span className="eyebrow">Add To The Box</span>
          <h1>Share Your Recipe</h1>
          <p className="recipes-sub">Tell everyone how you make it.</p>
        </div>
      </div>

      <div className="container">
        <form className="submit-form" onSubmit={handleSubmit}>

          {/* BASICS */}
          <div className="form-section">
            <h2>The Basics</h2>
            <div className="form-grid">
              <label className="span-2">
                Recipe Title
                <input type="text" required placeholder="Creamy Garlic Pasta" value={title}
                  onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label>
                Category
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>
                Cooking Time (Minutes)
                <input type="number" required min="1" value={time}
                  onChange={(e) => setTime(e.target.value)} placeholder="30" />
              </label>
              <label>
                Servings
                <input type="number" required min="1" value={servings}
                  onChange={(e) => setServings(e.target.value)} placeholder="4" />
              </label>
              <label className="span-2">
                Description
                <textarea rows="4" required placeholder="Write a short description about your recipe…"
                  value={description} onChange={(e) => setDescription(e.target.value)} />
              </label>
              <label className="span-2">
                Recipe Image
                <input type="file" accept="image/*" onChange={handleImage} />
              </label>
              {image && (
                <div className="span-2">
                  <img src={image} alt="Recipe Preview"
                    style={{ width: '100%', maxWidth: '350px', borderRadius: '12px', marginTop: '15px', objectFit: 'cover', border: '2px solid #ddd' }} />
                </div>
              )}
            </div>
          </div>

          {/* INGREDIENTS */}
          <div className="form-section">
            <div className="form-section-head">
              <h2>Ingredients</h2>
              <button type="button" className="btn btn-ghost btn-small"
                onClick={() => setIngredients((prev) => [...prev, emptyIngredient()])}>
                + Add Ingredient
              </button>
            </div>
            <div className="ingredient-rows">
              {ingredients.map((ingredient, index) => (
                <div className="ingredient-row" key={ingredient.id}>
                  <input type="text" placeholder="Amount" value={ingredient.amount}
                    onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)} />
                  <input type="text" placeholder="Unit" value={ingredient.unit}
                    onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)} />
                  <input type="text" required placeholder="Ingredient" value={ingredient.name}
                    onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)} />
                  {ingredients.length > 1 && (
                    <button type="button" className="row-remove"
                      onClick={() => setIngredients((prev) => prev.filter((_, i) => i !== index))}>×</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* METHOD */}
          <div className="form-section">
            <div className="form-section-head">
              <h2>Method</h2>
              <button type="button" className="btn btn-ghost btn-small"
                onClick={() => setSteps((prev) => [...prev, emptyStep()])}>
                + Add Step
              </button>
            </div>
            <div className="step-rows">
              {steps.map((step, index) => (
                <div className="step-row" key={step.id}>
                  <span className="step-num">{index + 1}</span>
                  <textarea rows="3" required placeholder="Describe this cooking step…"
                    value={step.text} onChange={(e) => updateStep(step.id, e.target.value)} />
                  {steps.length > 1 && (
                    <button type="button" className="row-remove"
                      onClick={() => setSteps((prev) => prev.filter((_, i) => i !== index))}>×</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? 'Sharing…' : 'Share Recipe'}
          </button>
        </form>
      </div>
    </div>
  )
}
