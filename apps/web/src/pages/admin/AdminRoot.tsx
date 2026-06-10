import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { PageMeta } from '../../components/seo/PageMeta'
import { adminIsAuthenticated, loginWithPassword, setAdminToken } from '../../lib/auth'

function RibbonAccents() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#C09060" stopOpacity="0"    />
          <stop offset="22%"  stopColor="#C09060" stopOpacity="0.50" />
          <stop offset="74%"  stopColor="#C09060" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#C09060" stopOpacity="0"    />
        </linearGradient>
        <linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#9A5840" stopOpacity="0"    />
          <stop offset="30%"  stopColor="#9A5840" stopOpacity="0.38" />
          <stop offset="78%"  stopColor="#9A5840" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#9A5840" stopOpacity="0"    />
        </linearGradient>
        <linearGradient id="rg3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#B87850" stopOpacity="0"    />
          <stop offset="36%"  stopColor="#B87850" stopOpacity="0.30" />
          <stop offset="66%"  stopColor="#B87850" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#B87850" stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* Upper cluster */}
      <path d="M -180  92 C 280  54 640 126 1080  84 S 1440  48 1700  92"  stroke="url(#rg)"  strokeWidth="1.0" fill="none" opacity="0.44" />
      <path d="M -200 116 C 260  78 620 150 1060 108 S 1420  72 1680 116"  stroke="url(#rg3)" strokeWidth="0.7" fill="none" opacity="0.30" />
      <path d="M -120  70 C 340  34 700 104 1140  62 S 1500  26 1760  70"  stroke="url(#rg2)" strokeWidth="0.6" fill="none" opacity="0.20" />

      {/* Upper-mid cluster — skims above the card */}
      <path d="M -240 238 C 220 196 580 268 1020 226 S 1380 190 1660 234"  stroke="url(#rg)"  strokeWidth="1.2" fill="none" opacity="0.48" />
      <path d="M -160 262 C 300 218 660 290 1100 248 S 1460 212 1740 256"  stroke="url(#rg3)" strokeWidth="0.8" fill="none" opacity="0.32" />
      <path d="M -300 214 C 160 174 520 244  960 202 S 1320 166 1600 210"  stroke="url(#rg2)" strokeWidth="0.6" fill="none" opacity="0.18" />

      {/* Lower-mid cluster — below the card */}
      <path d="M -180 578 C 280 536 640 608 1080 566 S 1440 530 1720 574"  stroke="url(#rg)"  strokeWidth="1.0" fill="none" opacity="0.34" />
      <path d="M -260 556 C 200 516 560 586 1000 544 S 1360 508 1640 552"  stroke="url(#rg2)" strokeWidth="0.7" fill="none" opacity="0.22" />

      {/* Low accent */}
      <path d="M  -80 700 C 380 658 740 730 1180 688 S 1540 652 1820 696"  stroke="url(#rg3)" strokeWidth="0.7" fill="none" opacity="0.18" />
    </svg>
  )
}

