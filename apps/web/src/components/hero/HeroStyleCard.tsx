import { useState } from 'react'

interface HeroStyle {
  src: string
  label: string
  alt: string
}

interface HeroStyleCardProps {
  style: HeroStyle
  eager: boolean
}

export function HeroStyleCard({ style, eager }: HeroStyleCardProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-[0_32px_64px_rgba(44,24,16,0.28),0_6px_18px_rgba(44,24,16,0.14)]">
      {failed ? (
        <div
          className="absolute inset-0 bg-[linear-gradient(135deg,#2C1810_0%,#6B4226_45%,#B8860B_100%)]"
          role="img"
          aria-label={style.alt}
        />
      ) : (
        <img
          src={style.src}
          alt={style.alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
          onError={(e) => {
            console.error('[HeroStyleCard] Image failed to load:', style.src, e)
            setFailed(true)
          }}
        />
      )}
      {/* Subtle bottom vignette — keeps hair visible, face never covered */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-cocoa/40 to-transparent" />
    </div>
  )
}
