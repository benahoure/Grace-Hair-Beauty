import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { PageHero } from '../components/hero/PageHero'
import { PageMeta } from '../components/seo/PageMeta'
import { FeaturedServicesCarousel } from '../components/ui/FeaturedServicesCarousel'
import { FilterTabs } from '../components/ui/FilterTabs'
import { ServiceCard } from '../components/ui/ServiceCard'
import { Skeleton } from '../components/ui/Skeleton'
import { api } from '../lib/api'
import { ALL_FILTER_VALUES, SERVICE_CATEGORIES } from '../lib/serviceCategories'
import type { ServiceCategory, ServiceSubcategory } from '../types'

type ServiceFilter = 'all' | ServiceCategory | ServiceSubcategory | string

// Build filter tab list from the shared category config
const filters: Array<{ value: ServiceFilter; label: string }> = [
  { value: 'all',               label: 'All' },
  { value: 'african-braids',    label: 'Braids & Protective Styles' },
  { value: 'knotless-braids',   label: 'Knotless Braids' },
  { value: 'box-braids',        label: 'Box Braids' },
  { value: 'cornrows-feed-in',  label: 'Cornrows & Feed-In' },
  { value: 'senegalese-twists', label: 'Senegalese & Twists' },
  { value: 'passion-twists',    label: 'Passion Twists' },
  { value: 'natural',           label: 'Natural Hair & Ponytails' },
  { value: 'sew-in',            label: 'Sew-In, Wigs & Crochet' },
  { value: 'men',               label: "Men's Styles" },
  { value: 'kids',              label: 'Kids & Toddlers' },
]

// Keep backward-compat aliases so old links/bookmarks still work
const ALIASES: Record<string, ServiceFilter> = {
  knotless:   'knotless-braids',
  senegalese: 'senegalese-twists',
  crochet:    'crochet-braids',
  boho:       'boho-braids',
  fulani:     'fulani-braids',
  specialty:  'specialty-braids',
  cornrows:   'cornrows-feed-in',
}

// Verify the value is a known filter tab or a valid category/subcategory from shared config
function normalizeServiceFilter(value: string | null): ServiceFilter {
  if (!value) return 'all'
  if (value in ALIASES) return ALIASES[value]
  if (ALL_FILTER_VALUES.has(value)) return value as ServiceFilter
  return 'all'
}

// Fallback inference for AWS records that may lack a subcategory field
function inferSubcategory(service: { subcategory?: string; serviceId: string; name: string }): string | null {
  if (service.subcategory) return service.subcategory
  const h = `${service.serviceId} ${service.name}`.toLowerCase()
  if (h.includes('knotless'))                            return 'knotless-braids'
  if (h.includes('box'))                                 return 'box-braids'
  if (h.includes('boho'))                                return 'boho-braids'
  if (h.includes('fulani'))                              return 'fulani-braids'
  if (h.includes('crochet'))                             return 'crochet-braids'
  if (h.includes('senegalese'))                          return 'senegalese-twists'
  if (h.includes('passion'))                             return 'passion-twists'
  if (h.includes('spring'))                              return 'spring-twists'
  if (h.includes('cornrow') || h.includes('feed-in'))    return 'cornrows-feed-in'
  if (h.includes('loc') || h.includes('dreadlock'))      return 'locs'
  if (h.includes('ponytail'))                            return 'ponytails'
  if (h.includes('toddler'))                             return 'toddler-styles'
  if (h.includes('miracle') || h.includes('french'))     return 'specialty-braids'
  return null
}

// Option B: ?category= matches service.category OR service.subcategory
function serviceMatchesFilter(
  service: { category: string; subcategory?: string; serviceId: string; name: string },
  filter: ServiceFilter,
): boolean {
  if (filter === 'all') return true
  if (service.category === filter) return true
  return (inferSubcategory(service) ?? '') === filter
}

// Suppress unused import warning — SERVICE_CATEGORIES is the source of truth
// used by the Header and MobileNav dropdowns; importing it here keeps the
// dependency graph explicit and ensures lint doesn't tree-shake it.
void SERVICE_CATEGORIES

const faqs = [
  ['How should I prepare for braids?', 'Please arrive with hair clean, detangled, and free of heavy product unless Grace has recommended otherwise.'],
  ['Do you work with kids?', 'Yes. Kids styles are offered with patience, comfort, and age-appropriate styling.'],
  ['Are prices final?', 'Prices are starting prices. Length, size, hair condition, and add-ons can affect the final quote.'],
  ['How long do appointments take?', 'Timing depends on the service, size, length, and hair density. The booking request helps Grace confirm the right window.'],
]

