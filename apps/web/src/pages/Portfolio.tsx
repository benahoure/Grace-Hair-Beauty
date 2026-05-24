import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { PageHero } from '../components/hero/PageHero'
import { PageMeta } from '../components/seo/PageMeta'
import { FilterTabs } from '../components/ui/FilterTabs'
import { Lightbox } from '../components/ui/Lightbox'
import { PortfolioCard } from '../components/ui/PortfolioCard'
import { Skeleton } from '../components/ui/Skeleton'
import { api } from '../lib/api'
import type { PortfolioCategory, PortfolioItem } from '../types'

type PortfolioFilter = 'all' | PortfolioCategory

const filters: Array<{ value: PortfolioFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'knotless', label: 'Knotless Braids' },
  { value: 'box-braids', label: 'Box Braids' },
  { value: 'senegalese', label: 'Senegalese Twists' },
  { value: 'sew-in', label: 'Sew-In' },
  { value: 'natural', label: 'Natural' },
  { value: 'kids', label: 'Kids' },
  { value: 'men', label: 'Men' },
]

function normalizePortfolioFilter(value: string | null): PortfolioFilter {
  return filters.some((option) => option.value === value)
    ? (value as PortfolioFilter)
    : 'all'
}

export function Portfolio() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState<PortfolioFilter>('all')
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null)
  const portfolioQuery = useQuery({ queryKey: ['portfolio'], queryFn: () => api.getPortfolio() })
  const categoryParam = searchParams.get('category')

  useEffect(() => {
    setFilter(normalizePortfolioFilter(categoryParam))
    if (!categoryParam) return
    window.setTimeout(() => {
      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }, [categoryParam])

  const handleFilterChange = (value: PortfolioFilter) => {
    setFilter(value)
    if (value === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: value })
    }
  }

  const items = useMemo(() => {
    const values = portfolioQuery.data?.items ?? []
    return filter === 'all' ? values : values.filter((item) => item.category === filter)
  }, [filter, portfolioQuery.data?.items])

  return (
    <>
      <PageMeta
        title="Hair Gallery | Braids, Natural Styles & More"
        description="Browse client style categories including knotless braids, sew-in, natural hairstyles, kids styles, and men's styles."
        canonical="https://gracehairsbeauty.com/portfolio"
      />
      <PageHero
        eyebrow="Portfolio"
        title="Real Styles,"
        italicTitle="Real Care."
        description="Browse braids, protective styles, natural hair, men’s styles, and kids looks, then bring your favorite inspiration into the booking form."
        images={[
          { src: '/services/african-braids.webp', alt: 'Grace Hair Beauty portfolio style preview', position: 'center 22%' },
          { src: '/services/knotless-braids-wavy-ends.webp', alt: 'Waist-length knotless braids style preview', position: 'center 18%' },
          { src: '/services/boho-knotless-braids-blonde.webp', alt: 'Boho braids with soft curls portfolio preview', position: 'center 20%' },
          { src: '/services/boho-knotless-braids-golden.webp', alt: 'Protective braid style from the Grace Hair Beauty portfolio', position: 'center 18%' },
          { src: '/services/boho-knotless-braids-copper.webp', alt: 'Copper boho knotless braids portfolio preview', position: 'center 18%' },
          { src: '/services/jumbo-box-braids.webp', alt: 'Jumbo box braids portfolio preview', position: 'center 20%' },
        ]}
        secondaryAction={{ label: 'Explore Gallery', to: '#gallery', variant: 'gold' }}
      />

      <section id="gallery" className="section-pad" style={{ scrollMarginTop: 'calc(var(--header-height) + 24px)' }}>
        <div className="container-page">
          <div>
            <FilterTabs options={filters} value={filter} onChange={handleFilterChange} label="Filter portfolio" />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {portfolioQuery.isLoading && Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="aspect-[4/5]" />)}
            {items.map((item) => (
              <PortfolioCard key={item.styleId} item={item} onOpen={setActiveItem} />
            ))}
          </div>
          {!items.length && !portfolioQuery.isLoading && (
            <div className="mt-8 rounded-card border border-cream-border bg-paper p-8 text-center">
              No gallery items match this filter yet.
            </div>
          )}
        </div>
      </section>
      <Lightbox item={activeItem} onClose={() => setActiveItem(null)} />
    </>
  )
}
