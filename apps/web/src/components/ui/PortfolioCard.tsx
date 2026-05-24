import type { PortfolioItem } from '../../types'

interface PortfolioCardProps {
  item: PortfolioItem
  onOpen: (item: PortfolioItem) => void
}

export function PortfolioCard({ item, onOpen }: PortfolioCardProps) {
  return (
    <button
      type="button"
      className="group relative aspect-[4/5] overflow-hidden rounded-card text-left"
      onClick={() => onOpen(item)}
      aria-label={`View ${item.title}`}
    >
      {/* Full-bleed image */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        style={{ objectPosition: 'center 30%' }}
        loading="lazy"
        decoding="async"
      />

      {/* Gradient overlay */}
      <span
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(28,14,8,0.88) 0%, rgba(28,14,8,0.45) 35%, transparent 60%)',
        }}
      />

      {/* Label — always visible on mobile, fades in on desktop hover */}
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
        <span className="block text-[0.9375rem] font-semibold text-cream">{item.title}</span>
        <span className="block text-[0.65rem] font-bold uppercase tracking-[0.12em] text-gold-light">
          View Style →
        </span>
      </span>
    </button>
  )
}
