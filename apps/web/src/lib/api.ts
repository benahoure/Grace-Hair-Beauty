import {
  defaultBusinessSettings,
  mockPortfolio,
  mockReviewAggregates,
  mockReviews,
  mockServices,
} from './mockData'
import { getAdminToken } from './auth'
import type {
  AppointmentRequest,
  BusinessSettings,
  ContactRequest,
  PortfolioCategory,
  PortfolioItem,
  Review,
  ReviewAggregates,
  ReviewSubmission,
  SalonService,
  ServiceCategory,
} from '../types'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
const useMockApi = !configuredBaseUrl

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (useMockApi) {
    return mockRequest<T>(path, init)
  }

  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (path.startsWith('/admin')) {
    const token = getAdminToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${configuredBaseUrl}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `Request failed with ${response.status}`)
  }

  return response.json() as Promise<T>
}

async function mockRequest<T>(path: string, init: RequestInit): Promise<T> {
  await new Promise((resolve) => window.setTimeout(resolve, 80))
  const method = init.method ?? 'GET'

  if (path.startsWith('/services')) {
    const url = new URL(path, window.location.origin)
    const category = url.searchParams.get('category') as ServiceCategory | null
    const featured = url.searchParams.get('featured')
    const services = mockServices.filter((service) => {
      if (!service.active) return false
      if (category && service.category !== category) return false
      if (featured === 'true' && !service.featured) return false
      return true
    })
    return { services } as T
  }

  if (path.startsWith('/portfolio')) {
    const url = new URL(path, window.location.origin)
    const category = url.searchParams.get('category') as PortfolioCategory | null
    const items = mockPortfolio.filter((item) => item.active && (!category || item.category === category))
    return { items, nextCursor: null } as T
  }

  if (path === '/reviews' && method === 'GET') {
    return { reviews: mockReviews, aggregates: mockReviewAggregates, nextCursor: null } as T
  }

  if (path === '/reviews' && method === 'POST') {
    return { reviewId: crypto.randomUUID(), status: 'pending' } as T
  }

  if (path === '/business-settings') {
    return defaultBusinessSettings as T
  }

  if (path === '/appointments' && method === 'POST') {
    return {
      appointmentId: crypto.randomUUID(),
      status: 'pending',
      message: 'Your appointment request has been received. We will confirm within 24 hours.',
    } as T
  }

  if (path === '/contact' && method === 'POST') {
    return {
      messageId: crypto.randomUUID(),
      message: "Thanks for reaching out. We'll respond within 1 business day.",
    } as T
  }

  if (path.startsWith('/admin/appointments')) {
    return { appointments: [], nextCursor: null } as T
  }

  if (path.startsWith('/admin/contact-messages')) {
    return { messages: [], nextCursor: null } as T
  }

  if (path.startsWith('/admin/services')) {
    return { services: mockServices } as T
  }

  if (path.startsWith('/admin/portfolio')) {
    return { items: mockPortfolio } as T
  }

  if (path.startsWith('/admin/reviews')) {
    return { reviews: mockReviews } as T
  }

  throw new Error(`Mock endpoint missing: ${method} ${path}`)
}

export const api = {
  getBusinessSettings: () => request<BusinessSettings>('/business-settings'),
  getServices: (params: { category?: ServiceCategory; featured?: boolean } = {}) => {
    const search = new URLSearchParams()
    if (params.category) search.set('category', params.category)
    if (params.featured) search.set('featured', 'true')
    return request<{ services: SalonService[] }>(`/services${search.size ? `?${search}` : ''}`)
  },
  getPortfolio: (params: { category?: PortfolioCategory } = {}) => {
    const search = new URLSearchParams()
    if (params.category) search.set('category', params.category)
    return request<{ items: PortfolioItem[]; nextCursor: string | null }>(
      `/portfolio${search.size ? `?${search}` : ''}`,
    )
  },
  getReviews: () =>
    request<{ reviews: Review[]; aggregates: ReviewAggregates; nextCursor: string | null }>('/reviews'),
  createAppointment: (body: AppointmentRequest) =>
    request<{ appointmentId: string; status: string; message: string }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  createContactMessage: (body: ContactRequest) =>
    request<{ messageId: string; message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  submitReview: (body: ReviewSubmission) =>
    request<{ reviewId: string; status: string }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getAdminAppointments: () => request<{ appointments: unknown[]; nextCursor: string | null }>('/admin/appointments'),
  getAdminContactMessages: () =>
    request<{ messages: unknown[]; nextCursor: string | null }>('/admin/contact-messages'),
}

export { useMockApi }