export function Services() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState<ServiceFilter>('all')
  const servicesQuery = useQuery({ queryKey: ['services'], queryFn: () => api.getServices() })
  const categoryParam = searchParams.get('category')

  useEffect(() => {
    setFilter(normalizeServiceFilter(categoryParam))
    if (!categoryParam) return
    window.setTimeout(() => {
      document.getElementById('all-services')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }, [categoryParam])

  const handleFilterChange = (value: ServiceFilter) => {
    setFilter(value)
    if (value === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: value })
    }
  }

  const services = useMemo(() => {
    const items = servicesQuery.data?.services ?? []
    return items.filter((service) => serviceMatchesFilter(service, filter))
  }, [filter, servicesQuery.data?.services])

  const serviceSchema = services.map((service) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Hair styling',
    provider: { '@type': 'HairSalon', name: 'Grace Hair Beauty' },
    name: service.name,
    description: service.description,
    areaServed: { '@type': 'City', name: 'Indianapolis' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: (service.startingPrice / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  }))

  return (
    <>
      <PageMeta
        title="Hair Braiding Services in Indianapolis | Grace Hair Beauty"
        description="African braids, knotless braids, box braids, cornrows, sew-in weaves, silk press, natural styles, and kids braids in Indianapolis, IN."
        canonical="https://gracehairsbeauty.com/services"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
      </Helmet>
      <PageHero
        eyebrow="Our Services"
        title="Expert Styles,"
        italicTitle="Crafted with Care."
        description="African braiding, protective styling, silk press, sew-ins, men's styles, and gentle kids services with clear starting prices."
        images={[
          { src: '/services/african-braids.webp', alt: 'African braids styled at Grace Hair Beauty', position: 'center 24%' },
          { src: '/services/knotless-braids-wavy-ends.webp', alt: 'Knotless braids with wavy ends styled at Grace Hair Beauty', position: 'center 18%' },
          { src: '/services/kids-cornrows-beads.webp', alt: 'Kids cornrows with beads styled at Grace Hair Beauty', position: 'center 20%' },
          { src: '/services/men-hairstyles.webp', alt: "Men's protective hairstyle at Grace Hair Beauty", position: 'center 18%' },
        ]}
        secondaryAction={{ label: 'View All Services', to: '#all-services', variant: 'gold' }}
        scrollCueTo="#all-services"
      />

      <section className="pb-14 pt-10 md:pb-20 md:pt-14">
        <div className="container-page">
          <FeaturedServicesCarousel
            services={[...(servicesQuery.data?.services ?? [])].sort(
              (a, b) => (b.bookingCount ?? 0) - (a.bookingCount ?? 0),
            )}
          />
        </div>
      </section>

      {/* Full service catalog */}
      <section id="all-services" className="section-pad pt-0" style={{ scrollMarginTop: 'calc(var(--header-height) + 24px)' }}>
        <div className="container-page">
          <div className="mt-8">
            <FilterTabs options={filters} value={filter} onChange={handleFilterChange} label="Filter services" />
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {servicesQuery.isLoading && Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-80" />)}
            {services.map((service) => (
              <ServiceCard key={service.serviceId} service={service} />
            ))}
          </div>
          {!services.length && !servicesQuery.isLoading && (
            <div className="mt-8 rounded-card border border-cream-border bg-paper p-8 text-center">
              No services match this filter yet.
            </div>
          )}
        </div>
      </section>
      <section className="section-pad bg-cream-deep">
        <div className="container-page grid gap-8 md:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="eyebrow">Before You Book</p>
            <h2 className="display-heading mt-3 text-3xl font-semibold md:text-5xl">A few helpful notes.</h2>
            <p className="mt-5 leading-8 text-espresso">
              A deposit may be required to hold your appointment. Grace will confirm your service, final
              timing, and any prep instructions after your request is received.
            </p>
            <Link className="btn btn-gold mt-7" to="/book">
              Book Your Appointment
            </Link>
          </div>
          <div className="grid gap-4">
            {faqs.map(([question, answer]) => (
              <details key={question} className="rounded-card border border-cream-border bg-paper p-5">
                <summary className="cursor-pointer font-semibold text-cocoa">{question}</summary>
                <p className="mt-3 leading-7 text-espresso">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
