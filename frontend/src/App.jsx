import { useEffect, useState } from 'react'
import { api, getToken, setToken } from './api.js'
import AuthPage from './AuthPage.jsx'
import AdminPanel from './AdminPanel.jsx'
import CustomerPanel from './CustomerPanel.jsx'

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center text-ink">
      <div className="animate-fade-up text-center">
        <h1 className="font-serif text-4xl font-light uppercase tracking-[0.15em]">
          LUNA
        </h1>
        <p className="mt-2 font-sans text-sm font-medium text-ink-soft">
          Opening the collection…
        </p>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setBooting(false)
      return
    }
    api('/api/auth/me')
      .then((me) => setUser(me))
      .catch(() => setToken(null))
      .finally(() => setBooting(false))
  }, [])

  function logout() {
    setToken(null)
    setUser(null)
  }

  if (booting) return <Splash />

  if (!user) return <AuthPage onAuthed={setUser} />

  if (user.role === 'admin') return <AdminPanel user={user} onLogout={logout} />

  return <CustomerPanel user={user} onLogout={logout} />
}

export default App