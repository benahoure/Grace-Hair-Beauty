import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Image, Inbox, Scissors, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { PageMeta } from '../../components/seo/PageMeta'
import { api } from '../../lib/api'

const CARDS = [
  { label: 'Appointments', to: '/admin/appointments', icon: CalendarDays },
  { label: 'Messages', to: '/admin/messages', icon: Inbox },
  { label: 'Services', to: '/admin/services', icon: Scissors },
  { label: 'Portfolio', to: '/admin/portfolio', icon: Image },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
]

export function AdminDashboard() {
  const appointments = useQuery({
    queryKey: ['admin-appointments', 'pending'],
    queryFn: () => api.getAdminAppointments({ status: 'pending' }),
  })
  const messages = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => api.getAdminContactMessages({ read: false }),
  })

  const pendingCount = appointments.data?.appointments.length ?? 0
  const unreadCount = messages.data?.messages.length ?? 0

  return (
    <>
      <PageMeta
        title="Admin Dashboard | Grace Hair Beauty"
        description="Grace Hair Beauty admin dashboard."
        canonical="https://gracehairsbeauty.com/admin/dashboard"
      />
      <AdminPageShell
        title="Dashboard"
        intro="View pending work and jump into daily salon management."
      >
        {/* Quick-nav cards */}
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CARDS.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.label}
                to={card.to}
                className="flex flex-col rounded-xl border border-cream-border bg-paper p-5 shadow-soft transition-shadow hover:shadow-md"
              >
                <Icon size={20} className="text-gold-dark" aria-hidden="true" />
                <span className="mt-3 block text-sm font-semibold text-cocoa">{card.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Status panels */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <AdminPanel title="Pending appointments">
            {appointments.isPending ? (
              <div className="h-5 w-24 animate-pulse rounded bg-cream-deep" />
            ) : pendingCount > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-espresso">
                  <span className="font-semibold text-cocoa">{pendingCount}</span> awaiting confirmation
                </span>
                <Link to="/admin/appointments" className="text-xs font-semibold text-gold-dark hover:text-gold">
                  Review →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-mocha/60">No pending appointments.</p>
            )}
          </AdminPanel>

          <AdminPanel title="Unread messages">
            {messages.isPending ? (
              <div className="h-5 w-24 animate-pulse rounded bg-cream-deep" />
            ) : unreadCount > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-espresso">
                  <span className="font-semibold text-cocoa">{unreadCount}</span> unread{unreadCount === 1 ? ' message' : ' messages'}
                </span>
                <Link to="/admin/messages" className="text-xs font-semibold text-gold-dark hover:text-gold">
                  View →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-mocha/60">No unread messages.</p>
            )}
          </AdminPanel>
        </div>
      </AdminPageShell>
    </>
  )
}

export function AdminPageShell({
  title,
  intro,
  action,
  children,
}: {
  title: string
  intro: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="section-pad">
      <div className="container-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="display-heading mt-2 text-5xl font-semibold">{title}</h1>
            <p className="mt-3 max-w-2xl leading-7 text-espresso">{intro}</p>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

export function AdminPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-cream-border bg-paper p-6 shadow-soft">
      <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.06em] text-cocoa/60">{title}</h2>
      <div className="mt-3 text-espresso">{children}</div>
    </section>
  )
}
