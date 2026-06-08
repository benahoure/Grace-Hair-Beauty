import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { PageMeta } from '../../components/seo/PageMeta'
import {
  adminIsAuthenticated,
  exchangeCodeForToken,
  redirectToCognito,
  setAdminToken,
} from '../../lib/auth'

export function AdminRoot() {
  const navigate = useNavigate()

  useEffect(() => {
    // Handle Cognito authorization code callback (?code=...)
    const searchParams = new URLSearchParams(window.location.search)
    const code = searchParams.get('code')
    if (code) {
      exchangeCodeForToken(code).then(token => {
        if (token) {
          setAdminToken(token)
          navigate('/admin/dashboard', { replace: true })
        } else {
          redirectToCognito()
        }
      })
      return
    }

    if (!adminIsAuthenticated()) {
      redirectToCognito()
    }
  }, [navigate])

  if (adminIsAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <>
      <PageMeta
        title="Admin | Grace Hair Beauty"
        description="Admin access for Grace Hair Beauty."
        canonical="https://gracehairsbeauty.com/admin"
      />
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #040206 0%, #0A0810 40%, #100C14 100%)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-gold-light" />
          <p className="text-sm" style={{ color: 'rgba(250,246,240,0.4)' }}>Redirecting to sign in…</p>
        </div>
      </div>
    </>
  )
}
