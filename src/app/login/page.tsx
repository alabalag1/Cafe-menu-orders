'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const check = async () => {
      const { data } = await supabaseBrowser().auth.getSession()
      if (data.session) {
        window.location.replace('/admin/products')
      }
    }
    check()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const sb = supabaseBrowser()
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error || !data.session) {
      setLoading(false)
      setError(error?.message || 'Failed to sign in')
      return
    }
    // Persist tokens in HttpOnly cookies for middleware
    const dest = new URL(window.location.href).searchParams.get('redirect') || '/admin/products'
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        redirect: dest
      })
    })
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', border: '1px solid #e5e5e5', borderRadius: 12, padding: 20 }}>
      <h1 style={{ marginTop: 0 }}>Login</h1>
      <p style={{ color: '#666' }}>Sign in to access Admin, Kitchen, and Orders dashboards.</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <button type="submit" disabled={loading}>{loading? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}


