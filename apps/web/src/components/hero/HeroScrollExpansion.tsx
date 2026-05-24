import { useState } from 'react'
import { motion, type MotionValue, useMotionValueEvent, useTransform } from 'framer-motion'

import { useReducedMotion } from '../../hooks/useReducedMotion'
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
] as const

interface HeroScrollExpansionProps {
  scrollYProgress: MotionValue<number>
}

export function HeroScrollExpansion({ scrollYProgress }: HeroScrollExpansionProps) {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)

  // Scroll-driven image switching — 0→0.33 knotless, 0.33→0.66 boho, 0.66→1 fulani
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = v < 0.33 ? 0 : v < 0.66 ? 1 : 2
    setActive((prev) => (prev !== next ? next : prev))
  })

  // Resolve pixel targets from viewport at render time
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const targetW = Math.min(vw * 0.88, 1160)
  const targetH = Math.min(vh * 0.82, 780)

  // Panel dimensions
  const panelWidth = useTransform(
    scrollYProgress,
    [0, 0.2, 0.65, 1],
    [520, 520, targetW, targetW],
  )
  const panelHeight = useTransform(
    scrollYProgress,
    [0, 0.2, 0.65, 1],
    [430, 430, targetH, targetH],
  )

  // Keep panel vertically centered as height animates
  const panelY = useTransform(panelHeight, (h: number) => -(h / 2))

  // Slight leftward nudge so the expanding panel feels more centered
  const panelX = useTransform(scrollYProgress, [0.2, 0.65], [0, -(vw * 0.04)])

  // Subtle 3D tilt (disabled when reduced motion)
  const rotateY = useTransform(scrollYProgress, [0.2, 0.65], reduced ? [0, 0] : [0, -1.8])
  const rotateX = useTransform(scrollYProgress, [0.2, 0.65], reduced ? [0, 0] : [0, 0.8])

  // Corner rounding and shadow
  const borderRadius = useTransform(scrollYProgress, [0, 0.65], [28, 16])
  const boxShadow = useTransform(
    scrollYProgress,
    [0, 0.65],
    [
      '0 32px 64px rgba(44,24,16,0.28), 0 6px 18px rgba(44,24,16,0.14)',
      '0 60px 120px rgba(44,24,16,0.55), 0 18px 40px rgba(44,24,16,0.28)',
    ],
  )

  // Glow and gloss
  const glowOpacity = useTransform(scrollYProgress, [0, 0.2, 0.65], [0.22, 0.22, 0.9])
  const glossOpacity = useTransform(scrollYProgress, [0.2, 0.65], [0.12, 0.28])

  return (
    <>
      {/* Atmospheric glow — expands with panel */}
      <motion.div
        className="pointer-events-none absolute right-0 top-1/2 z-[5]"
        aria-hidden="true"
        style={{
          width: panelWidth,
          height: panelHeight,
          y: panelY,
          x: panelX,
          opacity: glowOpacity,
          background:
            'radial-gradient(ellipse 90% 75% at 58% 52%, rgba(212,168,67,0.7) 0%, rgba(184,134,11,0.35) 42%, rgba(192,128,96,0.12) 68%, transparent 85%)',
          filter: 'blur(72px)',
          transform: 'scale(1.18)',
        }}
      />

      {/* Expanding cinematic panel */}
      <motion.div
        data-testid="hero-visual-showcase"
        className="absolute right-0 top-1/2 z-10 overflow-hidden"
        style={{
          width: panelWidth,
          height: panelHeight,
          y: panelY,
          x: panelX,
          rotateY,
          rotateX,
          borderRadius,
          boxShadow,
          perspective: 1200,
        }}
      >
        {/* Cross-fading hairstyle images */}
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
              opacity: { duration: reduced ? 0.1 : 0.75, ease: 'easeInOut' },
              scale: { duration: reduced ? 0 : 0.85, ease: [0.25, 0.46, 0.45, 0.94] },
            }}
          >
            <HeroStyleCard style={style} eager={i === 0} />
          </motion.div>
        ))}

        {/* Diagonal glossy highlight */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-[2]"
          aria-hidden="true"
          style={{
            opacity: glossOpacity,
            background:
              'linear-gradient(138deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.08) 38%, transparent 60%)',
          }}
        />

        {/* Bottom vignette */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-2/5"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(to top, rgba(44,24,16,0.52) 0%, rgba(44,24,16,0.1) 55%, transparent 100%)',
          }}
        />

        {/* Active style label */}
        <div className="absolute bottom-12 left-0 right-0 z-[4] flex items-center justify-center gap-2.5">
          <span className="text-[10px] text-gold-light" aria-hidden="true">◆</span>
          <motion.span
            key={STYLES[active].label}
            className="font-display text-lg font-semibold tracking-wide text-cream"
            initial={{ opacity: 0, y: reduced ? 0 : 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.35 }}
          >
            {STYLES[active].label}
          </motion.span>
          <span className="text-[10px] text-gold-light" aria-hidden="true">◆</span>
        </div>

        {/* Navigation dots */}
        <div
          className="absolute bottom-4 left-0 right-0 z-[4] flex items-center justify-center gap-2"
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
                  ? 'h-2 w-7 bg-gold'
                  : 'h-2 w-2 bg-cream/40 hover:bg-cream/70'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </>
  )
}
