import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, MessageCircle, Phone, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'

import { useReducedMotion } from '../../hooks/useReducedMotion'
import { formatHours, telHref } from '../../lib/format'
import type { BusinessSettings } from '../../types'

// ── Social icon SVGs ──────────────────────────────────────────────────────

function IGIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FBIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function TTIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  )
}

// ── Design tokens ─────────────────────────────────────────────────────────

const CREAM      = 'rgba(250,246,240,'
const GOLD       = 'rgba(212,168,67,'
const GOLD_SOLID = '#D4A843'
const COCOA      = '#2C1810'

// ── Premium easing ────────────────────────────────────────────────────────

const EASE_OUT = [0.22, 1, 0.36, 1] as const

// ── Framer Motion variants ────────────────────────────────────────────────
//
// contentVariants orchestrates staggered entrance of every section.
// Each child with `variants` automatically participates in the stagger.
// `initial={false}` on the container bypasses all of this for reduced-motion users.

const contentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.10,
    },
  },
}

// Sections that slide up (header, label, CTA, quick actions, footer)
const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: EASE_OUT },
  },
}

// Nav links slide in from the left
const linkVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.46, ease: EASE_OUT },
  },
}

// ── Injected CSS for logo focus ────────────────────────────────────────────
//
// The focus trap focuses the close button on open, not the logo. But we still
// need correct `:focus` vs `:focus-visible` handling on the logo link for
// keyboard users who tab back to it. Using CSS ensures cross-browser correctness:
// `:focus` removes any outline; `:focus-visible` (keyboard-only) adds a tasteful ring.

const LOGO_FOCUS_CSS = `
  .ghb-menu-logo:focus          { outline: none; box-shadow: none; }
  .ghb-menu-logo:focus-visible  {
    outline: 2px solid rgba(212,168,67,0.65);
    outline-offset: 6px;
    border-radius: 6px;
  }
  .ghb-menu-link:focus          { outline: none; }
  .ghb-menu-link:focus-visible  {
    outline: 1px solid rgba(212,168,67,0.45);
    outline-offset: 3px;
    border-radius: 3px;
  }
  .ghb-menu-btn:focus           { outline: none; }
  .ghb-menu-btn:focus-visible   {
    outline: 2px solid rgba(212,168,67,0.55);
    outline-offset: 3px;
    border-radius: 50%;
  }
`

// ── Component ─────────────────────────────────────────────────────────────

interface MobileNavLink {
  to: string
  label: string
  sub?: Array<{ to: string; label: string }>
}

interface MobileNavProps {
  open: boolean
  onClose: () => void
  links: Array<MobileNavLink>
  settings: BusinessSettings
  triggerRef?: React.RefObject<HTMLButtonElement>
}

