import { useState } from 'react'
import { api, setToken } from './api.js'

const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-4 w-4 shrink-0',
}

const MailIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)

const LockIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <rect x="4" y="10" width="16" height="11" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)

const UserIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
  </svg>
)

const EyeIcon = () => (
  <svg {...iconProps}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg {...iconProps}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.6 3.5M6.3 6.6A16 16 0 0 0 2 12s3.5 7 10 7a9.4 9.4 0 0 0 4.2-1M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
)

const ArrowIcon = () => (
  <svg {...iconProps}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const inputClasses =
  'w-full rounded-2xl border border-line bg-paper-2 px-4 py-2.5 pl-11 font-sans text-sm text-ink placeholder:text-ink-soft outline-none transition focus:border-teal-600 focus:ring-[3px] focus:ring-teal-600/15'

const labelClasses =
  'mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft'

function AuthPage({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function switchMode(next) {
    setMode(next)
    setError('')
  }

  async function authenticate(e) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Please tell us your name.')
          setBusy(false)
          return
        }
        await api('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        })
      }
      const result = await api('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      setToken(result.access_token)
      onAuthed({
        name: result.name,
        email: result.email,
        role: result.role,
      })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 text-ink">
      <div className="w-full max-w-md animate-fade-up">
        <header className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-light uppercase tracking-[0.15em]">
            LUNA
          </h1>
          <p className="mt-2 font-sans text-sm font-medium text-ink-soft">
            {isLogin ? 'Welcome back to the collection.' : 'Join the collection.'}
          </p>
        </header>

        <div className="overflow-hidden rounded-3xl border border-line bg-paper-2 shadow-[0_24px_60px_-28px_rgba(47,51,44,0.4)]">
          <div className="grid grid-cols-2 gap-1 border-b border-line bg-paper p-1.5">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`rounded-2xl py-2.5 font-sans text-sm font-bold transition ${
                  mode === m
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                {m === 'login' ? 'Log In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={authenticate} className="px-6 py-7 sm:px-8">
            {error && (
              <div className="mb-5 rounded-2xl border border-rose/40 bg-rose-soft px-4 py-3 font-sans text-sm font-semibold text-rose-deep">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label className={labelClasses} htmlFor="auth-name">
                    Full name
                  </label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarya Shakya"
                      autoComplete="name"
                      className={inputClasses}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={labelClasses} htmlFor="auth-email">
                  Email
                </label>
                <div className="relative">
                  <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses} htmlFor="auth-password">
                  Password
                </label>
                <div className="relative">
                  <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? 'Your password' : 'At least 6 characters'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    className={`${inputClasses} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint transition hover:text-ink"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 px-5 py-3 font-sans text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                mode === 'register' ? 'Creating account…' : 'Logging in…'
              ) : (
                <>
                  {isLogin ? 'Log In' : 'Create Account'}
                  <ArrowIcon />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 rounded-2xl border border-teal-300/70 bg-paper-2/80 px-4 py-3 text-center font-sans text-xs font-semibold text-ink-soft">
          Demo admin · <span className="text-teal-700">admin@store.com</span> /{' '}
          <span className="text-teal-700">admin123</span>
        </p>
      </div>
    </div>
  )
}

export default AuthPage