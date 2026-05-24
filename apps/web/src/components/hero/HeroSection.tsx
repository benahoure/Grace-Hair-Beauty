import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { Award, Clock3, Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { HeroVisualShowcase } from './HeroVisualShowcase'

// ── Desktop background images ────────────────────────────────────────────────
// The portrait fills behind the glass nav, so each slide gets a small safe
// vertical offset and scale to keep eyes, hairline, and hairstyle below the
// floating header capsule without reintroducing a dark top band.
const IMAGES = [
  {
    src: '/hero/desktop/hero-1.webp',
    alt: 'Client wearing braids styled at Grace Hair Beauty in Indianapolis',
    label: 'African Braids',
    pos: 'center 52%',
    desktopShiftX: 0,
    desktopShiftY: 0,
    desktopScale: 1,
  },
  {
    src: '/hero/desktop/hero-2.webp',
    alt: 'Client wearing knotless braids styled at Grace Hair Beauty in Indianapolis',
    label: 'Knotless Braids',
    pos: 'center 52%',
    desktopShiftX: 0,
    desktopShiftY: 0,
    desktopScale: 1,
  },
  {
    src: '/hero/desktop/hero-3.webp',
    alt: 'Client wearing boho braids styled at Grace Hair Beauty in Indianapolis',
    label: 'Boho Braids',
    pos: 'center 52%',
    desktopShiftX: 0,
    desktopShiftY: 0,
    desktopScale: 1,
  },
  {
    src: '/hero/desktop/hero-4.webp',
    alt: 'Client with protective braided style at Grace Hair Beauty in Indianapolis',
    label: 'Protective Styles',
    pos: 'center 52%',
    desktopShiftX: 0,
    desktopShiftY: 0,
    desktopScale: 1,
  },
  {
    src: '/hero/desktop/hero-5.webp',
    alt: 'Client with natural hair styling at Grace Hair Beauty in Indianapolis',
    label: 'Natural Hair',
    pos: 'center 52%',
    desktopShiftX: 0,
    desktopShiftY: 0,
    desktopScale: 1,
  },
] as const

// ── Mobile carousel — art-directed mobile crops ──────────────────────────────
// Mobile assets are manually composed for narrow screens, so keep them centered
// and avoid per-slide transforms that fight the prepared framing.
const MOBILE_IMAGES = [
  {
    src: '/hero/mobile/hero-1.webp',
    alt: 'Client with long curly knotless braids at Grace Hair Beauty in Indianapolis',
    mobilePos: 'center center',
    mobileLift: 'clamp(68px, 9svh, 104px)',
    mobileScale: 1.14,
  },
  {
    src: '/hero/mobile/hero-2.webp',
    alt: 'Client with flowing locs in motion at Grace Hair Beauty in Indianapolis',
    mobilePos: 'center center',
    mobileLift: 'clamp(145px, 18svh, 210px)',
    mobileScale: 1.28,
  },
  {
    src: '/hero/mobile/hero-3.webp',
    alt: 'Client smiling with short natural locs at Grace Hair Beauty in Indianapolis',
    mobilePos: 'center center',
    mobileLift: 'clamp(132px, 16svh, 190px)',
    mobileScale: 1.26,
  },
  {
    src: '/hero/mobile/hero-4.webp',
    alt: 'Man with long protective braids at Grace Hair Beauty in Indianapolis',
    mobilePos: 'center center',
    mobileLift: 'clamp(48px, 7svh, 82px)',
    mobileScale: 1.11,
  },
  {
    src: '/hero/mobile/hero-5.webp',
    alt: 'Man with long braids being styled at Grace Hair Beauty in Indianapolis',
    mobilePos: 'center center',
    mobileLift: 'clamp(132px, 16svh, 190px)',
    mobileScale: 1.25,
  },
] as const

const TRUST_ITEMS = [
  { title: '15+ Years',       detail: 'of experience',       icon: Award, seed: 5000 },
  { title: 'Appointments',    detail: 'within 24 hours',     icon: Clock3, seed: 5100 },
  { title: 'Natural Hair',    detail: '& braids experts',    icon: Leaf, seed: 5200 },
] as const

const BODY_COPY =
  'Grace Hair Beauty brings expert African braiding and natural hair care to Indianapolis. Every style is done with patience, precision, and care.'

function exitT(p: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (p - start) / (end - start)))
}

