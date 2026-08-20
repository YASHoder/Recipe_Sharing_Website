import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthShowcase from '../components/AuthShowcase'
import './Auth.css'

const UserIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="10" cy="6.5" r="3.2" />
    <path d="M3.5 17c1-3.4 4-5 6.5-5s5.5 1.6 6.5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const MailIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
    <path d="M3 5.5l7 5.5 7-5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const LockIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="4" y="9" width="12" height="8" rx="2" />
    <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" strokeLinecap="round" />
  </svg>
)
const EyeIcon = ({ off }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    {off ? (
      <>
        <path d="M3 3l14 14" strokeLinecap="round" />
        <path d="M10 5.5c4 0 6.5 4.5 6.5 4.5s-.9 1.6-2.5 2.9M6.4 6.5C4.2 7.7 3 10 3 10s2.5 4.5 7 4.5c1 0 1.9-.2 2.7-.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.3 8.4a2 2 0 0 0 2.9 2.8" strokeLinecap="round" />
      </>
    ) : (
      <>
        <path d="M3 10s2.5-4.5 7-4.5S17 10 17 10s-2.5 4.5-7 4.5S3 10 3 10z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="10" r="2" />
      </>
    )}
  </svg>
)

function strengthOf(password) {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColors = ['var(--line)', '#C1502E', '#E3A83B', '#7C9473', '#4E7A44']

export default function Register() {
  const auth = useAuth()
  const nav  = useNavigate()

  const [f, set] = useState({ name: '', email: '', password: '', confirm: '', adminCode: '' })
  const [showPw, setShowPw]         = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [profileImage, setProfileImage] = useState('')
  const [previewImage, setPreviewImage] = useState('')

  const strength = useMemo(() => strengthOf(f.password), [f.password])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImage(reader.result)
      setPreviewImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!f.name || !f.email || !f.password) { setError('Fill in your name, email and password.'); return }
    if (f.password.length < 6)              { setError('Password must be at least 6 characters.'); return }
    if (f.password !== f.confirm)           { setError('Passwords do not match.'); return }
    if (!profileImage)                      { setError('Please choose a profile picture.'); return }

    setLoading(true)
    const result = await auth.register(f.name, f.email, f.password, profileImage, f.adminCode)
    setLoading(false)

    if (result === true) {
      nav('/')
    } else {
      setError(result || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="auth-screen">
      <AuthShowcase
        eyebrow="Join the table"
        heading="Bring your best dish to the box."
        copy="Create an account to save favorites, publish your own recipes, and build your own corner of the recipe box."
      />

      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-head">
            <span className="eyebrow">Create account</span>
            <h2>Set up your kitchen</h2>
            <p>It takes less than a minute to join.</p>
          </div>

          <form onSubmit={submit} noValidate>
            {/* NAME */}
            <div className="auth-field">
              <label htmlFor="name">Name</label>
              <div className="auth-input-wrap">
                <UserIcon />
                <input id="name" autoComplete="name" placeholder="Your full name"
                  className={error ? 'has-error' : ''} value={f.name}
                  onChange={(e) => set({ ...f, name: e.target.value })} />
              </div>
            </div>

            {/* EMAIL */}
            <div className="auth-field">
              <label htmlFor="reg-email">Email</label>
              <div className="auth-input-wrap">
                <MailIcon />
                <input id="reg-email" type="email" autoComplete="email" placeholder="you@example.com"
                  className={error ? 'has-error' : ''} value={f.email}
                  onChange={(e) => set({ ...f, email: e.target.value })} />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="auth-field">
              <label htmlFor="reg-password">Password</label>
              <div className="auth-input-wrap">
                <LockIcon />
                <input id="reg-password" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="At least 6 characters" className={error ? 'has-error' : ''} value={f.password}
                  onChange={(e) => set({ ...f, password: e.target.value })} />
                <button type="button" className="auth-toggle-visibility" onClick={() => setShowPw(!showPw)}>
                  <EyeIcon off={showPw} />
                </button>
              </div>
            </div>

            {f.password && (
              <>
                <div className="auth-strength">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} style={{ background: i < strength ? strengthColors[strength] : undefined }} />
                  ))}
                </div>
                <div className="auth-strength-label">{strengthLabels[strength]}</div>
              </>
            )}

            {/* CONFIRM PASSWORD */}
            <div className="auth-field">
              <label htmlFor="confirm">Confirm Password</label>
              <div className="auth-input-wrap">
                <LockIcon />
                <input id="confirm" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="Type it again" className={error ? 'has-error' : ''} value={f.confirm}
                  onChange={(e) => set({ ...f, confirm: e.target.value })} />
              </div>
            </div>

            {/* PROFILE IMAGE */}
            <div className="auth-field">
              <label>Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {previewImage && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <img src={previewImage} alt="Preview"
                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #ff914d' }} />
                </div>
              )}
            </div>

            {/* ADMIN CODE */}
            <div className="auth-field">
              <label htmlFor="admin-code">Admin Access Code (optional)</label>
              <div className="auth-input-wrap">
                <LockIcon />
                <input id="admin-code" type="text" placeholder="Leave blank unless you have one"
                  value={f.adminCode} onChange={(e) => set({ ...f, adminCode: e.target.value })} />
              </div>
            </div>

            <p className="auth-error-text">{error}</p>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider">Already cooking with us</div>
          <p className="auth-switch">Have an account? <Link to="/login">Sign in instead</Link></p>
        </div>
      </div>
    </div>
  )
}
