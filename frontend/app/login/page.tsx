'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !name.trim()) {
      setError('Please enter your name and email.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      })
      if (!res.ok) throw new Error('Login failed')
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
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#209dd7' }}>
            PreLegal
          </p>
          <h1 className="text-3xl font-bold mt-1" style={{ color: '#032147' }}>
            Welcome
          </h1>
          <p className="text-sm mt-2" style={{ color: '#888888' }}>
            Enter your details to continue
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#753991' }}
            >
              {loading ? 'Entering…' : 'Enter Platform'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#888888' }}>
          © {new Date().getFullYear()} PreLegal
        </p>
      </div>
    </div>
  )
}