export function AdminRoot() {
  const navigate = useNavigate()
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [emailFocused, setEmailFocused]       = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

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

  const inputBase: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(185,92,55,0.30)',
    color: 'rgba(250,246,240,0.94)',
    borderRadius: '10px',
    width: '100%',
    padding: '14px 14px 14px 44px',
    fontSize: '0.925rem',
    outline: 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
  }

  const inputFocused: React.CSSProperties = {
    ...inputBase,
    background: 'rgba(255,255,255,0.09)',
    border: '1px solid rgba(210,118,72,0.68)',
    boxShadow: '0 0 0 3px rgba(210,118,72,0.12), inset 0 1px 0 rgba(255,200,150,0.04)',
  }

  const iconCol = (focused: boolean) =>
    focused ? 'rgba(215,132,80,0.92)' : 'rgba(250,246,240,0.36)'

  return (
    <>
      <PageMeta
        title="Admin Sign In | Grace Hair Beauty"
        description="Admin sign in for Grace Hair Beauty."
        canonical="https://gracehairsbeauty.com/admin"
      />

      {/* ── Page shell ── */}
      <div
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10"
        style={{ background: 'linear-gradient(160deg, #050203 0%, #070405 38%, #0A0606 65%, #060304 100%)' }}
      >
        <RibbonAccents />

        {/* Ambient warmth — narrow 52% ellipse, rose-copper, no full-page wash */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: [
              'radial-gradient(ellipse 52% 56% at 50% 45%,',
              '  rgba(148,58,36,0.17) 0%,',
              '  rgba(110,40,22,0.08) 40%,',
              '  rgba(70,22,10,0.02) 62%,',
              '  transparent 76%)',
            ].join(' '),
          }}
        />

        {/* Card-vicinity — extra soft warmth right behind the card */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 30% 34% at 50% 46%, rgba(168,68,42,0.07) 0%, transparent 62%)',
          }}
        />

        {/* Vignette — pushes corners to near-black */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 62% 62% at 50% 48%, transparent 22%, rgba(0,0,0,0.80) 100%)',
          }}
        />

        {/* ── Content column ── */}
        <div className="relative z-10 flex w-full max-w-[600px] flex-col items-center">

          {/* Brand area */}
          <div className="mb-5 flex flex-col items-center gap-3">
            <img
              src="/brand/logo-primary-transparent.webp"
              alt="Grace Hair Beauty"
              style={{
                height: '96px',
                width: 'auto',
                objectFit: 'contain',
                filter: [
                  'drop-shadow(0 6px 28px rgba(210,140,78,0.42))',
                  'drop-shadow(0 1px 8px rgba(0,0,0,0.64))',
                ].join(' '),
              }}
            />
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p
                className="font-display text-[0.82rem] font-bold uppercase"
                style={{ color: '#D0A055', letterSpacing: '0.28em' }}
              >
                Grace Hair Beauty
              </p>
              {/* "— ADMIN PORTAL —" with side rules */}
              <div className="flex items-center gap-2.5">
                <div style={{ width: '22px', height: '1px', background: 'rgba(190,108,58,0.52)' }} />
                <p
                  className="text-[0.60rem] font-semibold uppercase"
                  style={{ color: 'rgba(250,246,240,0.40)', letterSpacing: '0.21em' }}
                >
                  Admin Portal
                </p>
                <div style={{ width: '22px', height: '1px', background: 'rgba(190,108,58,0.52)' }} />
              </div>
            </div>
          </div>

          {/* ── Glass card ── */}
          <div
            className="w-full rounded-3xl"
            style={{
              background: 'linear-gradient(160deg, rgba(40,15,8,0.86) 0%, rgba(26,9,4,0.93) 100%)',
              backdropFilter: 'blur(44px)',
              WebkitBackdropFilter: 'blur(44px)',
              border: '1px solid rgba(198,98,60,0.46)',
              boxShadow: [
                '0 -18px 52px rgba(198,96,56,0.20)',    // glow bleeding upward from card top
                '0 52px 120px rgba(0,0,0,0.84)',         // deep drop shadow
                '0 0 0 1px rgba(185,85,48,0.18)',        // faint outer ring
                'inset 0 2px 0 rgba(245,168,98,0.88)',   // hot inner top rim
                'inset 0 -1px 0 rgba(0,0,0,0.38)',       // inner bottom shadow
                'inset 1px 0 0 rgba(198,98,60,0.08)',    // side rims
                'inset -1px 0 0 rgba(198,98,60,0.08)',
              ].join(', '),
            }}
          >
            {/* Top shimmer bar — the "hot line" at the card edge */}
            <div
              style={{
                height: '2px',
                borderRadius: '24px 24px 0 0',
                background: [
                  'linear-gradient(90deg,',
                  '  transparent 5%,',
                  '  rgba(220,138,78,0.62) 34%,',
                  '  rgba(255,200,128,0.92) 50%,',
                  '  rgba(220,138,78,0.62) 66%,',
                  '  transparent 95%)',
                ].join(' '),
              }}
            />

            {/* Inner top warmth fade */}
            <div
              style={{
                height: '54px',
                pointerEvents: 'none',
                background: 'linear-gradient(180deg, rgba(198,98,60,0.05) 0%, transparent 100%)',
              }}
            />

            <div className="px-10 pb-11 pt-0 sm:px-12 sm:pb-12">

              {/* Heading */}
              <div className="mb-8">
                <h1
                  className="font-display text-[2.8rem] font-light leading-tight"
                  style={{ color: 'rgba(252,248,242,0.97)' }}
                >
                  Welcome back
                </h1>
                <div
                  className="my-3 h-px"
                  style={{
                    width: '46px',
                    background: 'linear-gradient(90deg, rgba(198,118,68,0.82), rgba(198,118,68,0.22), transparent)',
                  }}
                />
                <p className="text-[0.875rem] leading-relaxed" style={{ color: 'rgba(250,246,240,0.52)' }}>
                  Sign in to manage Grace Hair Beauty.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    className="text-[0.68rem] font-semibold uppercase"
                    style={{ color: 'rgba(250,246,240,0.58)', letterSpacing: '0.14em' }}
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      aria-hidden="true"
                      style={{
                        position: 'absolute', left: '15px', top: '50%',
                        transform: 'translateY(-50%)',
                        color: iconCol(emailFocused),
                        transition: 'color 0.18s',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      disabled={loading}
                      style={emailFocused ? inputFocused : inputBase}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    className="text-[0.68rem] font-semibold uppercase"
                    style={{ color: 'rgba(250,246,240,0.58)', letterSpacing: '0.14em' }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      aria-hidden="true"
                      style={{
                        position: 'absolute', left: '15px', top: '50%',
                        transform: 'translateY(-50%)',
                        color: iconCol(passwordFocused),
                        transition: 'color 0.18s',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      required
                      disabled={loading}
                      style={passwordFocused
                        ? { ...inputFocused, paddingRight: '46px' }
                        : { ...inputBase,    paddingRight: '46px' }
                      }
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                      style={{ color: 'rgba(250,246,240,0.44)' }}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{
                      background: 'rgba(140,28,28,0.18)',
                      border: '1px solid rgba(200,55,55,0.30)',
                    }}
                  >
                    <AlertCircle size={15} className="mt-0.5 shrink-0" style={{ color: '#f87171' }} />
                    <p className="text-sm leading-snug" style={{ color: '#fca5a5' }}>{error}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="group flex w-full items-center justify-center gap-2.5 rounded-full py-4 text-[0.875rem] font-semibold transition-all duration-200 disabled:opacity-40"
                    style={{
                      background: loading || !email || !password
                        ? 'linear-gradient(135deg, #B89048 0%, #9A7030 100%)'
                        : 'linear-gradient(135deg, #EAC07A 0%, #D09050 50%, #B87038 100%)',
                      color: '#130702',
                      letterSpacing: '0.05em',
                      boxShadow: loading || !email || !password
                        ? 'none'
                        : [
                          '0 8px 32px rgba(200,130,60,0.44)',
                          '0 2px 8px rgba(0,0,0,0.34)',
                          'inset 0 1.5px 0 rgba(255,228,168,0.40)',
                        ].join(', '),
                    }}
                  >
                    {loading ? 'Signing in…' : (
                      <>
                        Sign in
                        <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Footer note */}
          <p
            className="mt-5 flex items-center gap-1.5 text-[0.60rem] font-semibold uppercase"
            style={{ color: 'rgba(250,246,240,0.40)', letterSpacing: '0.13em' }}
          >
            <Lock size={9} aria-hidden="true" />
            Secure admin access
          </p>

        </div>
      </div>
    </>
  )
}
