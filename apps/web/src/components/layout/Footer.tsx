import type { ReactNode } from 'react'
import { Clock, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

import { formatAddress, formatHours, formatPhone, telHref } from '../../lib/format'
import type { BusinessSettings } from '../../types'

const EXPLORE_LINKS = [
  { label: 'Services', to: '/services' },
  { label: 'Products', to: '/products' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Book Appointment', to: '/book' },
  { label: 'About', to: '/about' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Contact', to: '/contact' },
]

const SERVICE_LINKS = [
  { label: 'African Braids',    to: '/book?service=svc-african-braids' },
  { label: 'Knotless Braids',   to: '/book?service=svc-knotless-braids' },
  { label: 'Natural Hairstyle', to: '/book?service=svc-natural-hairstyle' },
  { label: 'Sew-In',           to: '/book?service=svc-sew-in' },
  { label: 'Silk Press',        to: '/book?service=svc-silk-press' },
  { label: 'Kids Braids',       to: '/book?service=svc-kids-hairstyles' },
]

const CONTACT_LINK =
  'flex items-start gap-2.5 text-sm text-cream/55 transition-colors duration-200 hover:text-gold-light'

const COL_HEAD =
  'mb-5 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-gold-light/80'

// Inline SVG for TikTok (not in lucide-react)
function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  )
}

interface FooterProps {
  settings: BusinessSettings
}

export function Footer({ settings }: FooterProps) {
  const year = new Date().getFullYear()
  const { instagram, facebook, tiktok } = settings.socialLinks

  const socialLinks = [
    instagram && { href: instagram, label: 'Instagram', icon: <Instagram size={16} /> },
    facebook  && { href: facebook,  label: 'Facebook',  icon: <Facebook  size={16} /> },
    tiktok    && { href: tiktok,    label: 'TikTok',    icon: <TikTokIcon size={16} /> },
  ].filter(Boolean) as { href: string; label: string; icon: ReactNode }[]

  return (
    <footer
      className="border-t border-gold/15 text-cream"
      style={{ background: '#120903' }}
    >
      {/* ── Main columns ─────────────────────────────────────────────────── */}
      <div className="container-page pt-14 pb-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.7fr_0.8fr_1fr] lg:gap-12">

          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" aria-label="Grace Hair Beauty home" className="inline-block">
              <img
                src="/brand/logo-light.webp"
                alt="Grace Hair Beauty"
                width={2172}
                height={724}
                className="h-10 w-auto max-w-[200px] object-contain"
                draggable={false}
              />
            </Link>
            <p className="mt-5 max-w-[240px] text-sm leading-[1.85] text-cream/50">
              Premium African braiding, protective styles, and natural hair care in Indianapolis.
            </p>

            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map(({ href, label, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/20 text-cream/45 transition-colors duration-200 hover:border-gold/50 hover:text-gold-light"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Explore */}
          <nav aria-label="Footer navigation">
            <p className={COL_HEAD}>Explore</p>
            <ul className="grid gap-3">
              {EXPLORE_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-cream/55 transition-colors duration-200 hover:text-gold-light"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Services */}
          <nav aria-label="Services navigation">
            <p className={COL_HEAD}>Services</p>
            <ul className="grid gap-3">
              {SERVICE_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-cream/55 transition-colors duration-200 hover:text-gold-light"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4: Visit & Contact */}
          <address className="not-italic">
            <p className={COL_HEAD}>Visit &amp; Contact</p>
            <ul className="grid gap-4">
              <li>
                <a href={telHref(settings.phone)} className={CONTACT_LINK}>
                  <Phone size={13} className="mt-0.5 shrink-0 text-gold-light/50" aria-hidden="true" />
                  {formatPhone(settings.phone)}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.email}`} className={CONTACT_LINK}>
                  <Mail size={13} className="mt-0.5 shrink-0 text-gold-light/50" aria-hidden="true" />
                  {settings.email}
                </a>
              </li>
              <li>
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={CONTACT_LINK}
                >
                  <MapPin size={13} className="mt-0.5 shrink-0 text-gold-light/50" aria-hidden="true" />
                  {formatAddress(settings)}
                </a>
              </li>
              <li className={CONTACT_LINK}>
                <Clock size={13} className="mt-0.5 shrink-0 text-gold-light/50" aria-hidden="true" />
                {formatHours(settings)}
              </li>
            </ul>
          </address>

        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div className="border-t border-gold/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-[0.7rem] text-cream/30 sm:flex-row">
          <span>All rights reserved.</span>
          <span>&copy; {year} {settings.businessName}</span>
        </div>
      </div>
    </footer>
  )
}
