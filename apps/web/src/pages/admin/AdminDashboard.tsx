import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Image, Inbox, Scissors, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import CountUp from 'react-countup'
import { Link } from 'react-router-dom'

import { PageMeta } from '../../components/seo/PageMeta'
import { api } from '../../lib/api'

const HERO_GRADIENT = 'linear-gradient(135deg, #040206 0%, #0A0810 50%, #100C14 100%)'

const QUICK_NAV = [
  { label: 'Appointments', to: '/admin/appointments', icon: CalendarDays, accent: '#D4A843' },
  { label: 'Messages', to: '/admin/messages', icon: Inbox, accent: '#C87390' },
  { label: 'Services', to: '/admin/services', icon: Scissors, accent: '#D4A843' },
  { label: 'Portfolio', to: '/admin/portfolio', icon: Image, accent: '#C87390' },
  { label: 'Reviews', to: '/admin/reviews', icon: Star, accent: '#C87390' },
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
  const isLoading = appointments.isPending || messages.isPending

  return (
    <>
      <PageMeta
        title="Admin Dashboard | Grace Hair Beauty"
        description="Grace Hair Beauty admin dashboard."
        canonical="https://gracehairsbeauty.com/admin/dashboard"
      />

      {/* Hero band */}
      <div style={{ background: HERO_GRADIENT }}>
        <div className="container-page py-10 md:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p
                className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.2em]"
                style={{ color: 'rgba(212,168,67,0.7)' }}
              >
                Admin
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-cream md:text-5xl">Dashboard</h1>
              <p className="mt-2 text-sm" style={{ color: 'rgba(250,246,240,0.5)' }}>
                Your salon at a glance. Jump into any section to manage today's work.
              </p>

              {/* Stat chips */}
              <div className="mt-6 flex flex-wrap gap-3">
                <StatChip
                  label="Pending appointments"
                  count={pendingCount}
                  isLoading={isLoading}
                  to="/admin/appointments"
                  accentColor="#D4A843"
                  trendPct={12}
                  trendUp={true}
                />
                <StatChip
                  label="Unread messages"
                  count={unreadCount}
                  isLoading={isLoading}
                  to="/admin/messages"
                  accentColor="#C87390"
                  trendPct={5}
                  trendUp={false}
                />
              </div>
            </div>

            {/* Progress ring */}
            <div className="shrink-0">
              <ProgressRing pending={pendingCount} target={10} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-page py-8">
        {/* Quick nav */}
        <div className="mb-2">
          <p className="mb-4 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-mocha/40">Quick access</p>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {QUICK_NAV.map((card) => (
              <TiltCard key={card.label} card={card} />
            ))}
          </div>
        </div>

        {/* Status panels */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <StatusPanel
            title="Pending appointments"
            icon={<CalendarDays size={15} style={{ color: '#D4A843' }} />}
            accentColor="#D4A843"
            isLoading={appointments.isPending}
          >
            {appointments.isError ? (
              <p className="text-sm text-error/80">Could not load appointments.</p>
            ) : pendingCount > 0 ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold" style={{ color: '#D4A843' }}>{pendingCount}</span>
                  <span className="ml-2 text-sm text-mocha/70">
                    {pendingCount === 1 ? 'appointment' : 'appointments'} awaiting confirmation
                  </span>
                </div>
                <Link
                  to="/admin/appointments"
                  className="rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all hover:opacity-80"
                  style={{ background: 'rgba(212,168,67,0.15)', color: '#92400e' }}
                >
                  Review →
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: 'rgba(34,197,94,0.15)' }}
                >
                  <span className="text-[0.65rem]">✓</span>
                </div>
                <p className="text-sm text-mocha/60">All caught up — no pending appointments.</p>
              </div>
            )}
          </StatusPanel>

          <StatusPanel
            title="Unread messages"
            icon={<Inbox size={15} style={{ color: '#C87390' }} />}
            accentColor="#C87390"
            isLoading={messages.isPending}
          >
            {messages.isError ? (
              <p className="text-sm text-error/80">Could not load messages.</p>
            ) : unreadCount > 0 ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold" style={{ color: '#C87390' }}>{unreadCount}</span>
                  <span className="ml-2 text-sm text-mocha/70">
                    unread {unreadCount === 1 ? 'message' : 'messages'} from clients
                  </span>
                </div>
                <Link
                  to="/admin/messages"
                  className="rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all hover:opacity-80"
                  style={{ background: 'rgba(200,115,144,0.15)', color: '#7c2d54' }}
                >
                  View →
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: 'rgba(34,197,94,0.15)' }}
                >
                  <span className="text-[0.65rem]">✓</span>
                </div>
                <p className="text-sm text-mocha/60">No unread messages.</p>
              </div>
            )}
          </StatusPanel>
        </div>
      </div>
    </>
  )
}

// ── Stat chip with CountUp + trend badge ──────────────────────────────────────

function TrendBadge({ pct, up }: { pct: number; up: boolean }) {
  return (
    <span
      className="ml-2 inline-flex items-center rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold"
      style={{
        background: up ? 'rgba(212,168,67,0.15)' : 'rgba(200,115,144,0.15)',
        color: up ? '#D4A843' : '#C87390',
      }}
    >
      {up ? '↑' : '↓'} {pct}%
    </span>
  )
}

