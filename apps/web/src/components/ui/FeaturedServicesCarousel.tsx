import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { formatPrice } from '../../lib/format'
import type { SalonService } from '../../types'

// Minimum horizontal pixel movement before a touch gesture counts as a swipe.
const SWIPE_THRESHOLD = 50

interface Props {
  services: SalonService[]
}

function CarouselCard({ service }: { service: SalonService }) {
  const images = service.images ?? (service.imageUrl ? [service.imageUrl] : [])
  const position = service.imagePosition ?? 'center 30%'

  return (
    <article className="group relative overflow-hidden rounded-card shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-editorial">
      <div className="aspect-[4/5] overflow-hidden bg-[linear-gradient(135deg,#2c1810,#6b4226_45%,#d4a843)]">
        {images[0] && (
          <img
            src={images[0]}
            alt={`${service.name} at Grace Hair Beauty`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ objectPosition: position }}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        )}
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(28,14,8,0.92) 0%, rgba(28,14,8,0.60) 38%, rgba(28,14,8,0.10) 62%, transparent 80%)',
        }}
      />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-gold-light">
            {service.category.replace(/-/g, ' ')}
          </p>
          <h3 className="mt-1 text-[1.05rem] font-semibold leading-snug text-cream">
            {service.name}
          </h3>
          <p className="mt-2 text-sm leading-[1.7] text-cream/70 line-clamp-2">
            {service.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-cream/15 pt-3">
          <span className="text-sm font-semibold text-cream/90">
            Starting at {formatPrice(service.startingPrice)}
          </span>
          <Link
            className="text-xs font-bold uppercase tracking-[0.10em] text-gold-light transition-colors hover:text-gold"
            to={`/book?service=${service.serviceId}`}
          >
            Book →
          </Link>
        </div>
      </div>
    </article>
  )
}

export function FeaturedServicesCarousel({ services }: Props) {
  const [index, setIndex] = useState(0)
  const trackRef   = useRef<HTMLDivElement>(null)
  const [cardWidth, setCardWidth] = useState(0)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const measure = () => {
      const first = trackRef.current?.firstElementChild as HTMLElement | null
      if (first) setCardWidth(first.offsetWidth)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    return () => ro.disconnect()
  }, [services.length])

  const prev = useCallback(() => {
    setIndex(i => (i === 0 ? services.length - 1 : i - 1))
  }, [services.length])

  const next = useCallback(() => {
    setIndex(i => (i === services.length - 1 ? 0 : i + 1))
  }, [services.length])

  // ── Touch / pointer swipe handlers ───────────────────────────────────────
  //
  // touch-action: pan-y on the wrapper tells the browser to own vertical
  // scrolling natively so we never block page scroll. We only intercept
  // clearly-horizontal gestures by comparing dx vs dy on pointer up.

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return   // ignore right-click; touch sets button = 0
    pointerStart.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!pointerStart.current) return
    const dx = e.clientX - pointerStart.current.x
    const dy = e.clientY - pointerStart.current.y
    pointerStart.current = null

    // Only treat as a swipe when horizontal movement clearly dominates
    // and exceeds the minimum threshold. This protects against diagonal
    // scrolls and accidental tiny taps being misread as swipes.
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) { next() } else { prev() }
    }
  }, [next, prev])

  // Clear state when the pointer leaves the element or is cancelled
  // (e.g. the OS gesture recogniser takes over, incoming call, etc.)
  const clearPointer = useCallback(() => {
    pointerStart.current = null
  }, [])

  const scrollToAll = () => {
    document.getElementById('all-services')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!services.length) return null

  return (
    <div className="mt-10 pb-2">
      {/* Header row */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <p className="eyebrow !text-sm">Explore Featured Services</p>
        <button
          type="button"
          onClick={scrollToAll}
          className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.08em] text-gold-dark transition-colors hover:text-gold"
        >
          View All Services
          <ChevronRight size={14} className="rotate-90" aria-hidden="true" />
        </button>
      </div>

      {/* Carousel region — pointer handlers live here so tapping cards still works.
          touch-action: pan-y lets the browser scroll the page vertically unimpeded.
          select-none prevents text from being highlighted during a swipe gesture. */}
      <div
        className="relative overflow-hidden select-none"
        role="region"
        aria-label="Featured services carousel"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={clearPointer}
        onPointerCancel={clearPointer}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            transform: cardWidth ? `translateX(-${index * cardWidth}px)` : undefined,
            transition: prefersReduced ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {services.map((service) => (
            <div
              key={service.serviceId}
              className="w-full flex-shrink-0 pr-5 md:w-1/2 lg:w-1/3"
              role="group"
              aria-roledescription="slide"
              aria-label={service.name}
            >
              <CarouselCard service={service} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous service"
          className="grid h-10 w-10 place-items-center rounded-full border border-cream-border bg-cocoa text-gold-light shadow-soft transition-colors hover:bg-cocoa/80"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next service"
          className="grid h-10 w-10 place-items-center rounded-full border border-cream-border bg-cocoa text-gold-light shadow-soft transition-colors hover:bg-cocoa/80"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>

        {/* Dot indicators */}
        <div className="ml-2 flex gap-1.5" role="tablist" aria-label="Service slides">
          {services.map((service, i) => (
            <button
              key={service.serviceId}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${service.name}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-5 bg-gold-dark' : 'w-1.5 bg-cream-border hover:bg-mocha/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
