import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { ReviewSubmitForm } from '../components/forms/ReviewSubmitForm'
import { PageHero } from '../components/hero/PageHero'
import { PageMeta } from '../components/seo/PageMeta'
import { ReviewCard } from '../components/ui/ReviewCard'
import { StarRating } from '../components/ui/StarRating'
import { useBusinessSettings } from '../hooks/useBusinessSettings'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { api } from '../lib/api'
import { defaultBusinessSettings } from '../lib/mockData'
import type { Review } from '../types'

// ── Avatar helpers (mirrors ReviewCard.tsx — no duplication of data) ──────────
function avatarBg(name: string): string {
  const palette = ['#3b1f0e', '#4a2810', '#2e1a08', '#5c3317', '#3a2208', '#4d2c14']
  return palette[name.charCodeAt(0) % palette.length]
}

function initials(name: string): string {
  return name
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ── Mini review card — used in hero panel and mobile carousel ─────────────────
const CARD_OFFSETS = [-10, 16, 2]
const CARD_ROTATES = [-1.5, 1.2, -0.8]
const CARD_FLOAT_Y = [-8, 10, -6]
const CARD_DELAYS  = [0, 1.4, 2.8]

// Curated short excerpts for featured carousel cards — avoids awkward auto-truncation
const FEATURED_EXCERPTS: Record<string, string> = {
  'review-1': 'Clean parts, zero tension on my scalp, and they lasted almost 8 weeks.',
  'review-2': 'Ariane was so patient and gentle with my daughter — she kept saying she wanted to come back every week.',
  'review-3': 'Best boho braids I have ever had. The texture was perfect, the length was flawless.',
}

interface MiniCardProps {
  review: Review
  index: number
  reduced: boolean
  noTransform?: boolean
  excerpt?: string
  allowExpand?: boolean
}

function MiniHeroCard({ review, index, reduced, noTransform = false, excerpt, allowExpand = false }: MiniCardProps) {
  const [expanded, setExpanded] = useState(false)
  const preview = excerpt ?? (review.body.length > 95 ? review.body.slice(0, 93) + '…' : review.body)
  const hasMore = allowExpand && preview !== review.body
  const displayText = hasMore && expanded ? review.body : preview

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.14, ease: 'easeOut' }}
      style={noTransform ? undefined : {
        translateX: CARD_OFFSETS[index] ?? 0,
        rotate: CARD_ROTATES[index] ?? 0,
      }}
    >
      <motion.article
        animate={reduced ? {} : { y: [0, CARD_FLOAT_Y[index] ?? -8, 0] }}
        transition={reduced ? {} : {
          duration: 6 + index * 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: CARD_DELAYS[index] ?? 0,
        }}
        className="rounded-2xl border border-[#e8ddd0] bg-white/92 p-5"
        style={{ boxShadow: '0 8px 32px rgba(44,24,16,0.10), 0 2px 8px rgba(44,24,16,0.06)' }}
      >
        <div className="flex items-center gap-3">
          {review.avatarUrl ? (
            <img
              src={review.avatarUrl}
              alt={review.clientName}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-gold/20"
            />
          ) : (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold tracking-wide text-gold-light"
              style={{ background: avatarBg(review.clientName) }}
              aria-hidden="true"
            >
              {initials(review.clientName)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-cocoa">{review.clientName}</p>
            <StarRating
              rating={review.rating}
              size={10}
              className="text-gold-dark"
              label={`${review.rating} out of 5 stars`}
            />
          </div>
        </div>

        <p className="mt-3 text-xs leading-[1.75] text-espresso/80">
          &ldquo;{displayText}&rdquo;
        </p>

        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 text-[0.65rem] font-semibold text-gold-dark transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
          >
            {expanded ? 'Show less ↑' : 'Read full review →'}
          </button>
        )}

        {review.serviceName && (
          <span className="mt-3 inline-block rounded-md border border-gold/25 bg-[#fdf8ec] px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.11em] text-gold-dark">
            {review.serviceName}
          </span>
        )}
      </motion.article>
    </motion.div>
  )
}

