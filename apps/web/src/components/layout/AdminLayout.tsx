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
        className="hidden w-56 shrink-0 flex-col md:flex"
        style={{ background: '#2C1810', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}
      >
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-gold-light">Grace Hair Beauty</p>
          <p className="mt-0.5 text-[0.7rem]" style={{ color: 'rgba(250,246,240,0.4)' }}>Admin Dashboard</p>
        </div>

        <div className="flex-1 px-2 py-3">
          {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'text-gold-light' : 'text-cream/60 hover:text-cream/90'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'rgba(212,168,67,0.14)' } : undefined}
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="px-2 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:text-cream/80"
            style={{ color: 'rgba(250,246,240,0.45)' }}
          >
            <LogOut size={15} aria-hidden="true" />
            Log Out
          </button>
        </div>
      </nav>

      {/* Mobile top bar */}
      <div
        className="fixed left-0 right-0 top-0 z-40 md:hidden"
        style={{ background: '#2C1810' }}
      >
        <div className="flex items-center overflow-x-auto px-2 py-2" style={{ gap: '2px' }}>
          {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  isActive ? 'text-gold-light' : 'text-cream/60'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'rgba(212,168,67,0.14)' } : undefined}
            >
              <Icon size={12} aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto flex shrink-0 items-center rounded-lg px-2.5 py-1.5"
            style={{ color: 'rgba(250,246,240,0.45)' }}
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