// ── Cinematic per-letter exit (desktop headlines) ────────────────────────────
function FallingUnit({ char, index, exitProgress, staggerPer, duration, lineDrift }: {
  char: string
  index: number
  exitProgress: MotionValue<number>
  staggerPer: number
  duration: number
  lineDrift: number
}) {
  const offset = staggerPer * index
  const t = (p: number) => Math.min(1, Math.max(0, (p - offset) / duration))
  const opacity = useTransform(exitProgress, (p) => {
    const tv = t(p)
    return tv < 0.12 ? 1 : 1 - (tv - 0.12) / 0.88
  })
  const y = useTransform(exitProgress, (p) => -50 * t(p))
  const x = useTransform(exitProgress, (p) => lineDrift * 40 * t(p))
  if (char === ' ') {
    return <motion.span aria-hidden="true" style={{ display: 'inline-block', width: '0.24em', opacity, x, y }} />
  }
  return (
    <motion.span style={{ display: 'inline-block', opacity, x, y }}>
      {char}
    </motion.span>
  )
}

function FallingLetters({
  text,
  lineDrift,
  exitProgress,
  staggerPer = 0.012,
  duration  = 0.36,
}: {
  text: string
  lineDrift: number
  exitProgress: MotionValue<number>
  staggerPer?: number
  duration?: number
}) {
  return (
    <>
      {text.split('').map((char, i) => (
        <FallingUnit
          key={i}
          char={char}
          index={i}
          exitProgress={exitProgress}
          staggerPer={staggerPer}
          duration={duration}
          lineDrift={lineDrift}
        />
      ))}
    </>
  )
}

// ── Word-level exit for body copy (first half left, second half right) ───────
function FallingWord({ word, index, total, exitProgress, staggerPer, duration }: {
  word: string
  index: number
  total: number
  exitProgress: MotionValue<number>
  staggerPer: number
  duration: number
}) {
  const offset  = staggerPer * index
  const drift   = index < total / 2 ? -1 : 1
  const t = (p: number) => Math.min(1, Math.max(0, (p - offset) / duration))
  const opacity = useTransform(exitProgress, (p) => {
    const tv = t(p)
    return tv < 0.12 ? 1 : 1 - (tv - 0.12) / 0.88
  })
  const y = useTransform(exitProgress, (p) => -24 * t(p))
  const x = useTransform(exitProgress, (p) => drift * 28 * t(p))
  return (
    <motion.span style={{ display: 'inline-block', marginRight: '0.28em', opacity, x, y }}>
      {word}
    </motion.span>
  )
}

function FallingWords({
  text,
  exitProgress,
  staggerPer = 0.018,
  duration  = 0.38,
}: {
  text: string
  exitProgress: MotionValue<number>
  staggerPer?: number
  duration?: number
}) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <FallingWord
          key={i}
          word={word}
          index={i}
          total={words.length}
          exitProgress={exitProgress}
          staggerPer={staggerPer}
          duration={duration}
        />
      ))}
    </>
  )
}

