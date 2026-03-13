'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'signin' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function resetForm() {
    setEmail('')
    setName('')
    setPassword('')
    setError('')
  }

  function switchTab(t: Tab) {
    setTab(t)
    resetForm()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please fill in all required fields.')
      return
    }
    if (tab === 'signup' && !name.trim()) {
      setError('Please enter your full name.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const endpoint = tab === 'signup' ? '/api/auth/signup' : '/api/auth/signin'
      const body = tab === 'signup'
        ? { email: email.trim(), name: name.trim(), password }
        : { email: email.trim(), password }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 409) {
        setError('An account with this email already exists. Sign in instead.')
        return
      }
      if (res.status === 401) {
        setError('Invalid email or password.')
        return
      }
      if (!res.ok) throw new Error('Request failed')
      const session = await res.json()
      localStorage.setItem('prelegal_session', JSON.stringify(session))
      router.push('/')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#209dd7' }}>
            PreLegal
          </p>
          <h1 className="text-3xl font-bold mt-1" style={{ color: '#032147' }}>
            {tab === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm mt-2" style={{ color: '#888888' }}>
            {tab === 'signin' ? 'Sign in to your account' : 'Get started with PreLegal'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Tab toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => switchTab('signin')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                tab === 'signin' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchTab('signup')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                tab === 'signup' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#032147' }}>
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:border-transparent transition"
                  style={{ '--tw-ring-color': '#209dd7' } as React.CSSProperties}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#032147' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#209dd7' } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#032147' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#209dd7' } as React.CSSProperties}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#753991' }}
            >
              {loading ? (tab === 'signin' ? 'Signing in\u2026' : 'Creating account\u2026') : (tab === 'signin' ? 'Sign in' : 'Create account')}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#888888' }}>
          \u00a9 {new Date().getFullYear()} PreLegal
        </p>
      </div>
    </div>
  )
}
