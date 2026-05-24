import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export interface SalonProduct {
  id: string
  name: string
  category: string
  description: string
  imageUrl: string
  imagePosition?: string
  badge?: string
  bookingLink: string
  ctaLabel: string
}

interface ProductCardProps {
  product: SalonProduct
  index: number
}

export function ProductCard({ product, index }: ProductCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.12 }}
      className="group relative overflow-hidden rounded-card shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-editorial"
    >
      {/* Full-bleed image — same aspect ratio as ServiceCard */}
      <div className="aspect-[4/5] overflow-hidden bg-[linear-gradient(135deg,#2c1810,#6b4226_45%,#d4a843)]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition: product.imagePosition ?? 'center 22%' }}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Dark gradient overlay — identical to ServiceCard */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(28,14,8,0.92) 0%, rgba(28,14,8,0.60) 38%, rgba(28,14,8,0.10) 62%, transparent 80%)',
        }}
      />

      {/* Optional badge */}
      {product.badge && (
        <span
          className="absolute right-4 top-4 rounded-full px-3 py-1 text-[0.55rem] font-bold uppercase tracking-[0.12em]"
          style={{ background: 'rgba(184,134,11,0.90)', color: '#1a0f09' }}
        >
          {product.badge}
        </span>
      )}

      {/* Text content — pinned to bottom, same layout as ServiceCard */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-gold-light">
            {product.category}
          </p>
          <h3 className="mt-1 text-[1.05rem] font-semibold leading-snug text-cream">
            {product.name}
          </h3>
          <p className="mt-2 text-sm leading-[1.7] text-cream/70 line-clamp-2">
            {product.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-cream/15 pt-3">
          <span className="text-sm font-semibold text-cream/80">
            Available in-salon
          </span>
          <Link
            className="text-xs font-bold uppercase tracking-[0.10em] text-gold-light transition-colors hover:text-gold"
            to={product.bookingLink}
          >
            {product.ctaLabel} →
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
