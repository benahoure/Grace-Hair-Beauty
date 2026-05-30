export interface SubcategoryDef {
  value: string
  label: string
}

export interface ServiceCategoryDef {
  value: string
  label: string
  description: string
  subcategories: SubcategoryDef[]
  sortOrder: number
  showInFilters: boolean
}

export const SERVICE_CATEGORIES: ServiceCategoryDef[] = [
  {
    value: 'african-braids',
    label: 'Braids & Protective Styles',
    description: 'Knotless braids, box braids, boho braids, cornrows, twists, and specialty styles.',
    subcategories: [
      { value: 'knotless-braids',  label: 'Knotless Braids' },
      { value: 'box-braids',       label: 'Box Braids' },
      { value: 'boho-braids',      label: 'Boho Braids' },
      { value: 'specialty-braids', label: 'Specialty Braids' },
      { value: 'cornrows-feed-in', label: 'Cornrows & Feed-In' },
      { value: 'senegalese-twists', label: 'Senegalese Twists' },
      { value: 'passion-twists',   label: 'Passion Twists' },
      { value: 'spring-twists',    label: 'Spring Twists' },
    ],
    sortOrder: 1,
    showInFilters: true,
  },
  {
    value: 'natural',
    label: 'Natural Hair & Ponytails',
    description: 'Natural hair styles and ponytail services.',
    subcategories: [
      { value: 'natural-styling', label: 'Natural Styling' },
      { value: 'ponytails',       label: 'Ponytails' },
    ],
    sortOrder: 2,
    showInFilters: true,
  },
  {
    value: 'sew-in',
    label: 'Sew-In, Wigs & Crochet',
    description: 'Wig cornrows and sew-in installation services.',
    subcategories: [
      { value: 'cornrows-feed-in', label: 'Wig Cornrows' },
    ],
    sortOrder: 3,
    showInFilters: true,
  },
  {
    value: 'men',
    label: "Men's Styles",
    description: 'Cornrows, box braids, twists, and loc services for men.',
    subcategories: [
      { value: 'locs', label: 'Locs' },
    ],
    sortOrder: 4,
    showInFilters: true,
  },
  {
    value: 'kids',
    label: 'Kids & Toddlers',
    description: 'Gentle braids and styles for kids and toddlers.',
    subcategories: [
      { value: 'kids-braids',    label: 'Kids Braids' },
      { value: 'kids-twists',    label: 'Kids Twists' },
      { value: 'kids-crochet',   label: 'Kids Crochet' },
      { value: 'toddler-styles', label: 'Toddler Styles' },
    ],
    sortOrder: 5,
    showInFilters: true,
  },
]

// Flat set of all valid filter values (top-level category IDs + subcategory IDs).
// Used by Services page and mock API to validate ?category= param.
export const ALL_FILTER_VALUES: ReadonlySet<string> = new Set([
  'all',
  ...SERVICE_CATEGORIES.map((c) => c.value),
  ...SERVICE_CATEGORIES.flatMap((c) => c.subcategories.map((s) => s.value)),
])

// Look up a customer-facing label for any category or subcategory value.
export function getCategoryLabel(value: string): string {
  const top = SERVICE_CATEGORIES.find((c) => c.value === value)
  if (top) return top.label
  for (const cat of SERVICE_CATEGORIES) {
    const sub = cat.subcategories.find((s) => s.value === value)
    if (sub) return sub.label
  }
  return value
}
