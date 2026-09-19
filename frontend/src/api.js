const TOKEN_KEY = 'luna_access_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(path, { ...options, headers })
  if (!res.ok) {
    if (res.status === 401) setToken(null)
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed (${res.status})`)
  }
  if (res.status === 204) return null
  return res.json()
}

export function formatPrice(price) {
  return price > 0 ? `Rs. ${price.toLocaleString('en-IN')}` : '—'
}