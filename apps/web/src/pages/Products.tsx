import { Link } from 'react-router-dom'

import { PageHero } from '../components/hero/PageHero'
import { PageMeta } from '../components/seo/PageMeta'
import { ProductCard } from '../components/ui/ProductCard'
import type { SalonProduct } from '../components/ui/ProductCard'

const PRODUCTS: SalonProduct[] = [
  {
    id: 'hair-revitalization-therapy',
    name: 'Hair Revitalization Therapy',
    category: 'Hair Care Treatment',
    description:
      'A professional-grade treatment designed to restore deep moisture, strengthen strands from within, and revive stressed or overworked hair. Formulated for natural and chemically-treated hair types.',
    imageUrl: '/products/hair-revitalization-therapy-product.webp',
    imagePosition: 'center 20%',
    badge: 'Salon Exclusive',
    bookingLink: '/book?service=svc-revitalization',
    ctaLabel: 'Book Treatment',
  },
  {
    id: 'qvr-water-wave-human-hair',
    name: 'QVR Water Wave Human Hair',
    category: 'Hair Extensions',
    description:
      'Premium quality 100% human hair bundles with a natural water wave texture. Delivers beautiful movement, a lustrous finish, and seamless blending for sew-ins and protective styles.',
    imageUrl: '/products/qvr-water-wave-human-hair.webp',
    badge: 'Premium Quality',
    bookingLink: '/book?service=svc-sew-in',
    ctaLabel: 'Book Sew-In',
  },
]

const faqs = [
  [
    'Are these products available for purchase?',
    'Yes — both products are available in-salon. Ask your stylist during your appointment or contact us to reserve.',
  ],
  [
    'Can I use the Hair Revitalization Therapy at home?',
    'The treatment is primarily a salon service, but take-home maintenance kits may be available. Ask Grace during your visit.',
  ],
  [
    'What hair types work with the QVR Water Wave?',
    'The QVR Water Wave blends beautifully with 3A–4C natural textures and is ideal for sew-in and protective styles.',
  ],
  [
    'How do I know which product is right for me?',
    'Grace provides a brief hair consultation at every appointment. You can also reach out via the contact page before you book.',
  ],
]

export function Products() {
  return (
    <>
      <PageMeta
        title="Hair Products | Grace Hair Beauty"
        description="Premium hair care treatments and extensions used and sold at Grace Hair Beauty in Indianapolis. Salon-exclusive products for healthy, beautiful hair."
        canonical="https://gracehairsbeauty.com/products"
      />

      <PageHero
        eyebrow="Products"
        title="Curated for"
        italicTitle="Your Hair."
        description="Every product Grace uses and recommends is chosen with intention — for its quality, results, and suitability for the hair textures she works with every day."
        image="/products/hair-revitalization-therapy-product.webp"
        imageAlt="Hair Revitalization Therapy product used at Grace Hair Beauty"
        imagePosition="center"
      />

      <section className="section-pad">
        <div className="container-page">
          {/* Divider with trust note */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-cream-border" />
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-gold-dark">
              Salon-tested · Grace-approved
            </p>
            <div className="h-px flex-1 bg-cream-border" />
          </div>

          {/* Product grid */}
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:max-w-4xl">
            {PRODUCTS.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          {/* Empty state future-proofing — shown if list ever grows beyond 2 */}
        </div>
      </section>

      {/* Booking CTA strip */}
      <section
        className="relative overflow-hidden py-16"
        style={{ background: 'linear-gradient(135deg, #1c0e08 0%, #2c1810 60%, #3a2008 100%)' }}
      >
        {/* Gold glow */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-1/2"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 70% 80% at 100% 50%, rgba(212,168,67,0.14) 0%, transparent 70%)',
          }}
        />
        <div className="container-page relative z-10 text-center">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-gold-light">
            Experience the difference
          </p>
          <h2
            className="display-heading mt-3 text-[clamp(1.8rem,4vw,3rem)] font-semibold"
            style={{ color: '#FAF6F0' }}
          >
            Book Your Appointment
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7" style={{ color: 'rgba(250,246,240,0.75)' }}>
            Grace will walk you through the best products and treatments for your hair during
            your session. Every visit includes a personalized hair consultation.
          </p>
          <Link to="/book" className="btn btn-gold mt-8 inline-flex">
            Reserve Your Chair
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-cream-deep">
        <div className="container-page grid gap-8 md:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="eyebrow">Product FAQs</p>
            <h2 className="display-heading mt-3 text-3xl font-semibold md:text-5xl">Common questions.</h2>
            <p className="mt-5 leading-8 text-espresso">
              Have more questions about a specific product or treatment?{' '}
              <Link to="/contact" className="font-semibold text-gold-dark underline-offset-2 hover:underline">
                Send us a message
              </Link>{' '}
              and Grace will get back to you within 24 hours.
            </p>
          </div>
          <div className="grid gap-4">
            {faqs.map(([question, answer]) => (
              <details
                key={question}
                className="rounded-card border border-cream-border bg-paper p-5"
              >
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
