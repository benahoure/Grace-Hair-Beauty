import { useQuery } from '@tanstack/react-query'
import { Calendar, Inbox, LogOut, Scissors, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { PageMeta } from '../../components/seo/PageMeta'
import { api } from '../../lib/api'
import { clearAdminToken } from '../../lib/auth'

const cards = [
  { label: 'Appointments', to: '/admin/appointments', icon: Calendar },
  { label: 'Messages', to: '/admin/appointments', icon: Inbox },
  { label: 'Services', to: '/admin/services', icon: Scissors },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
]

export function AdminDashboard() {
  const navigate = useNavigate()
  const appointments = useQuery({ queryKey: ['admin-appointments'], queryFn: api.getAdminAppointments })
  const messages = useQuery({ queryKey: ['admin-messages'], queryFn: api.getAdminContactMessages })

  const handleLogout = () => {
    clearAdminToken()
    navigate('/admin', { replace: true })
  }

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
        action={
          <button type="button" className="btn btn-outline" onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" />
            Log Out
          </button>
        }
      >
        <div className="grid gap-5 md:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.label} to={card.to} className="rounded-card border border-cream-border bg-paper p-5 shadow-soft">
                <Icon className="text-gold-dark" aria-hidden="true" />
                <span className="mt-4 block text-[1.0625rem] font-semibold text-cocoa">{card.label}</span>
              </Link>
            )
          })}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <AdminPanel title="Pending appointments">
            {appointments.data?.appointments.length ? 'Appointments are ready to review.' : 'No pending appointments.'}
          </AdminPanel>
          <AdminPanel title="Unread messages">
            {messages.data?.messages.length ? 'Messages are waiting in the inbox.' : 'No unread messages.'}
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
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="display-heading mt-3 text-6xl font-semibold">{title}</h1>
            <p className="mt-4 max-w-3xl leading-8 text-espresso">{intro}</p>
          </div>
          {action}
        </div>
        <div className="mt-9">{children}</div>
      </div>
    </section>
  )
}

export function AdminPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-cream-border bg-paper p-6 shadow-soft">
      <h2 className="text-[0.8125rem] font-bold uppercase tracking-[0.06em] text-cocoa/60">{title}</h2>
      <div className="mt-4 text-espresso">{children}</div>
    </section>
  )
}
