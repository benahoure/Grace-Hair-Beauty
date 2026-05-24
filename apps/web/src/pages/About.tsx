import { PageHero } from '../components/hero/PageHero'
import { PageMeta } from '../components/seo/PageMeta'

const values = [
  ['Expertise', '15+ years of professional training and real-world experience.'],
  ['Authenticity', 'African braiding rooted in tradition, culture, and pride.'],
  ['Care', 'We treat your hair like it matters, because it does.'],
]

export function About() {
  return (
    <>
      <PageMeta
        title="About Grace Hair Beauty | Meet the Founder Ariane Essay"
        description="Meet Ariane Essay, founder and certified beauty professional with over 15 years in African braiding, protective styles, and natural hair care."
        canonical="https://gracehairsbeauty.com/about"
      />
      <PageHero
        eyebrow="Meet the Founder"
        title="More Than a Salon."
        italicTitle="A Place That Sees You."
        description="Grace Hair Beauty was built on a simple belief: every person deserves to walk out of a salon feeling genuinely beautiful."
        image="/about-us/founder-ariane.webp"
        imageAlt="Ariane Essay, founder of Grace Hair Beauty in Indianapolis"
        imagePosition="center top"
      />

      <section
        id="meet-grace"
        className="section-pad bg-cream"
        style={{ scrollMarginTop: 'calc(var(--header-height) + 24px)' }}
      >
        <div className="container-page max-w-4xl">
          <div className="grid gap-5 leading-8 text-espresso md:text-lg">
            <p>
              With over 15 years of hands-on experience in African braiding and natural hair care,
              Ariane Essay has spent her career perfecting styles that honor culture, protect your hair,
              and turn heads.
            </p>
            <p>
              Braiding is not just a service. It is an art form rooted in generations of African
              tradition. Every style is approached with patience, precision, and respect for the hair
              underneath.
            </p>
            <p>
              We proudly serve Black women, African women, men, and children across Indianapolis. Our
              salon is a welcoming space for every texture, every length, and every style vision.
            </p>
          </div>
        </div>
      </section>
      <section className="section-pad bg-cream-deep">
        <div className="container-page grid gap-5 md:grid-cols-3">
          {values.map(([title, body]) => (
            <article key={title} className="rounded-card border border-cream-border bg-paper p-6">
              <h2 className="text-[1.0625rem] font-semibold text-cocoa">{title}</h2>
              <p className="mt-3 leading-7 text-espresso">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
