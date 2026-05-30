import { useQuery } from '@tanstack/react-query'
import { Clock3, Heart, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { HeroSection } from '../components/hero/HeroSection'
import { PageMeta } from '../components/seo/PageMeta'
import { Lightbox } from '../components/ui/Lightbox'
import { PortfolioCard } from '../components/ui/PortfolioCard'
import { ReviewCard } from '../components/ui/ReviewCard'
import { ServiceCard } from '../components/ui/ServiceCard'
import { Skeleton } from '../components/ui/Skeleton'
import { StarRating } from '../components/ui/StarRating'
import { api } from '../lib/api'
import type { PortfolioItem } from '../types'
import { useBusinessSettings } from '../hooks/useBusinessSettings'

const trustBandItems = [
  {
    title: 'Patient & Precise',
    description: 'Every style is done with care and attention to detail.',
    icon: Sparkles,
  },
  {
    title: 'Healthy Hair First',
    description: 'We use gentle techniques and premium products.',
    icon: Heart,
  },
  {
    title: 'Reliable & On Time',
    description: 'Appointments confirmed within 24 hours.',
    icon: Clock3,
  },
] as const

export function Home() {
  const [activePortfolioItem, setActivePortfolioItem] = useState<PortfolioItem | null>(null)
  const { data: settingsData } = useBusinessSettings()
  const founderImage = settingsData?.founderImageUrl || '/about-us/founder-ariane.webp'
  const servicesQuery = useQuery({
    queryKey: ['services', 'featured'],
    queryFn: () => api.getServices({ featured: true }),
  })
  const portfolioQuery = useQuery({
    queryKey: ['portfolio', 'featured'],
    queryFn: () => api.getPortfolio(),
  })
  const reviewsQuery = useQuery({
    queryKey: ['reviews'],
    queryFn: api.getReviews,
  })

  return (
    <>
      <PageMeta
        title="Grace Hair Beauty | African Braiding & Beauty Salon"
        description="Expert African braiding, knotless braids, protective styles, natural hair, sew-in, and silk press services in Indianapolis."
        canonical="https://gracehairsbeauty.com/"
      />
      <HeroSection />

      <section
        className="relative overflow-hidden border-y border-gold/10 py-7 md:py-10"
        style={{
          background:
            'linear-gradient(180deg, #f3eadf 0%, #fffdf9 26%, #faf6f0 62%, #f6eee4 100%)',
          boxShadow:
            'inset 0 18px 38px rgba(28,14,8,0.035), inset 0 -1px 0 rgba(255,255,255,0.68)',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 62% 80% at 50% 0%, rgba(212,168,67,0.085) 0%, rgba(212,168,67,0.028) 42%, transparent 74%), linear-gradient(90deg, transparent, rgba(107,66,38,0.026), transparent)',
          }}
        />
        <div className="container-page relative">
          <div className="mx-auto grid max-w-6xl gap-0 md:grid-cols-3">
            {trustBandItems.map((item, index) => {
              const Icon = item.icon

              return (
                <article
                  key={item.title}
                  className={`relative flex items-start gap-3.5 py-4 md:flex-col md:items-center md:px-12 md:py-2 md:text-center ${
                    index > 0
                      ? 'border-t border-gold/10 md:border-t-0 md:before:absolute md:before:left-0 md:before:top-1/2 md:before:h-20 md:before:w-px md:before:-translate-y-1/2 md:before:bg-gradient-to-b md:before:from-transparent md:before:via-gold/20 md:before:to-transparent'
                      : ''
                  }`}
                >
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border text-gold-dark md:h-14 md:w-14"
                    style={{
                      background:
                        'linear-gradient(145deg, rgba(255,253,249,0.88), rgba(240,224,176,0.20) 54%, rgba(242,234,224,0.56))',
                      borderColor: 'rgba(184,134,11,0.20)',
                      boxShadow:
                        '0 8px 18px rgba(107,66,38,0.055), inset 0 1px 0 rgba(255,255,255,0.74), inset 0 -1px 0 rgba(107,66,38,0.055)',
                    }}
                  >
                    <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[0.86rem] font-extrabold uppercase tracking-[0.085em] text-cocoa md:text-[0.94rem]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 max-w-[270px] text-sm leading-6 text-espresso/66 md:mx-auto md:mt-2">
                      {item.description}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-cream pb-14 pt-8 md:pb-24 md:pt-12">
        <div className="container-page">
          <div className="mb-9 max-w-3xl md:mb-11">
            <p className="eyebrow">What We Offer</p>
            <h2 className="display-heading mt-3 text-[clamp(2rem,8vw,2.85rem)] font-semibold leading-[1.06] md:text-5xl md:leading-[1.04]">
              <em className="font-light">Expert Styles,</em>
              <br />
              Crafted with Care.
            </h2>
            <p className="mt-5 max-w-2xl text-[0.98rem] leading-8 text-espresso/80 md:text-base">
              From classic box braids to intricate knotless styles, from kids&apos; first braids to men&apos;s
              looks, every service is delivered with precision, patience, and pride.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {servicesQuery.isLoading &&
              Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-80" />)}
            {servicesQuery.data?.services.slice(0, 6).map((service) => (
              <ServiceCard key={service.serviceId} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-cream-deep">
        <div className="container-page">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Our Work</p>
              <h2 className="display-heading mt-3 text-3xl font-semibold md:text-5xl">Real Styles, Real Care.</h2>
            </div>
            <Link className="btn btn-outline self-start" to="/portfolio">
              View Full Gallery
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {portfolioQuery.data?.items.slice(0, 6).map((item) => (
              <PortfolioCard key={item.styleId} item={item} onOpen={setActivePortfolioItem} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-10 md:grid-cols-[0.8fr_1fr] md:items-center">
          <div className="aspect-[4/5] overflow-hidden rounded-card">
            <img
              src={founderImage}
              alt="Ariane Essay, founder of Grace Hair Beauty in Indianapolis"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div>
            <p className="eyebrow">Meet the Founder</p>
            <h2 className="display-heading mt-3 text-3xl font-semibold md:text-5xl">Beauty care with culture and skill.</h2>
            <p className="mt-5 leading-8 text-espresso">
              Ariane Essay is a certified beauty professional with over 15 years of experience in African braiding,
              protective styling, and natural hair care. Grace Hair Beauty was built to be a space where
              every client feels welcomed, seen, and beautifully styled.
            </p>
            <Link className="btn btn-primary mt-7" to="/about">
              Read Our Story
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad bg-paper">
        <div className="container-page">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Client Reviews</p>
              <h2 className="display-heading mt-3 text-3xl font-semibold md:text-5xl">
                What Our <em className="font-light italic">Clients Say</em>
              </h2>
            </div>
            <div className="flex flex-col items-start gap-1 md:items-end">
              <StarRating rating={reviewsQuery.data?.aggregates.averageRating ?? 0} label="Approved client review rating" />
              {(reviewsQuery.data?.aggregates.totalCount ?? 0) > 0 && (
                <p className="text-sm font-semibold text-mocha">
                  {reviewsQuery.data?.aggregates.averageRating.toFixed(1)} · {reviewsQuery.data?.aggregates.totalCount} verified reviews
                </p>
              )}
            </div>
          </div>
          {reviewsQuery.data?.reviews.length ? (
            <div className="grid gap-6 md:grid-cols-3">
              {reviewsQuery.data.reviews.slice(0, 3).map((review) => (
                <ReviewCard key={review.reviewId} review={review} />
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-cream-border bg-cream p-8 text-center text-espresso">
              Approved client reviews will appear here as Grace begins collecting them through the site.
            </div>
          )}
        </div>
      </section>

      <section
        className="relative overflow-hidden py-20 text-cream"
        style={{ background: 'linear-gradient(135deg, #1c0e08 0%, #2c1810 65%, #3a2008 100%)' }}
      >
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-1/2"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 100% 50%, rgba(212,168,67,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="container-page relative z-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-gold-light">
                Ready for Your Appointment?
              </p>
              <h2
                className="display-heading mt-3 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.1]"
                style={{ color: '#FAF6F0' }}
              >
                Book your next style with<br />
                <em className="font-light italic">Grace Hair Beauty.</em>
              </h2>
              <p className="mt-4 text-sm leading-7 text-cream/60">
                We confirm all appointments within 24 hours.
              </p>
            </div>
            <Link className="btn btn-gold shrink-0" to="/book">
              Book Your Appointment
            </Link>
          </div>
        </div>
      </section>
      <Lightbox item={activePortfolioItem} onClose={() => setActivePortfolioItem(null)} />
    </>
  )
}
