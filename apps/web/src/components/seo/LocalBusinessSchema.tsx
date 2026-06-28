import { Helmet } from 'react-helmet-async'

import type { BusinessSettings } from '../../types'

const DAY_NAMES: Record<keyof BusinessSettings['hours'], string> = {
  monday:    'Monday',
  tuesday:   'Tuesday',
  wednesday: 'Wednesday',
  thursday:  'Thursday',
  friday:    'Friday',
  saturday:  'Saturday',
  sunday:    'Sunday',
}

interface LocalBusinessSchemaProps {
  settings: BusinessSettings
}

export function LocalBusinessSchema({ settings }: LocalBusinessSchemaProps) {
  const openingHoursSpecification = (
    Object.entries(settings.hours) as [keyof BusinessSettings['hours'], { open: string; close: string; closed: boolean }][]
  )
    .filter(([, day]) => !day.closed)
    .map(([key, day]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DAY_NAMES[key],
      opens: day.open,
      closes: day.close,
    }))

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: settings.businessName,
    url: 'https://gracehairsbeauty.com',
    telephone: settings.phone,
    email: settings.email,
    image: 'https://gracehairsbeauty.com/brand/grace-hair-beauty-official-logo.png',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address.street,
      addressLocality: settings.address.city,
      addressRegion: settings.address.state,
      postalCode: settings.address.zip,
      addressCountry: 'US',
    },
    openingHoursSpecification,
    priceRange: '$$',
    currenciesAccepted: 'USD',
    description:
      'Grace Hair Beauty specializes in African braiding, knotless braids, protective styles, natural hairstyles, sew-in weaves, silk press, and kids styles.',
    sameAs: Object.values(settings.socialLinks).filter(Boolean),
    hasMap: settings.googleMapsUrl,
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  )
}