// ── Empty-state panel ─────────────────────────────────────────────────────────
function HeroEmptyPanel({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center rounded-3xl border border-[#e8ddd0] bg-white/80 px-8 py-14 text-center"
      style={{ boxShadow: '0 8px 40px rgba(44,24,16,0.09)' }}
    >
      <span className="text-3xl text-gold-dark" aria-hidden="true">◆</span>
      <p className="mt-5 text-base font-semibold text-cocoa">Client stories coming soon.</p>
      <p className="mt-2 max-w-[200px] text-xs leading-[1.75] text-espresso/60">
        Be the first to share your Grace Hair Beauty experience.
      </p>
      <a
        href="#leave-a-review"
        className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-gold/50 px-5 py-2 text-xs font-semibold text-gold-dark transition-colors hover:border-gold"
      >
        Share Your Experience
        <span aria-hidden="true">→</span>
      </a>
    </motion.div>
  )
}

// ── Desktop hero panel: 3 floating stacked cards ──────────────────────────────
function HeroReviewPanel({ reviews, reduced }: { reviews: Review[]; reduced: boolean }) {
  const display = reviews.slice(0, 3)
  if (display.length === 0) return <HeroEmptyPanel reduced={reduced} />

  return (
    <div className="flex flex-col gap-5">
      <p className="eyebrow">Recent client love</p>
      {display.map((review, i) => (
        <MiniHeroCard key={review.reviewId} review={review} index={i} reduced={reduced} excerpt={FEATURED_EXCERPTS[review.reviewId]} allowExpand />
      ))}
    </div>
  )
}

// ── Mobile featured carousel (1 card at a time) ───────────────────────────────
function FeaturedCarousel({ reviews, reduced }: { reviews: Review[]; reduced: boolean }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const dragStartX = useRef<number | null>(null)
  const total = reviews.length

  useEffect(() => {
    if (reduced || paused || total <= 1) return
    const id = setInterval(() => setCurrent((i) => (i + 1) % total), 5000)
    return () => clearInterval(id)
  }, [reduced, paused, total])

  const prev = () => setCurrent((i) => (i - 1 + total) % total)
  const next = () => setCurrent((i) => (i + 1) % total)

  return (
    <div
      role="region"
      aria-label="Recent client reviews"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Accessible live announcement for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {reviews[current]
          ? `Review ${current + 1} of ${total} by ${reviews[current].clientName}`
          : ''}
      </div>

      {/* Slide track */}
      <div
        className="overflow-hidden"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={(e) => { dragStartX.current = e.clientX }}
        onPointerUp={(e) => {
          if (dragStartX.current === null) return
          const delta = dragStartX.current - e.clientX
          if (delta > 40) next()
          else if (delta < -40) prev()
          dragStartX.current = null
        }}
      >
        <motion.div
          className="flex"
          animate={{ x: `${-current * 100}%` }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }
          }
        >
          {reviews.map((review, i) => (
            <div
              key={review.reviewId}
              className="min-w-full"
              aria-hidden={i !== current ? true : undefined}
            >
              <MiniHeroCard review={review} index={i} reduced={reduced} noTransform excerpt={FEATURED_EXCERPTS[review.reviewId]} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Controls: invisible prev/next (shown on keyboard focus), centered dots */}
      <div className="relative mt-1.5 flex items-center justify-center px-10">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous review"
          className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-transparent transition-colors focus-visible:border-[#e0cc8a] focus-visible:bg-white/80 focus-visible:text-cocoa focus-visible:outline-none"
        >
          <ChevronLeft size={15} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-0" role="group" aria-label="Review position">
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to review ${i + 1}`}
              aria-pressed={i === current}
              className="flex items-center justify-center px-2 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-1"
            >
              <span
                className="block rounded-full transition-all duration-300"
                style={{
                  height: '7px',
                  width: i === current ? '20px' : '7px',
                  background: i === current ? '#B8860B' : 'rgba(44,24,16,0.20)',
                }}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Next review"
          className="absolute right-0 flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-transparent transition-colors focus-visible:border-[#e0cc8a] focus-visible:bg-white/80 focus-visible:text-cocoa focus-visible:outline-none"
        >
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ── Decorative background shapes (aria-hidden, reduced-motion safe) ───────────
function HeroShapes({ reduced }: { reduced: boolean }) {
  const float = (y: number, dur: number, delay: number) =>
    reduced ? {} : {
      animate: { y: [0, y, 0] as number[] },
      transition: { duration: dur, repeat: Infinity, ease: 'easeInOut' as const, delay },
    }

  return (
    <div
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
      aria-hidden="true"
    >
      <motion.div
        className="absolute left-[6%] top-[18%] h-[180px] w-[2px] rounded-full"
        style={{ background: 'rgba(180,134,11,0.09)', rotate: '22deg' }}
        {...float(-12, 9, 0)}
      />
      <motion.div
        className="absolute right-[8%] top-[30%] h-[130px] w-[1.5px] rounded-full"
        style={{ background: 'rgba(180,134,11,0.07)', rotate: '-20deg' }}
        {...float(9, 12, 2.5)}
      />
      <motion.div
        className="absolute bottom-[18%] left-[3%] h-[72px] w-[72px] rounded-full"
        style={{ border: '1px solid rgba(180,134,11,0.10)' }}
        {...float(-8, 13, 0.5)}
      />
      <motion.div
        className="absolute left-[14%] top-[55%] h-3 w-3 rotate-45"
        style={{ background: 'rgba(180,134,11,0.11)' }}
        {...float(-6, 8, 1.5)}
      />
      <motion.div
        className="absolute right-[42%] top-[14%] h-2 w-2 rotate-45"
        style={{ background: 'rgba(44,24,16,0.08)' }}
        {...float(4, 9, 3.5)}
      />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function Reviews() {
  const { data: settingsData } = useBusinessSettings()
  const settings = settingsData ?? defaultBusinessSettings
  const reviewsQuery = useQuery({ queryKey: ['reviews'], queryFn: api.getReviews })
  const reviews = reviewsQuery.data?.reviews ?? []
  const aggregates = reviewsQuery.data?.aggregates ?? { averageRating: 0, totalCount: 0 }
  const reduced = useReducedMotion()
  const [submitted, setSubmitted] = useState(false)
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!submitted) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Move focus to heading so screen readers announce the page change
    window.setTimeout(() => confirmHeadingRef.current?.focus({ preventScroll: true }), 300)
  }, [submitted])

  const approvedReviews = reviews.filter((r) => r.status === 'approved')
  const featuredReviews = (() => {
    const explicit = approvedReviews.filter((r) => r.featured)
    if (explicit.length >= 3) return explicit.slice(0, 3)
    const explicitIds = new Set(explicit.map((r) => r.reviewId))
    const rest = approvedReviews.filter((r) => !explicitIds.has(r.reviewId))
    return [...explicit, ...rest].slice(0, 3)
  })()
  const featuredIds = new Set(featuredReviews.map((r) => r.reviewId))
  const remainingReviews = approvedReviews.filter((r) => !featuredIds.has(r.reviewId))
  const hasReviews = approvedReviews.length > 0

  if (submitted) {
    return (
      <>
        <PageMeta
          title="Review Submitted | Grace Hair Beauty"
          description="Thank you — your review has been submitted to Grace Hair Beauty."
          canonical="https://gracehairsbeauty.com/reviews"
        />
        <section
          className="flex min-h-[70vh] items-center py-16 lg:py-20"
          style={{ background: '#faf6f0' }}
        >
          <div className="container-page flex justify-center">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-paper"
              style={{ boxShadow: '0 32px 80px rgba(44,24,16,0.18), 0 4px 16px rgba(44,24,16,0.10)' }}
            >
              <div className="bg-cocoa px-8 py-12 text-center">
                <motion.div
                  initial={reduced ? false : { scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 14 }}
                  className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold"
                >
                  <Check size={36} strokeWidth={2.5} className="text-espresso" aria-hidden="true" />
                </motion.div>
                <motion.h1
                  ref={confirmHeadingRef}
                  tabIndex={-1}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="font-display mt-6 text-3xl font-semibold text-cream focus:outline-none"
                >
                  Review Submitted!
                </motion.h1>
                <motion.p
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                  className="mt-3 text-sm leading-relaxed text-cream/65"
                >
                  Thank you for sharing your experience. Your review will be visible on this page once our team has had a chance to read it.
                </motion.p>
              </div>
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.35 }}
                className="flex flex-col gap-3 px-8 py-8"
              >
                <a href="/reviews" className="btn btn-outline w-full justify-center">
                  Back to Reviews
                </a>
                <a href="/" className="btn btn-gold w-full justify-center">
                  Back to Home
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageMeta
        title="Client Reviews | Grace Hair Beauty"
        description="Kind words from clients who trust Grace Hair Beauty with their braids, natural hair, and protective styles in Indianapolis."
        canonical="https://gracehairsbeauty.com/reviews"
      />

      <PageHero
        eyebrow="Client Experiences"
        title="What Our"
        italicTitle="Clients Say"
        description="Kind words from clients who trust Grace Hair Beauty with their braids, natural hair, and protective styles."
        backgroundDecor={<HeroShapes reduced={reduced} />}
        supporting={hasReviews && (
          <motion.div
            className="inline-flex flex-wrap items-center gap-3 rounded-full border border-[#e0cc8a] bg-white/80 px-5 py-2.5 shadow-soft backdrop-blur-sm"
            initial={reduced ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
          >
            <StarRating
              rating={aggregates.averageRating}
              size={13}
              className="text-gold-dark"
              label={`${aggregates.averageRating.toFixed(1)} out of 5 stars`}
            />
            <span className="text-sm font-semibold text-cocoa">
              {aggregates.averageRating.toFixed(1)} average
              &nbsp;&middot;&nbsp;
              {aggregates.totalCount} {aggregates.totalCount === 1 ? 'client review' : 'client reviews'}
            </span>
          </motion.div>
        )}
        visual={(
          <div className="hidden md:block">
            {reviewsQuery.isLoading ? (
              <div className="flex flex-col gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#ede7de]/60" />
                ))}
              </div>
            ) : featuredReviews.length > 0 ? (
              <HeroReviewPanel reviews={featuredReviews} reduced={reduced} />
            ) : (
              <HeroEmptyPanel reduced={reduced} />
            )}
          </div>
        )}
      />

      {/* ── Mobile-only featured carousel ─────────────────────────────────── */}
      {!reviewsQuery.isLoading && featuredReviews.length > 0 && (
        <div className="bg-[#faf6f0] pb-2 pt-2 md:hidden">
          <div className="container-page">
            <p className="eyebrow mb-3">Recent client love</p>
            <FeaturedCarousel reviews={featuredReviews} reduced={reduced} />
          </div>
        </div>
      )}

      {/* ── More client stories ────────────────────────────────────────────── */}
      <section className="bg-cream pb-14 pt-10 md:pb-24 md:pt-24">
        <div className="container-page">
          {reviewsQuery.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-cream-border" />
              ))}
            </div>
          ) : hasReviews ? (
            <div>
              <h2 className="display-heading mb-8 text-2xl font-semibold text-cocoa sm:text-3xl">
                More client stories
              </h2>
              {remainingReviews.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {remainingReviews.map((review, i) => (
                    <motion.div
                      key={review.reviewId}
                      initial={reduced ? false : { opacity: 0, y: 22 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.45, delay: (i % 2) * 0.08, ease: 'easeOut' }}
                    >
                      <ReviewCard review={review} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-espresso/55">
                  All recent client reviews are featured above.
                </p>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-md py-16 text-center">
              <span className="text-2xl text-gold-dark" aria-hidden="true">◆</span>
              <h2 className="display-heading mt-6 text-3xl font-semibold text-cocoa">
                Client reviews are coming soon.
              </h2>
              <p className="mt-4 leading-8 text-espresso/70">
                Be the first to share your Grace Hair Beauty experience — scroll down
                to leave a review.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Leave a review CTA + form ──────────────────────────────────────── */}
      <section
        id="leave-a-review"
        className="section-pad relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1c0e08 0%, #2c1810 100%)',
          scrollMarginTop: 'calc(var(--header-height) + 24px)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 55% 55% at 0% 100%, rgba(212,168,67,0.10) 0%, transparent 70%)',
          }}
        />

        <div className="container-page relative z-10 grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start">

          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-gold-light">
              Your Experience
            </p>
            <h2
              className="display-heading mt-3 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.1]"
              style={{ color: '#D4A843' }}
            >
              Share your<br />
              <em className="font-light italic" style={{ color: '#D4A843' }}>
                Grace Hair Beauty
              </em>
              <br />
              experience
            </h2>
            <p className="mt-5 max-w-[260px] leading-8 text-cream/60">
              Your words help new clients feel confident before their first appointment.
            </p>
            {/* TODO: replace with the final Google review deep-link URL once available */}
            <a
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm font-semibold text-gold-light transition-colors hover:border-gold hover:text-gold"
              href={settings.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Leave a Google Review (opens in a new tab)"
            >
              Leave a Google Review
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div>
            <p className="mb-4 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-cream/40">
              Or, share your review here
            </p>
            <ReviewSubmitForm
              googleReviewUrl={settings.googleReviewUrl || undefined}
              onSuccess={() => setSubmitted(true)}
            />
          </div>
        </div>
      </section>
    </>
  )
}
