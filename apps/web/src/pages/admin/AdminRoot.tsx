import { useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { PageMeta } from '../../components/seo/PageMeta'
import { adminIsAuthenticated, redirectToCognito, setAdminToken } from '../../lib/auth'

export function AdminRoot() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const accessToken = params.get('access_token')
    if (accessToken) {
      setAdminToken(accessToken)
      navigate('/admin/dashboard', { replace: true })
    }
  }, [navigate])

  if (adminIsAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <>
      <PageMeta
        title="Admin Login | Grace Hair Beauty"
        description="Secure admin login for Grace Hair Beauty."
        canonical="https://gracehairsbeauty.com/admin"
      />
      <section className="section-pad">
        <div className="container-page max-w-2xl">
          <p className="eyebrow">Admin</p>
          <h1 className="display-heading mt-3 text-6xl font-semibold">Salon Dashboard Login</h1>
          <p className="mt-5 leading-8 text-espresso">
            Admin access is protected by Cognito. Sign in with an approved admin account to manage bookings,
            services, portfolio items, reviews, and business settings.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" className="btn btn-primary" onClick={redirectToCognito}>
              Sign In with Cognito
            </button>
            <Link className="btn btn-outline" to="/">
              Back to Site
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
