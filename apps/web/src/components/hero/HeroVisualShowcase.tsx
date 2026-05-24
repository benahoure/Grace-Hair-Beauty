import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

import { useReducedMotion } from '../../hooks/useReducedMotion'
import { HeroDecorativeRibbons } from './HeroDecorativeRibbons'
import { HeroStyleCard } from './HeroStyleCard'

const STYLES = [
  {
    id: 'hero-1',
    src: '/hero/desktop/hero-1.webp',
    label: 'African Braids',
    alt: 'Client wearing braids styled at Grace Hair Beauty in Indianapolis',
  },
  {
    id: 'hero-2',
    src: '/hero/desktop/hero-2.webp',
    label: 'Knotless Braids',
    alt: 'Client wearing knotless braids styled at Grace Hair Beauty in Indianapolis',
  },
  {
    id: 'hero-3',
    src: '/hero/desktop/hero-3.webp',
    label: 'Boho Braids',
    alt: 'Client wearing boho braids styled at Grace Hair Beauty in Indianapolis',
  },
  {
    id: 'hero-4',
    src: '/hero/desktop/hero-4.webp',
    label: 'Protective Styles',
    alt: 'Client with protective braided style at Grace Hair Beauty in Indianapolis',
  },
  {
    id: 'hero-5',
    src: '/hero/desktop/hero-5.webp',
    label: 'Natural Hair',
    alt: 'Client with natural hair styling at Grace Hair Beauty in Indianapolis',
  },
] as const

const INTERVAL_MS = 4500

export function HeroVisualShowcase() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  // Mouse-parallax motion values (desktop only, zero when reduced)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const parallaxX = useTransform(mouseX, [-0.5, 0.5], reduced ? [0, 0] : [-10, 10])
  const parallaxY = useTransform(mouseY, [-0.5, 0.5], reduced ? [0, 0] : [-6, 6])

  useEffect(() => {
    if (reduced || paused) return
    const id = setInterval(() => setActive((i) => (i + 1) % STYLES.length), INTERVAL_MS)
    return () => clearInterval(id)
  }, [reduced, paused])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
    setPaused(false)
  }

  return (
    <div
      ref={containerRef}
      className="relative flex w-full flex-col items-center"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Warm gold/cocoa atmosphere glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(212,168,67,0.36) 0%, rgba(184,134,11,0.16) 40%, rgba(192,128,96,0.06) 68%, transparent 100%)',
          filter: 'blur(52px)',
        }}
      />

      {/* Braid-inspired decorative ribbons — behind the image */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <HeroDecorativeRibbons />
      </div>

      {/* Floating + parallax image card */}
      <motion.div
        className="relative w-full"
        style={{ x: parallaxX, y: parallaxY }}
        animate={reduced ? {} : { y: [0, -10, 0] }}
        transition={
          reduced
            ? {}
            : { repeat: Infinity, duration: 5.5, ease: 'easeInOut', repeatType: 'mirror' }
        }
        data-testid="hero-visual-showcase"
      >
        {/* Aspect-ratio placeholder — 4:3 fits the 1672×941 images with gentle portrait crop */}
        <div className="aspect-video sm:aspect-[4/3]" />

        {STYLES.map((style, i) => (
          <motion.div
            key={style.id}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: i === active ? 1 : 0,
              scale: i === active ? 1 : reduced ? 1 : 0.97,
            }}
            transition={{
              opacity: { duration: reduced ? 0.12 : 0.6, ease: 'easeInOut' },
              scale: { duration: reduced ? 0 : 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
            }}
          >
            <HeroStyleCard style={style} eager={i === 0} />
          </motion.div>
        ))}
      </motion.div>

      {/* Active style label */}
      <div className="mt-4 flex items-center gap-2.5">
        <span className="text-xs text-gold-light" aria-hidden="true">◆</span>
        <motion.span
          key={STYLES[active].label}
          className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-cocoa/70"
          initial={{ opacity: 0, y: reduced ? 0 : 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.38, ease: 'easeOut' }}
        >
          {STYLES[active].label}
        </motion.span>
        <span className="text-xs text-gold-light" aria-hidden="true">◆</span>
      </div>

      {/* Navigation pills */}
      <div
        className="mt-3 flex items-center gap-2"
        role="group"
        aria-label="Hairstyle showcase navigation"
      >
        {STYLES.map((style, i) => (
          <button
            key={style.id}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show ${style.label}`}
            aria-pressed={i === active}
            className={`rounded-full transition-all duration-300 ${
              i === active
                ? 'h-2.5 w-8 bg-gold'
                : 'h-2.5 w-2.5 bg-cream-border hover:bg-latte'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
