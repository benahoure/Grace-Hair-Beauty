import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  label?: string
  size?: number
  className?: string
}

export function StarRating({ rating, label, size = 16, className = 'text-gold-dark' }: StarRatingProps) {
  return (
    <span
      className={`inline-flex items-center gap-[3px] ${className}`}
      aria-label={label ?? `${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < Math.round(rating) ? 'currentColor' : 'transparent'}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}
