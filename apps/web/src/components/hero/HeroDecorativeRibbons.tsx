import { motion } from 'framer-motion'

import { useReducedMotion } from '../../hooks/useReducedMotion'

export function HeroDecorativeRibbons() {
  const reduced = useReducedMotion()

  const drawIn = (delay: number) =>
    reduced
      ? { duration: 0 }
      : { duration: 2.2, ease: 'easeOut' as const, delay }

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Primary ribbon — right edge, flows top to bottom */}
      <svg
        className="absolute right-0 top-0 h-full w-20 opacity-55"
        viewBox="0 0 80 560"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="rbn-a" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#D4A843" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#B8860B" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#C08060" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rbn-b" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#C08060" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M52 0 C 16 72, 66 124, 40 212 C 14 300, 60 352, 40 440 C 20 528, 52 548, 40 560"
          stroke="url(#rbn-a)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={drawIn(0.35)}
        />
        <motion.path
          d="M70 0 C 34 82, 76 136, 56 224 C 36 312, 74 364, 56 452 C 38 540, 68 552, 56 560"
          stroke="url(#rbn-b)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={drawIn(0.6)}
        />
      </svg>

      {/* Secondary ribbon — bottom-left accent */}
      <svg
        className="absolute -left-1 bottom-0 h-2/5 w-12 opacity-40"
        viewBox="0 0 48 240"
        fill="none"
      >
        <defs>
          <linearGradient id="rbn-c" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#D4A843" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#C08060" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M24 0 C 6 42, 42 64, 24 122 C 6 180, 38 202, 24 240"
          stroke="url(#rbn-c)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={drawIn(0.85)}
        />
      </svg>

      {/* Top-left flick */}
      <svg
        className="absolute left-2 top-0 h-1/4 w-8 opacity-30"
        viewBox="0 0 32 140"
        fill="none"
      >
        <defs>
          <linearGradient id="rbn-d" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#B8860B" stopOpacity="0" />
            <stop offset="100%" stopColor="#D4A843" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <motion.path
          d="M16 0 C 4 28, 28 50, 16 90 C 4 130, 20 132, 16 140"
          stroke="url(#rbn-d)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={drawIn(1.1)}
        />
      </svg>
    </div>
  )
}