export function HeroSection() {
  const reduced   = useReducedMotion()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const useSticky = isDesktop && !reduced

  const [active, setActive] = useState(0)
  useEffect(() => {
    if (reduced || !isDesktop) return
    const id = setInterval(() => setActive((i) => (i + 1) % IMAGES.length), 5000)
    return () => clearInterval(id)
  }, [reduced, isDesktop])

  const [mobileActive, setMobileActive] = useState(0)
  useEffect(() => {
    if (reduced || isDesktop) return
    const id = setInterval(() => setMobileActive((i) => (i + 1) % MOBILE_IMAGES.length), 5500)
    return () => clearInterval(id)
  }, [reduced, isDesktop])

  const { scrollY } = useScroll()

  // Viewport height as scroll range — text exits over first half of the hero
  // scroll, image stays visible for the rest. No heroFade = no blank gap.
  const scrollRange = typeof window !== 'undefined' ? window.innerHeight : 900
  const progress    = useTransform(scrollY, [0, scrollRange], [0, 1])
  const imgY        = useTransform(progress, (p) => -20 * p * p)
  const scrollHint  = useTransform(progress, [0, 0.05], [1, 0])

  // Mobile line-based exits
  const h1Opacity    = useTransform(progress, (p) => 1 - exitT(p, 0.08, 0.48))
  const h1X          = useTransform(progress, (p) => -20 * exitT(p, 0.08, 0.48))
  const h1Y          = useTransform(progress, (p) => -12 * exitT(p, 0.08, 0.48))
  const h2Opacity    = useTransform(progress, (p) => 1 - exitT(p, 0.12, 0.52))
  const h2X          = useTransform(progress, (p) =>  20 * exitT(p, 0.12, 0.52))
  const h2Y          = useTransform(progress, (p) => -12 * exitT(p, 0.12, 0.52))
  const ctaOpacity   = useTransform(progress, (p) => 1 - exitT(p, 0.22, 0.58))
  const ctaY         = useTransform(progress, (p) =>  14 * exitT(p, 0.22, 0.58))
  const trustOpacity = useTransform(progress, (p) => 1 - exitT(p, 0.26, 0.62))
  const trustY       = useTransform(progress, (p) =>   8 * exitT(p, 0.26, 0.62))

  // Desktop FallingLetters exit progress per line
  const h1ExitP   = useTransform(progress, (p) => exitT(p, 0.08, 0.48))
  const h2ExitP   = useTransform(progress, (p) => exitT(p, 0.12, 0.52))
  // Body copy word-split exit progress
  const bodyExitP = useTransform(progress, (p) => exitT(p, 0.18, 0.54))

  // ── Mobile hero ────────────────────────────────────────────────────────────
  if (!isDesktop) {
    return (
      <section>
        {/* Panel: images fill from the very top so the glass header sits over
            the portrait instead of leaving a dark safety band. */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '100svh',
            minHeight: 690,
            backgroundColor: '#2c1810',
          }}
        >
          {MOBILE_IMAGES.map((img, i) => (
            <div
              key={img.src}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: i === mobileActive ? 1 : 0,
                transition: reduced ? 'none' : 'opacity 1.2s ease-in-out',
                zIndex: i === mobileActive ? 1 : 0,
              }}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
	                decoding="async"
	                style={{
	                  width: '100%',
	                  height: '100%',
	                  objectFit: 'cover',
	                  objectPosition: img.mobilePos,
	                  transform: `translate3d(0, calc(-1 * ${img.mobileLift}), 0) scale(${img.mobileScale})`,
	                  transformOrigin: 'center top',
	                  display: 'block',
	                }}
	              />
            </div>
          ))}

          {/* Gradient over full panel: light at the top for the glass nav, dark at bottom for text. */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
              background:
                'linear-gradient(to bottom, rgba(28,14,8,0.03) 0%, rgba(28,14,8,0.035) 24%, rgba(28,14,8,0.34) 58%, rgba(18,9,3,0.88) 100%)',
            }}
          />

          {/* Gold accent top-right */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '55%',
              height: '45%',
              zIndex: 2,
              pointerEvents: 'none',
              background:
                'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(212,168,67,0.12) 0%, transparent 70%)',
            }}
          />

          {/* Text overlay — line-based scroll exit (no letter-splitting on mobile) */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 3,
              padding: '0 22px clamp(118px, 16svh, 142px)',
            }}
          >
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <h1
                className="display-heading"
                style={{
                  fontSize: 'clamp(1.9rem, 7.5vw, 2.6rem)',
                  lineHeight: 1.08,
                  color: '#FAF6F0',
                  margin: 0,
                  fontWeight: 600,
                  textShadow: '0 4px 24px rgba(18,9,3,0.46)',
                }}
              >
                <motion.span className="block" style={{ opacity: h1Opacity, x: h1X, y: h1Y }}>
                  Your Hair, Your Crown.
                </motion.span>
                <motion.span className="block font-light italic" style={{ opacity: h2Opacity, x: h2X, y: h2Y }}>
                  Braided to Perfection.
                </motion.span>
              </h1>

              <motion.div
                aria-hidden="true"
                style={{
                  width: 38,
                  height: 2,
                  marginTop: 16,
                  background: '#D4A843',
                  opacity: ctaOpacity,
                }}
              />

              <motion.p
                style={{
                  marginTop: 14,
                  maxWidth: 360,
                  color: 'rgba(255,250,242,0.82)',
                  fontSize: '0.84rem',
                  lineHeight: 1.75,
                  textShadow: '0 2px 14px rgba(18,9,3,0.52)',
                  opacity: ctaOpacity,
                  y: ctaY,
                }}
              >
                {BODY_COPY}
              </motion.p>

              <motion.div
                style={{
                  marginTop: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  opacity: ctaOpacity,
                  y: ctaY,
                }}
              >
                <Link
                  className="btn btn-gold hero-mobile-book-cta"
                  to="/book"
                  style={{ justifyContent: 'center' }}
                >
                  Book Your Appointment
                </Link>
                <Link
                  className="btn hero-mobile-work-cta"
                  to="/portfolio"
                  style={{
                    justifyContent: 'center',
                    border: '1px solid rgba(250,246,240,0.48)',
                    color: 'rgba(250,246,240,0.90)',
                    background:
                      'linear-gradient(135deg, rgba(18,9,3,0.20), rgba(250,246,240,0.045))',
                  }}
                >
                  View Our Work
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {!reduced && (
            <div
              role="group"
              aria-label="Gallery navigation"
              style={{
                position: 'absolute',
                bottom: 30,
                right: 18,
                zIndex: 4,
                display: 'flex',
                gap: 5,
                alignItems: 'center',
              }}
            >
              {MOBILE_IMAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMobileActive(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={i === mobileActive}
                  style={{
                    width: i === mobileActive ? 20 : 6,
                    height: 6,
                    borderRadius: 100,
                    background: i === mobileActive ? '#D4A843' : 'rgba(250,246,240,0.32)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'width 0.32s ease, background 0.32s ease',
                    WebkitTapHighlightColor: 'transparent',
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}

          <motion.div
            style={{
              position: 'absolute',
              left: 20,
              right: 78,
              bottom: 24,
              zIndex: 4,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 8,
              opacity: trustOpacity,
              y: trustY,
            }}
          >
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.seed}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 0,
                    color: 'rgba(255,250,242,0.82)',
                  }}
                >
                  <Icon size={15} strokeWidth={1.7} color="#D4A843" aria-hidden="true" />
                  <span
                    style={{
                      minWidth: 0,
                      fontSize: '0.49rem',
                      fontWeight: 800,
                      lineHeight: 1.18,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      textShadow: '0 2px 10px rgba(18,9,3,0.55)',
                    }}
                  >
                    {item.title}
                    <br />
                    <span style={{ color: 'rgba(255,250,242,0.58)', fontWeight: 700 }}>
                      {item.detail}
                    </span>
                  </span>
                </div>
              )
            })}
          </motion.div>
        </div>
      </section>
    )
  }

  // ── Desktop + reduced motion: static layout ──────────────────────────────
  if (!useSticky) {
    return (
      <section className="relative overflow-hidden bg-cream">
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-1/2"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 80% 65% at 72% 38%, rgba(212,168,67,0.18) 0%, rgba(184,134,11,0.07) 50%, transparent 100%)',
          }}
        />
        <div className="container-page grid min-h-[calc(100vh-var(--header-height))] grid-cols-1 items-center gap-10 py-16 md:grid-cols-2 md:gap-12 md:py-24">
          <div className="max-w-2xl">
            <h1 className="display-heading text-[clamp(2.55rem,7vw,4.8rem)] font-semibold leading-[1.06]">
              Your Hair, Your Crown.
              <br />
              <em className="font-light">Braided to Perfection.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-[1.8] text-espresso">{BODY_COPY}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link className="btn btn-outline" to="/portfolio">View Our Work</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-mocha">
              {TRUST_ITEMS.map((item) => (
                <span key={item.seed}>{item.title} {item.detail}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center pb-8 md:pb-0">
            <div className="w-full max-w-[480px] lg:max-w-[540px]">
              <HeroVisualShowcase />
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── Desktop animated hero ────────────────────────────────────────────────
  // The outer div takes 100vh of flow space. Hero imagery fills from y=0 so the
  // fixed glass header floats over the portrait instead of a dark top band.
  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 75% 80% at 75% 20%, rgba(120,78,46,0.22) 0%, transparent 58%), linear-gradient(135deg, #120904 0%, #24130c 55%, #140a05 100%)',
        padding: 0,
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: '100vh',
          minHeight: 700,
          borderRadius: 0,
          border: '0 solid transparent',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >

        {/* Per-slide images fill the full viewport, including behind the header. */}
        <div className="absolute inset-0" style={{ backgroundColor: '#2c1810' }}>
          {IMAGES.map((img, i) => (
	            <motion.div
	              key={img.src}
	              className="absolute inset-0"
	              style={{ y: imgY }}
	              initial={false}
	              animate={{ opacity: i === active ? 1 : 0 }}
	              transition={{ duration: 1.0, ease: 'easeInOut' }}
	            >
	              <img
	                src={img.src}
	                alt={img.alt}
	                loading={i === 0 ? 'eager' : 'lazy'}
	                decoding="async"
	                className="absolute inset-0 h-full w-full object-cover will-change-transform"
	                style={{
	                  objectPosition: img.pos,
	                  transform: `translate3d(${img.desktopShiftX}px, ${img.desktopShiftY}px, 0) scale(${img.desktopScale})`,
	                  transformOrigin: 'center center',
	                }}
	              />
	            </motion.div>
          ))}
        </div>

        {/* Readability gradient — covers full section including header zone */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(90deg, rgba(18,9,3,0.64) 0%, rgba(18,9,3,0.43) 30%, rgba(18,9,3,0.18) 58%, rgba(18,9,3,0.03) 100%)',
          }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(to top, rgba(18,9,3,0.30) 0%, rgba(18,9,3,0.10) 46%, rgba(18,9,3,0) 100%)',
          }}
        />

        {/* Gold accent */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 z-10 h-2/3 w-1/2"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 85% 60% at 0% 100%, rgba(212,168,67,0.20) 0%, transparent 68%)',
          }}
        />

        {/* Text column */}
        <div
          className="absolute inset-y-0 left-0 z-20 flex items-center pl-[clamp(48px,5.4vw,96px)]"
          style={{ paddingTop: 'clamp(88px, 12vh, 138px)' }}
        >
          <motion.div
            className="max-w-[580px]"
            style={{ width: 'min(40vw, 580px)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            {/* Desktop only: individual-letter split on headlines, word-split on body */}
            <h1
              className="font-display text-[clamp(3.45rem,4.75vw,5.4rem)] font-semibold leading-[0.98] text-cream"
              aria-label="Your Hair, Your Crown. Braided to Perfection."
              style={{ textShadow: '0 4px 28px rgba(28,14,8,0.42)' }}
            >
              <span className="block" aria-hidden="true">
                <FallingLetters text="Your Hair," lineDrift={-1} exitProgress={h1ExitP} />
              </span>
              <span className="block" aria-hidden="true">
                <FallingLetters text="Your Crown." lineDrift={-1} exitProgress={h1ExitP} />
              </span>
              <span className="mt-3 block text-[0.64em] font-light italic leading-[1.02]" aria-hidden="true">
                <FallingLetters text="Braided to Perfection." lineDrift={1} exitProgress={h2ExitP} />
              </span>
            </h1>

            <motion.div
              aria-hidden="true"
              className="mt-7 h-0.5 w-14 bg-gold-light"
              style={{ opacity: ctaOpacity, y: ctaY }}
            />

            <p
              className="mt-7 max-w-[430px] text-[1rem] leading-[1.9]"
              style={{
                color: 'rgba(255,250,242,0.88)',
                textShadow: '0 2px 16px rgba(18,9,3,0.48)',
              }}
            >
              <FallingWords text={BODY_COPY} exitProgress={bodyExitP} />
            </p>

            <motion.div
              className="mt-9 flex flex-col gap-4 sm:flex-row"
              style={{ opacity: ctaOpacity, y: ctaY }}
            >
              <Link
                className="hero-book-cta"
                to="/book"
              >
                Book Your Appointment
              </Link>
              <Link
                className="hero-work-cta"
                to="/portfolio"
              >
                View Our Work
              </Link>
            </motion.div>

            <motion.div
              className="mt-11 grid max-w-[600px] grid-cols-3 gap-0 text-sm font-semibold"
              style={{
                opacity: trustOpacity,
                y: trustY,
                color: 'rgba(255,250,242,0.82)',
                textShadow: '0 2px 14px rgba(18,9,3,0.45)',
              }}
            >
              {TRUST_ITEMS.map((item, index) => {
                const Icon = item.icon

                return (
                  <span
                    key={item.seed}
                    className={`flex min-w-0 items-center gap-3.5 pr-6 ${
                      index > 0 ? 'border-l border-gold/25 pl-6' : ''
                    }`}
                  >
                    <Icon size={24} strokeWidth={1.45} className="shrink-0 text-gold-light" aria-hidden="true" />
                    <span className="min-w-0 text-[0.66rem] font-extrabold uppercase leading-[1.25] tracking-[0.085em] text-cream/88">
                      {item.title}
                      <br />
                      <span className="font-semibold text-cream/62">{item.detail}</span>
                    </span>
                  </span>
                )
              })}
            </motion.div>
          </motion.div>
        </div>

        {/* Hairstyle label */}
        <div className="absolute bottom-8 right-8 z-30 flex items-center gap-2" aria-hidden="true">
          <span className="text-[9px] text-gold-light">◆</span>
          <motion.span
            key={active}
            className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-cream/55"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {IMAGES[active].label}
          </motion.span>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="pointer-events-none absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1.5"
          style={{ opacity: scrollHint }}
          aria-hidden="true"
        >
          <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-cream/55">
            scroll to experience
          </span>
          <motion.span
            className="text-gold-light"
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            ↓
          </motion.span>
        </motion.div>
      </div>
    </section>
  )
}
