import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { PageMeta } from '../../components/seo/PageMeta'
import { adminIsAuthenticated, redirectToCognito, setAdminToken } from '../../lib/auth'

export function AdminRoot() {
  const navigate = useNavigate()

  useEffect(() => {
    // Handle Cognito callback — token is in the URL hash
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const accessToken = params.get('access_token')
    if (accessToken) {
      setAdminToken(accessToken)
      navigate('/admin/dashboard', { replace: true })
      return
    }

    // Not authenticated and no callback token → go straight to Cognito
    if (!adminIsAuthenticated()) {
      redirectToCognito()
    }
  }, [navigate])

  if (adminIsAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />
  }

  // Brief loading state while redirecting to Cognito
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
