import { useEffect, useState } from 'react'
import { Phone, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { telHref } from '../../lib/format'
import type { BusinessSettings } from '../../types'

interface StickyBookingBarProps {
  settings: BusinessSettings
}

export function StickyBookingBar({ settings }: StickyBookingBarProps) {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // Show only after user has scrolled past most of the hero (~70% of viewport height)
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.70)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onMenuChange = (e: Event) =>
      setMenuOpen((e as CustomEvent<{ open: boolean }>).detail.open)
    window.addEventListener('graceMobileMenuChange', onMenuChange)
    return () => window.removeEventListener('graceMobileMenuChange', onMenuChange)
  }, [])

  if (location.pathname === '/book' || location.pathname === '/contact') return null

  const visible = scrolled && !menuOpen

  return (
    <div
      className="md:hidden"
      style={{
        position: 'fixed',
        inset: 'auto 0 0',
        zIndex: 40,
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="sticky-booking-shell">
        <Link
          to="/book"
          className="sticky-booking-cta"
        >
          <Sparkles size={16} aria-hidden="true" />
          <span className="sticky-booking-copy">
            <span className="sticky-booking-title">Book Appointment</span>
            <span className="sticky-booking-subtitle">Confirmed within 24 hrs</span>
          </span>
        </Link>
        <a
          href={telHref(settings.phone)}
          aria-label={`Call ${settings.businessName}`}
          className="sticky-call-link"
        >
          <Phone size={20} aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
