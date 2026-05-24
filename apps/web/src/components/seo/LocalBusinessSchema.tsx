import { Helmet } from 'react-helmet-async'

import type { BusinessSettings } from '../../types'

interface LocalBusinessSchemaProps {
  settings: BusinessSettings
}

export function LocalBusinessSchema({ settings }: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: settings.businessName,
    url: 'https://gracehairsbeauty.com',
    telephone: settings.phone,
    email: settings.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address.street,
      addressLocality: settings.address.city,
      addressRegion: settings.address.state,
      postalCode: settings.address.zip,
      addressCountry: 'US',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: settings.hours.monday.open,
        closes: settings.hours.monday.close,
      },
    ],
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
