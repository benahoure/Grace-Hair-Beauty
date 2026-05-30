import { CalendarDays, Image, Inbox, LayoutDashboard, LogOut, Scissors, Settings, Star } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { clearAdminToken } from '../../lib/auth'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', to: '/admin/appointments', icon: CalendarDays },
  { label: 'Messages', to: '/admin/messages', icon: Inbox },
  { label: 'Services', to: '/admin/services', icon: Scissors },
  { label: 'Portfolio', to: '/admin/portfolio', icon: Image },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

const SIDEBAR_BG = 'linear-gradient(180deg, #08060C 0%, #0E0A12 40%, #140C10 100%)'

export function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAdminToken()
    navigate('/admin', { replace: true })
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <nav
        aria-label="Admin navigation"
        className="hidden w-60 shrink-0 flex-col md:flex"
        style={{ background: SIDEBAR_BG, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}
      >
        {/* Brand */}
        <div className="px-5 pb-4 pt-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'rgba(212,168,67,0.18)', border: '1px solid rgba(212,168,67,0.3)' }}
            >
              <Scissors size={13} style={{ color: '#D4A843' }} />
            </div>
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.15em]" style={{ color: '#D4A843' }}>
                Grace Hair Beauty
              </p>
              <p className="text-[0.62rem]" style={{ color: 'rgba(250,246,240,0.35)' }}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 px-3 py-4">
          <p
            className="mb-2 px-2 text-[0.55rem] font-bold uppercase tracking-[0.2em]"
            style={{ color: 'rgba(250,246,240,0.25)' }}
          >
            Navigation
          </p>
          {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? 'text-cream' : 'text-cream/50 hover:text-cream/80'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: 'rgba(212,168,67,0.14)',
                      borderLeft: '2px solid #D4A843',
                      paddingLeft: '10px',
                    }
                  : { borderLeft: '2px solid transparent' }
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={15}
                    aria-hidden="true"
                    style={{ color: isActive ? '#D4A843' : undefined }}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/5"
            style={{ color: 'rgba(250,246,240,0.4)', borderLeft: '2px solid transparent' }}
          >
            <LogOut size={14} aria-hidden="true" />
            Log Out
          </button>
        </div>
      </nav>

      {/* Mobile top bar */}
      <div
        className="fixed left-0 right-0 top-0 z-40 md:hidden"
        style={{ background: 'linear-gradient(90deg, #08060C, #140C10)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center overflow-x-auto px-2 py-2" style={{ gap: '2px' }}>
          {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isActive ? 'text-gold-light' : 'text-cream/55 hover:text-cream/80'
                }`
              }
              style={({ isActive }) =>
                isActive ? { background: 'rgba(212,168,67,0.14)' } : undefined
              }
            >
              <Icon size={12} aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto flex shrink-0 items-center rounded-lg px-2.5 py-1.5"
            style={{ color: 'rgba(250,246,240,0.4)' }}
            aria-label="Log out"
          >
            <LogOut size={12} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <main id="main-content" className="min-w-0 flex-1 bg-cream pt-11 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