export function MobileNav({ open, onClose, links, settings, triggerRef }: MobileNavProps) {
  const location  = useLocation()
  const reduced   = useReducedMotion()
  const panelRef  = useRef<HTMLDivElement>(null)
  const closeRef  = useRef<HTMLButtonElement>(null)
  const [expandedLink, setExpandedLink] = useState<string | null>(null)

  // Body scroll lock + StickyBookingBar signal
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('graceMobileMenuChange', { detail: { open } }))
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) setExpandedLink(null)
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleClose = useCallback(() => {
    onClose()
    window.setTimeout(() => triggerRef?.current?.focus(), 50)
  }, [onClose, triggerRef])

  // Escape key
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, handleClose])

  // Focus trap — initial focus goes to the close button (not the logo)
  // so the logo never receives programmatic focus and never shows a focus ring
  // unexpectedly on touch/mouse users.
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    )
    const first = focusables[0]
    const last  = focusables[focusables.length - 1]

    // Focus close button; fall back to first focusable if ref not attached yet
    window.setTimeout(() => (closeRef.current ?? first)?.focus(), 80)

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [open])

  const handleNav = (to: string) => {
    const current = location.pathname + location.search + location.hash
    handleClose()
    if (current === to) {
      window.setTimeout(() => {
        const hash = to.split('#')[1]
        if (hash) {
          document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 80)
    }
  }

  const { phone, socialLinks } = settings
  const smsHref = `sms:${phone.replace(/[^\d+]/g, '')}`
  const { instagram, facebook, tiktok } = socialLinks
  const hasSocial = instagram || facebook || tiktok

  return createPortal(
    <>
      {/* Injected CSS — explicit :focus / :focus-visible split for menu elements */}
      <style>{LOGO_FOCUS_CSS}</style>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: reduced ? 0.08 : 0.38, ease: 'easeIn' } }}
            transition={{ duration: reduced ? 0.08 : 0.50, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: COCOA,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              // Force GPU layer so iOS Safari paints above everything
              transform: 'translateZ(0)',
              willChange: 'transform',
            }}
          >
            {/* Warm gold glow — top-right */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse at 88% 0%, ${GOLD}0.10) 0%, transparent 50%)`,
                pointerEvents: 'none',
              }}
            />
            {/* Subtle warmth — bottom-left */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse at 15% 100%, ${GOLD}0.05) 0%, transparent 42%)`,
                pointerEvents: 'none',
              }}
            />

            {/* ── Staggered content container ──────────────────────────── */}
            {/*
              variants={contentVariants} drives staggerChildren.
              initial={false} when reduced-motion: Framer Motion skips all
              entrance animations and renders the visible state immediately.
            */}
            <motion.div
              variants={contentVariants}
              initial={reduced ? false : 'hidden'}
              animate="visible"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100%',
                paddingInline: 28,
                paddingTop: 'calc(22px + env(safe-area-inset-top))',
                paddingBottom: 'calc(44px + env(safe-area-inset-bottom))',
              }}
            >

              {/* ── [1] Header: logo + close ────────────────────────────── */}
              <motion.div
                variants={sectionVariants}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                {/* Logo — class-based CSS handles focus/focus-visible correctly */}
                <Link
                  to="/"
                  aria-label="Grace Hair Beauty home"
                  onClick={() => handleNav('/')}
                  className="ghb-menu-logo"
                  style={{ display: 'block', WebkitTapHighlightColor: 'transparent' }}
                >
                  <img
                    src="/brand/logo-light.webp"
                    alt="Grace Hair Beauty"
                    style={{ height: 44, width: 'auto', maxWidth: 178, objectFit: 'contain', display: 'block' }}
                    draggable={false}
                  />
                </Link>

                {/* Close button — receives initial focus on open (see focus trap above) */}
                <motion.button
                  ref={closeRef}
                  type="button"
                  aria-label="Close menu"
                  onClick={handleClose}
                  whileTap={reduced ? {} : { scale: 0.88, transition: { duration: 0.1 } }}
                  className="ghb-menu-btn"
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    minHeight: 44,
                    minWidth: 44,
                    borderRadius: '50%',
                    border: `1px solid ${GOLD}0.22)`,
                    background: `${GOLD}0.06)`,
                    color: `${GOLD}0.82)`,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'background 0.2s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <X size={17} aria-hidden="true" />
                </motion.button>
              </motion.div>

              {/* Gold divider — no stagger, just part of the background */}
              <div
                aria-hidden="true"
                style={{ height: 1, background: `${GOLD}0.13)`, marginTop: 26, marginBottom: 30 }}
              />

              {/* ── [2] "Explore Grace" label ───────────────────────────── */}
              <motion.p
                variants={sectionVariants}
                style={{
                  fontSize: '0.57rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: `${GOLD}0.50)`,
                  marginBottom: 16,
                }}
              >
                Explore Grace
              </motion.p>

              {/* ── [3–7] Nav links ─────────────────────────────────────── */}
              <nav aria-label="Mobile navigation">
                {links.map((link) => {
                  const isActive = location.pathname === link.to
                  const isExpanded = expandedLink === link.to
                  const hasSub = !!link.sub?.length

                  return (
                    <motion.div key={link.to} variants={linkVariants}>

                      {/* Main row: link text + optional expand toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${CREAM}0.055)` }}>
                        <Link
                          to={link.to}
                          onClick={() => handleNav(link.to)}
                          aria-current={isActive ? 'page' : undefined}
                          className="ghb-menu-link"
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            color: isActive ? GOLD_SOLID : `${CREAM}0.88)`,
                            fontSize: '1.475rem',
                            fontWeight: isActive ? 600 : 300,
                            letterSpacing: isActive ? '-0.01em' : '0.005em',
                            paddingBlock: 14,
                            textDecoration: 'none',
                            WebkitTapHighlightColor: 'transparent',
                            transition: 'color 0.15s',
                          }}
                        >
                          {/* Gold left-bar for active page */}
                          <span
                            aria-hidden="true"
                            style={{
                              display: 'block',
                              width: 2.5,
                              minWidth: 2.5,
                              height: isActive ? 22 : 0,
                              borderRadius: 2,
                              background: `linear-gradient(180deg, ${GOLD_SOLID} 0%, rgba(184,134,11,0.45) 100%)`,
                              flexShrink: 0,
                              transition: reduced ? 'none' : 'height 0.22s ease',
                              overflow: 'hidden',
                            }}
                          />
                          {link.label}
                        </Link>

                        {hasSub && (
                          <button
                            type="button"
                            aria-label={isExpanded ? `Collapse ${link.label}` : `Expand ${link.label}`}
                            aria-expanded={isExpanded}
                            onClick={() => setExpandedLink(isExpanded ? null : link.to)}
                            className="ghb-menu-btn"
                            style={{
                              display: 'grid',
                              placeItems: 'center',
                              minHeight: 44,
                              minWidth: 44,
                              background: 'none',
                              border: 'none',
                              color: `${GOLD}0.65)`,
                              cursor: 'pointer',
                              flexShrink: 0,
                              WebkitTapHighlightColor: 'transparent',
                            }}
                          >
                            <motion.span
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: reduced ? 0 : 0.20 }}
                            >
                              <ChevronDown size={16} aria-hidden="true" />
                            </motion.span>
                          </button>
                        )}
                      </div>

                      {/* Sub-links — animated expand/collapse */}
                      {hasSub && (
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: reduced ? 0 : 0.22, ease: EASE_OUT }}
                              style={{ overflow: 'hidden' }}
                            >
                              {link.sub!.map((subLink) => (
                                <Link
                                  key={subLink.to}
                                  to={subLink.to}
                                  onClick={() => handleNav(subLink.to)}
                                  className="ghb-menu-link"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    paddingLeft: 26,
                                    paddingBlock: 11,
                                    color: `${CREAM}0.65)`,
                                    fontSize: '0.95rem',
                                    fontWeight: 300,
                                    letterSpacing: '0.01em',
                                    borderBottom: `1px solid ${CREAM}0.04)`,
                                    textDecoration: 'none',
                                    WebkitTapHighlightColor: 'transparent',
                                    transition: 'color 0.15s',
                                  }}
                                >
                                  <span
                                    aria-hidden="true"
                                    style={{
                                      display: 'block',
                                      width: 4,
                                      height: 4,
                                      borderRadius: '50%',
                                      background: `${GOLD}0.50)`,
                                      flexShrink: 0,
                                    }}
                                  />
                                  {subLink.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}

                    </motion.div>
                  )
                })}
              </nav>

              {/* ── [8] Book Appointment CTA ────────────────────────────── */}
              <motion.div
                variants={sectionVariants}
                whileTap={reduced ? {} : { scale: 0.97, transition: { duration: 0.1 } }}
                style={{ marginTop: 30 }}
              >
                <Link
                  to="/book"
                  onClick={handleClose}
                  className="ghb-menu-link"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${GOLD_SOLID} 0%, #B8860B 100%)`,
                    color: COCOA,
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    letterSpacing: '0.04em',
                    borderRadius: 100,
                    paddingBlock: 16,
                    textDecoration: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    boxShadow: `0 6px 28px ${GOLD}0.30), 0 1px 6px ${GOLD}0.14)`,
                  }}
                >
                  Book Appointment
                </Link>
              </motion.div>

              {/* ── [9] Text Us · Call Us ────────────────────────────────── */}
              <motion.div
                variants={sectionVariants}
                style={{
                  marginTop: 12,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <motion.a
                  href={smsHref}
                  onClick={handleClose}
                  whileTap={reduced ? {} : { scale: 0.94, transition: { duration: 0.1 } }}
                  className="ghb-menu-link"
                  style={{
                    color: `${CREAM}0.72)`,
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    letterSpacing: '0.025em',
                    textDecoration: 'none',
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    paddingInline: 12,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <MessageCircle size={13} aria-hidden="true" style={{ opacity: 0.65, flexShrink: 0 }} />
                  Text Us
                </motion.a>

                <span aria-hidden="true" style={{ color: `${GOLD}0.25)`, fontSize: '0.7rem', lineHeight: 1, flexShrink: 0 }}>·</span>

                <motion.a
                  href={telHref(phone)}
                  onClick={handleClose}
                  whileTap={reduced ? {} : { scale: 0.94, transition: { duration: 0.1 } }}
                  className="ghb-menu-link"
                  style={{
                    color: `${CREAM}0.72)`,
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    letterSpacing: '0.025em',
                    textDecoration: 'none',
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    paddingInline: 12,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <Phone size={13} aria-hidden="true" style={{ opacity: 0.65, flexShrink: 0 }} />
                  Call Us
                </motion.a>
              </motion.div>

              {/* Spacer — pushes footer to bottom on tall screens */}
              <div style={{ flex: 1, minHeight: 32 }} />

              {/* ── [10] Social + brand footer ───────────────────────────── */}
              <motion.div variants={sectionVariants}>
                <div
                  aria-hidden="true"
                  style={{ height: 1, background: `${GOLD}0.12)`, marginBottom: 22 }}
                />

                {hasSocial && (
                  <div
                    role="list"
                    aria-label="Follow us on social media"
                    style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}
                  >
                    {instagram && (
                      <motion.a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open Instagram"
                        role="listitem"
                        whileTap={reduced ? {} : { scale: 0.88, transition: { duration: 0.1 } }}
                        className="ghb-menu-link"
                        style={{
                          color: `${CREAM}0.55)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 44,
                          minWidth: 44,
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        <IGIcon />
                      </motion.a>
                    )}
                    {facebook && (
                      <motion.a
                        href={facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open Facebook"
                        role="listitem"
                        whileTap={reduced ? {} : { scale: 0.88, transition: { duration: 0.1 } }}
                        className="ghb-menu-link"
                        style={{
                          color: `${CREAM}0.55)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 44,
                          minWidth: 44,
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        <FBIcon />
                      </motion.a>
                    )}
                    {tiktok && (
                      <motion.a
                        href={tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open TikTok"
                        role="listitem"
                        whileTap={reduced ? {} : { scale: 0.88, transition: { duration: 0.1 } }}
                        className="ghb-menu-link"
                        style={{
                          color: `${CREAM}0.55)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 44,
                          minWidth: 44,
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        <TTIcon />
                      </motion.a>
                    )}
                  </div>
                )}

                <div style={{ textAlign: 'center' }}>
                  <p
                    style={{
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: `${GOLD}0.48)`,
                      marginBottom: 5,
                    }}
                  >
                    Grace Hair Beauty
                  </p>
                  <p style={{ fontSize: '0.65rem', color: `${CREAM}0.28)`, letterSpacing: '0.02em', marginBottom: 4 }}>
                    Premium African braiding in Indianapolis
                  </p>
                  <p style={{ fontSize: '0.6rem', color: `${CREAM}0.18)`, letterSpacing: '0.01em' }}>
                    {formatHours(settings)}
                  </p>
                </div>
              </motion.div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}
