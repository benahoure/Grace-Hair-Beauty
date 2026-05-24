import { shortDate } from '../../lib/format'
import type { Review } from '../../types'
import { StarRating } from './StarRating'

function avatarBg(name: string): string {
  const palette = ['#3b1f0e', '#4a2810', '#2e1a08', '#5c3317', '#3a2208', '#4d2c14']
  return palette[name.charCodeAt(0) % palette.length]
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials = name
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-gold/20"
      />
    )
  }
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold tracking-wide text-gold-light"
      style={{ background: avatarBg(name) }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-[#e8ddd0] bg-[#faf6f0] p-7 shadow-soft">
      <StarRating rating={review.rating} size={14} className="text-gold-dark" />

      <p className="mt-5 flex-1 text-sm leading-[1.65] text-espresso md:text-[1rem] md:leading-[1.85]">
        &ldquo;{review.body}&rdquo;
      </p>

      {review.serviceName && (
        <span className="mt-5 inline-block self-start rounded-md border border-gold/25 bg-gold-pale/70 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-gold-dark">
          {review.serviceName}
        </span>
      )}

      <footer className="mt-5 flex items-center gap-3 border-t border-[#e8ddd0] pt-5">
        <Avatar name={review.clientName} avatarUrl={review.avatarUrl} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-cocoa">{review.clientName}</p>
          <p className="text-[0.65rem] text-mocha">
            {review.source === 'google' ? 'Google Review' : 'Client Review'} &middot; {shortDate(review.createdAt)}
          </p>
        </div>
      </footer>
    </article>
  )
}
