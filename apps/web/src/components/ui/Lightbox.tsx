import { X } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import type { PortfolioItem } from '../../types'

interface LightboxProps {
  item: PortfolioItem | null
  onClose: () => void
}

export function Lightbox({ item, onClose }: LightboxProps) {
  useEffect(() => {
    if (!item) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [item, onClose])

  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-cocoa/90 text-cream"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex min-h-full items-center justify-center p-5"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div className="relative grid w-full max-w-4xl gap-5 md:grid-cols-[1fr_0.8fr]">
          <button
            type="button"
            className="absolute right-0 top-0 z-10 grid min-h-11 min-w-11 place-items-center rounded-card border border-cream/30 bg-cocoa"
            aria-label="Close gallery preview"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </button>
          <div className="aspect-[4/5] overflow-hidden rounded-card bg-[linear-gradient(145deg,#3d2314,#6b4226_45%,#d4a843)]">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover object-top"
              />
            )}
          </div>
          <div className="self-end pb-4 md:pb-8">
            <p className="eyebrow text-gold-pale">{item.category.replace('-', ' ')}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">{item.title}</h2>
            <p className="mt-4 max-w-md text-cream/80">
              Bring this look to your appointment request and Grace will help tailor the style to your hair,
              length, and care needs.
            </p>
            <Link className="btn btn-gold mt-6" to={`/book?style=${item.styleId}`} onClick={onClose}>
              Book This Style
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
