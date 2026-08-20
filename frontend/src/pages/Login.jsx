import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthShowcase from '../components/AuthShowcase'
import './Auth.css'

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

export default function Login() {
  const auth = useAuth()
  const nav = useNavigate()
  const [f, set] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!f.email || !f.password) {
      setError('Enter your email and password to continue.')
      return
    }
    setLoading(true)
    const result = await auth.login(f.email, f.password)
    setLoading(false)
    if (result === true) {
      nav('/')
    } else {
      setError(result || "That email and password combination doesn't match our records.")
    }
  }

  return (
    <div className="auth-screen">
      <AuthShowcase
        eyebrow="Welcome back"
        heading="Your recipe box is right where you left it."
        copy="Sign in to revisit your saved dishes, pick up a draft, and see what the table's cooking this week."
      />

      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-head">
            <span className="eyebrow">Sign in</span>
            <h2>Good to see you again</h2>
            <p>Log in to keep cooking where you left off.</p>
          </div>

          <form onSubmit={submit} noValidate>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <div className="auth-input-wrap">
                <MailIcon />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={error ? 'has-error' : ''}
                  value={f.email}
                  onChange={(e) => set({ ...f, email: e.target.value })}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <LockIcon />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your password"
                  className={error ? 'has-error' : ''}
                  value={f.password}
                  onChange={(e) => set({ ...f, password: e.target.value })}
                />
                <button
                  type="button"
                  className="auth-toggle-visibility"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPw((s) => !s)}
                >
                  <EyeIcon off={showPw} />
                </button>
              </div>
            </div>

            <p className="auth-error-text">{error}</p>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="auth-divider">New here</div>

          <p className="auth-switch">
            Don&rsquo;t have an account? <Link to="/register">Create one for free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
