export type ServiceCategory = 'african-braids' | 'natural' | 'sew-in' | 'men' | 'kids'

export type ServiceSubcategory =
  | 'knotless-braids'
  | 'box-braids'
  | 'boho-braids'
  | 'fulani-braids'
  | 'crochet-braids'
  | 'senegalese-twists'
  | 'specialty-braids'

export type PortfolioCategory =
  | 'knotless'
  | 'box-braids'
  | 'senegalese'
  | 'sew-in'
  | 'natural'
  | 'kids'
  | 'men'

export type DayName =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface BusinessHours {
  open: string
  close: string
  closed: boolean
}

export interface BusinessSettings {
  businessName: string
  phone: string
  email: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  hours: Record<DayName, BusinessHours>
  socialLinks: {
    instagram: string | null
    facebook: string | null
    tiktok: string | null
  }
  googleMapsUrl: string
  googleReviewUrl: string
  announcementBanner: string | null
  bookingNotice: string
}

export interface SalonService {
  serviceId: string
  name: string
  category: ServiceCategory
  subcategory?: ServiceSubcategory
  description: string
  startingPrice: number
  priceUnit: 'cents'
  durationMinutes: number
  imageUrl: string
  images?: string[]
  imagePosition?: string
  featured: boolean
  active: boolean
  bookingCount?: number
}

export interface PortfolioItem {
  styleId: string
  title: string
  category: PortfolioCategory
  imageUrl: string
  thumbnailUrl: string
  featured: boolean
  active: boolean
  createdAt: string
}

export interface Review {
  reviewId: string
  clientName: string
  rating: number
  body: string
  serviceName?: string
  avatarUrl?: string
  createdAt: string
  source: 'website' | 'google'
  status: 'approved' | 'pending' | 'rejected'
  featured: boolean
}

export interface ReviewAggregates {
  averageRating: number
  totalCount: number
}

export interface AppointmentRequest {
  serviceId: string
  portfolioStyleId?: string
  clientName: string
  clientEmail: string
  clientPhone: string
  preferredDate: string
  preferredTime: string
  alternateDate?: string
  notes?: string
  referralSource?: 'instagram' | 'tiktok' | 'google' | 'yelp' | 'friend' | 'other' | ''
  honeypot: string
}

export interface ContactRequest {
  name: string
  email?: string             // optional — backend /contact endpoint must also be updated to accept missing email
  phone: string              // now required
  message: string
  services: string[]
  inspirationPhotoName?: string  // filename only; backend handles as informational
  honeypot: string
}

export interface ReviewSubmission {
  clientName: string
  rating: number
  body: string
  honeypot: string
}

export interface AdminAppointment extends AppointmentRequest {
  appointmentId: string
  serviceName: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  adminNote?: string | null
  createdAt: string
}