function StatChip({
  label,
  count,
  isLoading,
  to,
  accentColor,
  trendPct,
  trendUp,
}: {
  label: string
  count: number
  isLoading: boolean
  to: string
  accentColor: string
  trendPct: number
  trendUp: boolean
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:opacity-80"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {isLoading ? (
        <div className="h-7 w-7 animate-pulse rounded-md bg-white/10" />
      ) : (
        <span className="text-2xl font-bold" style={{ color: accentColor }}>
          <CountUp end={count} duration={1.4} />
        </span>
      )}
      <span className="text-xs text-cream/55">{label}</span>
      {!isLoading && <TrendBadge pct={trendPct} up={trendUp} />}
    </Link>
  )
}

// ── SVG Progress Ring ─────────────────────────────────────────────────────────

function ProgressRing({ pending, target, isLoading }: { pending: number; target: number; isLoading: boolean }) {
  const r = 40
  const circumference = 2 * Math.PI * r
  const ratio = isLoading ? 0 : Math.min(pending / Math.max(target, 1), 1)
  const offset = circumference * (1 - ratio)

  return (
    <div
      className="flex flex-col items-center gap-3 rounded-2xl px-5 py-4"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(212,168,67,0.7)' }}>
        Weekly Bookings
      </p>
      <div className="relative">
        <svg width={108} height={108} viewBox="0 0 108 108">
          <defs>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4A843" />
              <stop offset="100%" stopColor="#C87390" />
            </linearGradient>
          </defs>
          <circle cx={54} cy={54} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
          <circle
            cx={54} cy={54} r={r}
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 54 54)"
            style={{ transition: 'stroke-dashoffset 0.9s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none text-cream">
            {isLoading ? '–' : pending}
          </span>
          <span className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-wide" style={{ color: 'rgba(250,246,240,0.45)' }}>
            pending
          </span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-xs font-semibold text-cream/60">Target: </span>
        <span className="text-xs font-bold text-cream/90">{target} / week</span>
      </div>
    </div>
  )
}

// ── 3D Tilt Quick-nav card ────────────────────────────────────────────────────

function TiltCard({ card }: { card: { label: string; to: string; icon: React.ElementType; accent: string } }) {
  const ref = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(4px)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)'
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave])

  const Icon = card.icon

  return (
    <Link
      ref={ref}
      to={card.to}
      className="group flex flex-col rounded-2xl border bg-paper p-5 shadow-soft"
      style={{
        borderColor: 'rgba(0,0,0,0.07)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        willChange: 'transform',
      }}
      onMouseEnter={(e) => {
        const hex = card.accent
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = `rgba(${r},${g},${b},0.4)`
        ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 4px 20px rgba(${r},${g},${b},0.15)`
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,0,0,0.07)'
        ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = ''
      }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
        style={{ background: `rgba(${hexToRgb(card.accent)},0.12)` }}
      >
        <Icon size={17} style={{ color: card.accent }} aria-hidden="true" />
      </div>
      <span className="mt-3.5 block text-sm font-semibold text-espresso">{card.label}</span>
      <span className="mt-0.5 text-[0.65rem] text-mocha/50">Manage →</span>
    </Link>
  )
}

// ── Status panel with glass + accent glow ─────────────────────────────────────

function StatusPanel({
  title,
  icon,
  accentColor,
  isLoading,
  children,
}: {
  title: string
  icon: ReactNode
  accentColor: string
  isLoading: boolean
  children: ReactNode
}) {
  const rgb = hexToRgb(accentColor)
  return (
    <section
      className="overflow-hidden rounded-2xl border bg-paper"
      style={{
        borderColor: 'rgba(0,0,0,0.07)',
        boxShadow: `0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(${rgb},0.12)`,
      }}
    >
      <div
        className="flex items-center gap-2.5 border-b px-5 py-3.5"
        style={{
          borderColor: 'rgba(0,0,0,0.06)',
          background: `linear-gradient(90deg, rgba(${rgb},0.07) 0%, rgba(0,0,0,0.02) 100%)`,
        }}
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{ background: `rgba(${rgb},0.12)` }}
        >
          {icon}
        </div>
        <h2 className="text-xs font-bold uppercase tracking-[0.06em] text-mocha/60">{title}</h2>
      </div>
      <div className="px-5 py-4">
        {isLoading ? (
          <div className="h-6 w-40 animate-pulse rounded bg-cream-deep" />
        ) : (
          children
        )}
      </div>
    </section>
  )
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
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
    <>
      {/* Hero band */}
      <div style={{ background: HERO_GRADIENT }}>
        <div className="container-page py-8 md:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.2em]"
                style={{ color: 'rgba(212,168,67,0.7)' }}
              >
                Admin
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-cream md:text-4xl">{title}</h1>
              <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: 'rgba(250,246,240,0.5)' }}>
                {intro}
              </p>
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-page py-8">{children}</div>
    </>
  )
}

export function AdminPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border bg-paper"
      style={{
        borderColor: 'rgba(0,0,0,0.07)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div
        className="border-b px-5 py-3.5"
        style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.015)' }}
      >
        <h2 className="text-xs font-bold uppercase tracking-[0.06em] text-mocha/60">{title}</h2>
      </div>
      <div className="px-5 py-4 text-espresso">{children}</div>
    </section>
  )
}
