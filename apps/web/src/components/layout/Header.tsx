import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu } from 'lucide-react'
import { useEffect, useId, useRef, useState, type MouseEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import type { BusinessSettings } from '../../types/index'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { MobileNav } from './MobileNav'

// ── Shared nav link style ─────────────────────────────────────────────────
const NAV_BASE =
  'relative text-sm font-semibold uppercase tracking-[0.06em] transition-colors ' +
  'after:absolute after:bottom-[-4px] after:left-0 after:h-[1.5px] ' +
  'after:transition-[width] after:duration-200 '

function navIdle(onHero: boolean) {
  return (
    NAV_BASE +
    (onHero
      ? 'text-cocoa/95 after:bg-gold-dark after:w-0 hover:text-cocoa hover:after:w-full'
      : 'text-mocha after:bg-gold-dark after:w-0 hover:text-cocoa hover:after:w-full')
  )
}

function navActive(onHero: boolean) {
  return (
    NAV_BASE +
    (onHero
      ? 'text-gold-dark after:bg-gold-dark after:w-full'
      : 'text-gold-dark after:bg-gold-dark after:w-full')
  )
}

// ── Dropdown item shape ───────────────────────────────────────────────────
interface DropItem {
  to: string
  label: string
  desc: string
  external?: boolean
}

// ── Nav items config ──────────────────────────────────────────────────────
const SERVICE_ITEMS: DropItem[] = [
  { to: '/services?category=african-braids',   label: 'African Braids',     desc: 'Full braiding service family' },
  { to: '/services?category=knotless-braids',  label: 'Knotless Braids',    desc: 'Lightweight, natural look' },
  { to: '/services?category=box-braids',       label: 'Box Braids',         desc: 'Classic parts, beautiful length' },
  { to: '/services?category=boho-braids',      label: 'Boho Braids',        desc: 'Soft curls and graceful texture' },
  { to: '/services?category=specialty-braids', label: 'Specialty Braids',   desc: 'Fulani, crochet, twists & custom work' },
]

const ABOUT_ITEMS: DropItem[] = [
  { to: '/about',            label: 'Our Story',   desc: '15+ years of African braiding expertise' },
  { to: '/about#meet-grace', label: 'Meet Grace',  desc: 'Founder & lead stylist' },
]

const CONTACT_ITEMS: DropItem[] = [
  { to: '/contact', label: 'Send a Message', desc: 'We reply within 24 hours' },
]

// ── Animated dropdown panel ───────────────────────────────────────────────
const DROP_VARIANTS = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

function DropPanel({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <motion.div
      id={id}
      variants={DROP_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute left-0 top-[calc(100%+12px)] z-50 min-w-[276px] overflow-hidden rounded-card border shadow-soft backdrop-blur"
      style={{
        background:
          'linear-gradient(145deg, rgba(255,253,249,0.985) 0%, rgba(247,239,228,0.975) 100%)',
        borderColor: 'rgba(212,168,67,0.30)',
        boxShadow:
          '0 24px 60px rgba(28,14,8,0.26), 0 1px 0 rgba(255,255,255,0.64) inset',
      }}
    >
      {children}
    </motion.div>
  )
}

function menuTargetId(to: string) {
  const hash = to.split('#')[1]
  if (hash) return hash
  if (to.startsWith('/services?category=')) return 'all-services'
  if (to.startsWith('/portfolio?category=')) return 'gallery'
  return ''
}

function scrollToMenuDestination(to: string) {
  const targetId = menuTargetId(to)
  if (!targetId) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  window.setTimeout(() => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 0)
}

// ── Nav item with dropdown ────────────────────────────────────────────────
function NavDropdown({ label, items, to, onHero }: { label: string; items: DropItem[]; to: string; onHero: boolean }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const currentLocation = location.pathname + location.search + location.hash

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={navIdle(onHero) + ' flex cursor-pointer items-center gap-1'}
        onClick={() => {
          setOpen((value) => !value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
            window.setTimeout(() => {
              wrapperRef.current?.querySelector<HTMLAnchorElement>('a[href]')?.focus()
            }, 0)
          }
        }}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
      >
        {label}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="mt-px"
        >
          <ChevronDown size={12} aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <DropPanel id={menuId}>
            {items.map((item, i) => (
              item.external
                ? (
                    <a
                      key={item.to}
                      href={item.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className={`group flex flex-col gap-1 px-5 py-3.5 transition-colors hover:bg-[#f2eadf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${i === 0 ? 'pt-5' : ''} ${i === items.length - 1 ? 'pb-5' : ''}`}
                    >
                      <span className="text-sm font-bold text-cocoa transition-colors group-hover:text-gold-dark">{item.label}</span>
                      <span className="text-xs font-medium leading-5 text-mocha/80">{item.desc}</span>
                    </a>
                  )
                : (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                        setOpen(false)
                        if (currentLocation === item.to) {
                          event.preventDefault()
                          scrollToMenuDestination(item.to)
                        }
                      }}
                      className={`group flex flex-col gap-1 px-5 py-3.5 transition-colors hover:bg-[#f2eadf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${i === 0 ? 'pt-5' : ''} ${i === items.length - 1 ? 'pb-5' : ''}`}
                    >
                      <span className="text-sm font-bold text-cocoa transition-colors group-hover:text-gold-dark">{item.label}</span>
                      <span className="text-xs font-medium leading-5 text-mocha/80">{item.desc}</span>
                    </Link>
                  )
            ))}
            {/* View all footer */}
            <div className="border-t border-[rgba(212,168,67,0.24)] bg-[#fffaf2]/80">
              <Link
                to={to}
                onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                  setOpen(false)
                  if (currentLocation === to) {
                    event.preventDefault()
                    scrollToMenuDestination(to)
                  }
                }}
                className="flex items-center gap-1.5 px-5 py-3.5 text-xs font-bold uppercase tracking-[0.08em] text-gold-dark transition-colors hover:text-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              >
                View All {label}
                <ChevronDown size={10} className="-rotate-90" aria-hidden="true" />
              </Link>
            </div>
          </DropPanel>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Header ───────────────────────────────────────────────────────────
