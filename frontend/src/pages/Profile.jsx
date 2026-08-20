import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import './Profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateProfile, logout: authLogout } = useAuth()

  const [recipes, setRecipes] = useState([])
  const [editing, setEditing] = useState(false)
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [image, setImage]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    setName(user.name)
    setEmail(user.email)
    setImage(user.image || '')
    api.get('/recipes/my').then(setRecipes).catch(() => setRecipes([]))
  }, [user, navigate])

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  const saveProfile = async () => {
    setError('')
    setSaving(true)
    const result = await updateProfile({ name, email, image })
    setSaving(false)
    if (result === true) {
      setEditing(false)
    } else {
      setError(result || 'Failed to save profile.')
    }
  }

  const logout = () => {
    authLogout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="profile-page">
      <div className="profile-card">
        <img
          src={image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`}
          alt={name}
          className="profile-image"
        />

        {editing && <input type="file" accept="image/*" onChange={handleImage} />}

        {editing ? (
          <>
            <input value={name}  onChange={(e) => setName(e.target.value)}  className="edit-input" placeholder="Name" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="edit-input" placeholder="Email" />
          </>
        ) : (
          <>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {user.role === 'admin' ? '⭐ Admin' : 'Member'}
            </p>
          </>
        )}

        <div className="profile-info">
          <div className="info-box">
            <h3>{recipes.length}</h3>
            <span>Recipes</span>
          </div>
          <div className="info-box">
            <h3>{user.joined}</h3>
            <span>Joined</span>
          </div>
        </div>

        {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

        {editing ? (
          <button className="edit-btn" onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        ) : (
          <button className="edit-btn" onClick={() => setEditing(true)}>Edit Profile</button>
        )}

        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      <div className="my-recipes">
        <h2>My Recipes</h2>
        {recipes.length === 0 ? (
          <p>No recipes uploaded yet.</p>
        ) : (
          recipes.map((recipe) => (
            <div className="recipe-card" key={recipe.id}>
              {recipe.image && <img src={recipe.image} alt={recipe.title} />}
              <div>
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
