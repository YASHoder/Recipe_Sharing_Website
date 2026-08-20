import { Fragment, useEffect, useMemo, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { categories } from '../data/recipes'
import { api } from '../api/client'
import './Admin.css'

function emptyDraftFrom(recipe) {
  return {
    title:       recipe.title       || '',
    category:    recipe.category    || 'Mains',
    time:        recipe.time        || '',
    servings:    recipe.servings    || '',
    difficulty:  recipe.difficulty  || 'Easy',
    description: recipe.description || '',
    image:       recipe.image       || '',
  }
}

export default function Admin() {
  const { user } = useAuth()

  const [tab, setTab]   = useState('recipes')
  const [recipes, setRecipes] = useState([])
  const [users, setUsers]     = useState([])
  const [stats, setStats]     = useState(null)

  const [query, setQuery]               = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft]         = useState(null)

  const [confirmDeleteRecipe, setConfirmDeleteRecipe] = useState(null)
  const [confirmDeleteUser, setConfirmDeleteUser]     = useState(null)

  const refresh = useCallback(async () => {
    try {
      const [r, u, s] = await Promise.all([
        api.get('/admin/recipes'),
        api.get('/admin/users'),
        api.get('/admin/stats'),
      ])
      setRecipes(r)
      setUsers(u)
      setStats(s)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchesQuery =
        query.trim() === '' ||
        r.title?.toLowerCase().includes(query.toLowerCase()) ||
        (r.authorName || r.author || '').toLowerCase().includes(query.toLowerCase())
      const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter
      return matchesQuery && matchesCategory
    })
  }, [recipes, query, categoryFilter])

  function startEdit(recipe) { setEditingId(recipe.id); setDraft(emptyDraftFrom(recipe)) }
  function cancelEdit()      { setEditingId(null); setDraft(null) }

  async function saveEdit(id) {
    try {
      await api.put(`/admin/recipes/${id}`, {
        ...draft,
        time:     Number(draft.time)     || 0,
        servings: Number(draft.servings) || 1,
      })
      setEditingId(null); setDraft(null)
      refresh()
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDeleteRecipe(id) {
    try {
      await api.delete(`/admin/recipes/${id}`)
      setConfirmDeleteRecipe(null)
      refresh()
    } catch (err) { alert(err.message) }
  }

  async function handleRoleToggle(u) {
    try {
      await api.put(`/admin/users/${u.id}/role`, { role: u.role === 'admin' ? 'user' : 'admin' })
      refresh()
    } catch (err) { alert(err.message) }
  }

  async function handleDeleteUser(id) {
    try {
      await api.delete(`/admin/users/${id}`)
      setConfirmDeleteUser(null)
      refresh()
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <span className="eyebrow">Control Room</span>
          <h1>Admin Panel</h1>
          <p className="admin-sub">
            Signed in as <strong>{user?.name}</strong>. From here you can edit or remove any recipe, and manage community accounts.
          </p>
          {stats && (
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <span>👥 {stats.totalUsers} users</span>
              <span>🍽️ {stats.totalRecipes} recipes</span>
              <span>📝 {stats.userRecipes} user-submitted</span>
            </div>
          )}
        </div>
      </div>

      <div className="container admin-body">
        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'recipes' ? 'is-active' : ''}`} onClick={() => setTab('recipes')}>
            Recipes ({recipes.length})
          </button>
          <button className={`admin-tab ${tab === 'users' ? 'is-active' : ''}`} onClick={() => setTab('users')}>
            Users ({users.length})
          </button>
        </div>

        {tab === 'recipes' && (
          <div className="admin-panel">
            <div className="admin-toolbar">
              <input type="text" className="admin-search" placeholder="Search by title or author…"
                value={query} onChange={(e) => setQuery(e.target.value)} />
              <select className="admin-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Recipe</th><th>Category</th><th>Author</th><th>Time</th>
                    <th className="admin-actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipes.map((recipe) => (
                    <Fragment key={recipe.id}>
                      <tr>
                        <td className="admin-recipe-cell">
                          <img src={recipe.image} alt="" onError={(e) => { e.target.style.visibility = 'hidden' }} />
                          <span>{recipe.title}</span>
                        </td>
                        <td>{recipe.category}</td>
                        <td>{recipe.authorName || recipe.author || '—'}</td>
                        <td>{recipe.time} min</td>
                        <td className="admin-actions-col">
                          <button className="btn btn-ghost btn-small"
                            onClick={() => editingId === recipe.id ? cancelEdit() : startEdit(recipe)}>
                            {editingId === recipe.id ? 'Close' : 'Edit'}
                          </button>
                          <button className="btn btn-outline btn-small btn-danger"
                            onClick={() => setConfirmDeleteRecipe(recipe.id)}>Delete</button>
                        </td>
                      </tr>

                      {editingId === recipe.id && draft && (
                        <tr className="admin-edit-row">
                          <td colSpan={5}>
                            <div className="admin-edit-form">
                              <label>Title<input type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
                              <label>Category
                                <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                                  {categories.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </label>
                              <label>Time (min)<input type="number" min="1" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} /></label>
                              <label>Servings<input type="number" min="1" value={draft.servings} onChange={(e) => setDraft({ ...draft, servings: e.target.value })} /></label>
                              <label>Difficulty
                                <select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })}>
                                  <option>Easy</option><option>Medium</option><option>Involved</option><option>Hard</option>
                                </select>
                              </label>
                              <label className="span-2">Image URL<input type="text" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} /></label>
                              <label className="span-2">Description<textarea rows="3" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
                              <div className="admin-edit-actions span-2">
                                <button className="btn btn-primary btn-small" onClick={() => saveEdit(recipe.id)}>Save Changes</button>
                                <button className="btn btn-ghost btn-small" onClick={cancelEdit}>Cancel</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                  {filteredRecipes.length === 0 && (
                    <tr><td colSpan={5} className="admin-empty">No recipes match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="admin-panel">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>User</th><th>Email</th><th>Joined</th><th>Role</th><th className="admin-actions-col">Actions</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="admin-recipe-cell">
                        <img src={u.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} alt="" />
                        <span>{u.name}</span>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.joined}</td>
                      <td>
                        <span className={`source-pill ${u.role === 'admin' ? 'is-default' : 'is-user'}`}>
                          {u.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="admin-actions-col">
                        <button className="btn btn-ghost btn-small" onClick={() => handleRoleToggle(u)}>
                          {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>
                        <button className="btn btn-outline btn-small btn-danger" onClick={() => setConfirmDeleteUser(u.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={5} className="admin-empty">No users yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* DELETE RECIPE MODAL */}
      {confirmDeleteRecipe && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <h3>Delete this recipe?</h3>
            <p>This can't be undone.</p>
            <div className="admin-modal-actions">
              <button className="btn btn-outline btn-small" onClick={() => setConfirmDeleteRecipe(null)}>Cancel</button>
              <button className="btn btn-primary btn-small btn-danger-solid" onClick={() => handleDeleteRecipe(confirmDeleteRecipe)}>Delete Recipe</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER MODAL */}
      {confirmDeleteUser && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <h3>Delete this account?</h3>
            <p>The user will be removed permanently.</p>
            <div className="admin-modal-actions">
              <button className="btn btn-outline btn-small" onClick={() => setConfirmDeleteUser(null)}>Cancel</button>
              <button className="btn btn-primary btn-small btn-danger-solid" onClick={() => handleDeleteUser(confirmDeleteUser)}>Delete User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}