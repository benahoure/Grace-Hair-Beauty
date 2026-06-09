import { AlertCircle, Eye, EyeOff, Scissors } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { PageMeta } from '../../components/seo/PageMeta'
import { adminIsAuthenticated, loginWithPassword, setAdminToken } from '../../lib/auth'

const BG = 'linear-gradient(135deg, #040206 0%, #0A0810 40%, #100C14 100%)'

const BASE_INPUT: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(250,246,240,0.9)',
  borderRadius: '8px',
  width: '100%',
  padding: '10px 12px',
  fontSize: '0.875rem',
  outline: 'none',
}

const FOCUS_INPUT: React.CSSProperties = {
  ...BASE_INPUT,
  border: '1px solid rgba(212,168,67,0.6)',
}

function FocusInput({
  baseStyle,
  focusStyle,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  baseStyle: React.CSSProperties
  focusStyle: React.CSSProperties
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      style={focused ? focusStyle : baseStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

export function AdminRoot() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (adminIsAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await loginWithPassword(email.trim(), password)
    if (result.success) {
      setAdminToken(result.token)
      navigate('/admin/dashboard', { replace: true })
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <>
      <PageMeta
        title="Admin Sign In | Grace Hair Beauty"
        description="Admin sign in for Grace Hair Beauty."
        canonical="https://gracehairsbeauty.com/admin"
      />
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: BG }}>
        <div className="w-full max-w-sm">

          {/* Brand mark */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.25)' }}
            >
              <Scissors size={18} style={{ color: '#D4A843' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#D4A843' }}>
                Grace Hair Beauty
              </p>
              <p className="text-xs" style={{ color: 'rgba(250,246,240,0.35)' }}>Admin Portal</p>
            </div>
          </div>

          {/* Login card */}
          <div
            className="rounded-2xl p-8"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h1 className="mb-6 text-lg font-semibold" style={{ color: 'rgba(250,246,240,0.9)' }}>
              Sign in
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(250,246,240,0.5)' }}>
                  Email address
                </label>
                <FocusInput
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  baseStyle={BASE_INPUT}
                  focusStyle={FOCUS_INPUT}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(250,246,240,0.5)' }}>
                  Password
                </label>
                <div className="relative">
                  <FocusInput
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    baseStyle={{ ...BASE_INPUT, paddingRight: '40px' }}
                    focusStyle={{ ...FOCUS_INPUT, paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'rgba(250,246,240,0.35)' }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="flex items-start gap-2.5 rounded-lg p-3"
                  style={{ background: 'rgba(155,32,32,0.15)', border: '1px solid rgba(155,32,32,0.3)' }}
                >
                  <AlertCircle size={15} className="mt-0.5 shrink-0" style={{ color: '#f87171' }} />
                  <p className="text-sm leading-snug" style={{ color: '#fca5a5' }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="mt-2 w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #D4A843 0%, #B8860B 100%)', color: '#1A0F09' }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
