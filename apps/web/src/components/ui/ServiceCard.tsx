import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { formatDuration, formatPrice } from '../../lib/format'
import type { SalonService } from '../../types'

interface ServiceCardProps {
  service: SalonService
}

function SlideShow({ images, name, position }: { images: string[]; name: string; position: string }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), 3000)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${name} at Grace Hair Beauty`}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 group-hover:scale-105"
          style={{ objectPosition: position, opacity: i === idx ? 1 : 0 }}
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
    </>
  )
}

export function ServiceCard({ service }: ServiceCardProps) {
  const images   = service.images ?? (service.imageUrl ? [service.imageUrl] : [])
  const position = service.imagePosition ?? 'center 30%'

  return (
    <article className="group relative overflow-hidden rounded-card shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-editorial">
      {/* Full-bleed image / slideshow */}
      <div className="aspect-[4/5] overflow-hidden bg-[linear-gradient(135deg,#2c1810,#6b4226_45%,#d4a843)]">
        {images.length > 0 && <SlideShow images={images} name={service.name} position={position} />}
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(28,14,8,0.92) 0%, rgba(28,14,8,0.60) 38%, rgba(28,14,8,0.10) 62%, transparent 80%)',
        }}
      />

      {/* Text content */}
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
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-cream/90">
              Starting at {formatPrice(service.startingPrice)}
            </span>
            {service.durationMinutes > 0 && (
              <span className="text-[0.7rem] text-cream/50">
                {formatDuration(service.durationMinutes)}
              </span>
            )}
          </div>
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