interface HeaderProps {
  settings: BusinessSettings
}

export function Header({ settings }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const isMobileViewport = useMediaQuery('(max-width: 767px)')

  // Track whether the page has been scrolled past the blend threshold.
  // Using a boolean toggle (not a continuous value) keeps re-renders to a
  // minimum — the state only changes twice per scroll direction change.
  useEffect(() => {
    const isHP = location.pathname === '/'
    const check = () => {
      let threshold: number
      if (isHP) {
        const isMobile = window.innerWidth < 768
        // Stay in the floating glass state until the hero is essentially gone.
        // The mobile hero panel uses 100svh with a 690px floor.
        const mobileHeroHeight = Math.max(window.innerHeight, 690)
        threshold = isMobile
          ? mobileHeroHeight - 24
          : window.innerHeight * 0.96
      } else {
        threshold = 48
      }
      setScrolled(window.scrollY > threshold)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [location.pathname])

  const navLinks = [
    { to: '/products',  label: 'Products' },
    { to: '/portfolio', label: 'Portfolio' },
    { to: '/book',      label: 'Book' },
    { to: '/reviews',   label: 'Reviews' },
  ]

  const isHomepage = location.pathname === '/'
  const isHeroHeader = isHomepage && !scrolled
  const outerHeaderStyle: React.CSSProperties = isHeroHeader
    ? {
        background: 'transparent',
        borderBottom: '1px solid transparent',
        boxShadow: 'none',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        transition:
          'background 520ms ease, border-color 520ms ease, box-shadow 520ms ease, backdrop-filter 520ms ease',
      }
    : {
        background: 'rgba(250,247,242,0.96)',
        borderBottom: '1px solid rgba(80,45,30,0.08)',
        boxShadow: '0 14px 34px rgba(45,25,15,0.06)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        transition:
          'background 520ms ease, border-color 520ms ease, box-shadow 520ms ease, backdrop-filter 520ms ease',
      }
  const railStyle: React.CSSProperties = isHeroHeader
    ? {
        width: isMobileViewport
          ? 'min(calc(100% - 40px), 1480px)'
          : 'min(calc(100% - 64px), 1460px)',
        minHeight: isMobileViewport ? 'clamp(58px, 6.5vw, 70px)' : '72px',
        marginInline: 'auto',
        marginTop: isMobileViewport
          ? 'calc(12px + env(safe-area-inset-top))'
          : 'calc(clamp(24px, 2.1vw, 34px) + env(safe-area-inset-top))',
        paddingInline: isMobileViewport ? 'clamp(16px, 2.4vw, 30px)' : 'clamp(28px, 2.6vw, 40px)',
        borderRadius: 9999,
        background: isMobileViewport
          ? 'linear-gradient(135deg, rgba(255,253,249,0.28) 0%, rgba(250,247,242,0.14) 48%, rgba(247,232,210,0.25) 100%)'
          : 'linear-gradient(135deg, rgba(255,253,249,0.33) 0%, rgba(250,247,242,0.17) 44%, rgba(247,232,210,0.27) 100%)',
        border: isMobileViewport
          ? '1px solid rgba(255,255,255,0.38)'
          : '1px solid rgba(255,255,255,0.44)',
        borderBottom: isMobileViewport
          ? '1px solid rgba(212,168,67,0.14)'
          : '1px solid rgba(212,168,67,0.16)',
        boxShadow: isMobileViewport
          ? '0 16px 48px rgba(18,9,3,0.14), 0 4px 18px rgba(212,168,67,0.07), inset 0 1px 0 rgba(255,255,255,0.50), inset 0 -1px 0 rgba(90,55,35,0.06)'
          : '0 20px 64px rgba(18,9,3,0.15), 0 2px 18px rgba(212,168,67,0.08), inset 0 1px 0 rgba(255,255,255,0.58), inset 0 -1px 0 rgba(90,55,35,0.07)',
        backdropFilter: isMobileViewport
          ? 'blur(30px) saturate(190%)'
          : 'blur(34px) saturate(195%)',
        WebkitBackdropFilter: isMobileViewport
          ? 'blur(30px) saturate(190%)'
          : 'blur(34px) saturate(195%)',
        transition:
          'margin 520ms ease, min-height 520ms ease, background 520ms ease, border-color 520ms ease, border-radius 520ms ease, box-shadow 520ms ease, backdrop-filter 520ms ease',
      }
    : {
        width: undefined,
        minHeight: 'var(--header-height)',
        marginInline: undefined,
        marginTop: 0,
        paddingInline: 0,
        borderRadius: 0,
        background: 'transparent',
        border: '1px solid transparent',
        boxShadow: 'none',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        transition:
          'margin 520ms ease, min-height 520ms ease, background 520ms ease, border-color 520ms ease, border-radius 520ms ease, box-shadow 520ms ease, backdrop-filter 520ms ease',
      }

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={outerHeaderStyle}
    >
      <div
        className="container-page grid min-h-[var(--header-height)] grid-cols-[auto_1fr_auto] items-center gap-6"
        style={railStyle}
      >

        {/* Logo — left on mobile and desktop */}
        <Link
          to="/"
          aria-label="Grace Hair Beauty home"
          className="header-logo-link"
          onClick={(event) => {
            if (location.pathname === '/' && !location.search && !location.hash) {
              event.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
        >
          <img
            src="/brand/logo-primary-transparent.webp"
            alt="Grace Hair Beauty"
            height={44}
            className="h-10 w-auto max-w-[176px] object-contain md:hidden"
            draggable={false}
          />
          <img
            src="/brand/logo-primary-transparent.webp"
            alt="Grace Hair Beauty logo"
            width={2172}
            height={724}
            className="hidden h-12 w-auto max-w-[220px] object-contain md:block md:h-14"
            draggable={false}
          />
        </Link>

        {/* Nav — centered, desktop only */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center justify-center gap-5 xl:flex 2xl:gap-7"
        >
          <NavDropdown label="Services" to="/services" items={SERVICE_ITEMS} onHero={isHeroHeader} />

          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={(event) => {
                if (location.pathname + location.search + location.hash === link.to) {
                  event.preventDefault()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
              className={({ isActive }) => (isActive ? navActive(isHeroHeader) : navIdle(isHeroHeader))}
            >
              {link.label}
            </NavLink>
          ))}

          <NavDropdown label="About" to="/about" items={ABOUT_ITEMS} onHero={isHeroHeader} />
          <NavDropdown label="Contact" to="/contact" items={CONTACT_ITEMS} onHero={isHeroHeader} />
        </nav>

        {/* Hamburger — right on mobile */}
        <div className="flex items-center justify-end gap-3">
          <div className={isHeroHeader ? 'hidden' : 'hidden xl:block'}>
            <Link
              className="header-booking-cta"
              to="/book"
            >
              Book Appointment
            </Link>
          </div>
          <button
            ref={hamburgerRef}
            type="button"
            className={`grid min-h-11 min-w-11 place-items-center rounded-full border transition-colors xl:hidden ${
              isHeroHeader
                ? 'border-mocha/20 text-cocoa hover:bg-cocoa/5 active:bg-cocoa/10'
                : 'border-cream-border text-cocoa hover:bg-cream-deep active:bg-cream-border'
            }`}
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>

      </div>
      <MobileNav
        open={open}
        onClose={() => setOpen(false)}
        settings={settings}
        triggerRef={hamburgerRef}
        links={[
          { to: '/services',  label: 'Services' },
          { to: '/products',  label: 'Products' },
          { to: '/portfolio', label: 'Portfolio' },
          { to: '/book',      label: 'Book' },
          { to: '/about',     label: 'About' },
          { to: '/reviews',   label: 'Reviews' },
          { to: '/contact',   label: 'Contact' },
        ]}
      />
    </header>
  )
}
