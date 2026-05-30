import {
  defaultBusinessSettings,
  mockPortfolio,
  mockReviewAggregates,
  mockReviews,
  mockServices,
} from './mockData'
import { getAdminToken } from './auth'
import type {
  AdminAppointment,
  AdminContactMessage,
  AdminReview,
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

interface ApiErrorBody {
  error?: string | {
    code?: string
    message?: string
    fieldErrors?: Record<string, string>
  }
}

export class ApiRequestError extends Error {
  status: number
  code?: string
  fieldErrors?: Record<string, string>

  constructor(status: number, body: ApiErrorBody) {
    const error = body.error
    const message = typeof error === 'string'
      ? error
      : error?.message ?? `Request failed with ${status}`

    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    if (typeof error === 'object') {
      this.code = error.code
      this.fieldErrors = error.fieldErrors
    }
  }
}

function buildQuery(params: Record<string, string | boolean | number | undefined>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) q.set(k, String(v))
  }
  return q.size ? `?${q}` : ''
}

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
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    throw new ApiRequestError(response.status, body)
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

  // ── Admin routes ────────────────────────────────────────────────────────────

  if (path === '/admin/upload-url' && method === 'POST') {
    const key = `services/${crypto.randomUUID()}/mock.jpg`
    return { uploadUrl: 'https://mock-upload-url', key, publicUrl: `https://cdn.example.com/${key}` } as T
  }

  if (path.startsWith('/admin/appointments')) {
    if (method === 'PATCH') {
      return { appointmentId: 'mock', status: 'confirmed', serviceName: 'Mock Service' } as T
    }
    return { appointments: [], nextCursor: null } as T
  }

  if (path.startsWith('/admin/contact-messages')) {
    if (method === 'POST') return { messageId: 'mock', read: true, sent: true } as T
    if (method === 'PATCH') return { messageId: 'mock', read: true } as T
    return { messages: [], nextCursor: null } as T
  }

  if (path.startsWith('/admin/services')) {
    if (method === 'POST') return { ...mockServices[0], serviceId: crypto.randomUUID() } as T
    if (method === 'PATCH') return { ...mockServices[0] } as T
    if (method === 'DELETE') return { message: 'Service deactivated.' } as T
    return { services: mockServices, nextCursor: null } as T
  }

  if (path.startsWith('/admin/portfolio')) {
    if (method === 'POST') return { ...mockPortfolio[0], styleId: crypto.randomUUID() } as T
    if (method === 'PATCH') return { ...mockPortfolio[0] } as T
    if (method === 'DELETE') return { message: 'Portfolio item deleted.' } as T
    return { portfolio: mockPortfolio, nextCursor: null } as T
  }

  if (path.startsWith('/admin/reviews')) {
    if (method === 'PATCH') return { ...mockReviews[0], approved: true } as T
    if (method === 'DELETE') return { message: 'Review deleted.' } as T
    return { reviews: mockReviews.map((r) => ({ ...r, approved: true })), nextCursor: null } as T
  }

  if (path === '/admin/business-settings') {
    if (method === 'PATCH') return defaultBusinessSettings as T
    return defaultBusinessSettings as T
  }

  throw new Error(`Mock endpoint missing: ${method} ${path}`)
}

export const api = {
  // ── Public ──────────────────────────────────────────────────────────────────
  getBusinessSettings: () => request<BusinessSettings>('/business-settings', { cache: 'no-cache' }),

  getServices: (params: { category?: ServiceCategory; featured?: boolean } = {}) => {
    const search = new URLSearchParams()
    if (params.category) search.set('category', params.category)
    if (params.featured) search.set('featured', 'true')
    return request<{ services: SalonService[] }>(`/services${search.size ? `?${search}` : ''}`, { cache: 'no-cache' })
  },

  getPortfolio: (params: { category?: PortfolioCategory } = {}) => {
    const search = new URLSearchParams()
    if (params.category) search.set('category', params.category)
    return request<{ items: PortfolioItem[]; nextCursor: string | null }>(
      `/portfolio${search.size ? `?${search}` : ''}`,
      { cache: 'no-cache' },
    )
  },

  getReviews: () =>
    request<{ reviews: Review[]; aggregates: ReviewAggregates; nextCursor: string | null }>('/reviews', { cache: 'no-cache' }),

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

  // ── Admin — Appointments ────────────────────────────────────────────────────
  getAdminAppointments: (params: { status?: string; date?: string } = {}) =>
    request<{ appointments: AdminAppointment[]; nextCursor: string | null }>(
      `/admin/appointments${buildQuery(params)}`,
    ),

  updateAppointment: (
    id: string,
    body: { status: 'confirmed' | 'cancelled' | 'completed'; adminNote?: string | null },
  ) =>
    request<AdminAppointment>(`/admin/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // ── Admin — Services ────────────────────────────────────────────────────────
  getAdminServices: () =>
    request<{ services: SalonService[]; nextCursor: string | null }>('/admin/services'),

  updateService: (id: string, body: Partial<Pick<SalonService, 'active' | 'featured' | 'name' | 'startingPrice' | 'durationMinutes' | 'description' | 'category' | 'imageUrl'>> & { addImage?: string }) =>
    request<SalonService>(`/admin/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteService: (id: string) =>
    request<{ message: string }>(`/admin/services/${id}`, { method: 'DELETE' }),

  // ── Admin — Portfolio ───────────────────────────────────────────────────────
  getAdminPortfolio: () =>
    request<{ portfolio: PortfolioItem[]; nextCursor: string | null }>('/admin/portfolio'),

  updatePortfolio: (id: string, body: Partial<Pick<PortfolioItem, 'active' | 'featured' | 'title'>>) =>
    request<PortfolioItem>(`/admin/portfolio/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deletePortfolio: (id: string) =>
    request<{ message: string }>(`/admin/portfolio/${id}`, { method: 'DELETE' }),

  // ── Admin — Reviews ─────────────────────────────────────────────────────────
  getAdminReviews: () =>
    request<{ reviews: AdminReview[]; nextCursor: string | null }>('/admin/reviews'),

  updateReview: (id: string, body: { approved?: boolean; featured?: boolean }) =>
    request<AdminReview>(`/admin/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteReview: (id: string) =>
    request<{ message: string }>(`/admin/reviews/${id}`, { method: 'DELETE' }),

  // ── Admin — Contact Messages ─────────────────────────────────────────────────
  getAdminContactMessages: (params: { read?: boolean } = {}) =>
    request<{ messages: AdminContactMessage[]; nextCursor: string | null }>(
      `/admin/contact-messages${buildQuery(params)}`,
    ),

  markContactMessageRead: (id: string) =>
    request<AdminContactMessage>(`/admin/contact-messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    }),

  replyToContactMessage: (id: string, reply: string) =>
    request<AdminContactMessage & { sent: boolean }>(`/admin/contact-messages/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    }),

  // ── Admin — Business Settings ────────────────────────────────────────────────
  getAdminSettings: () =>
    request<BusinessSettings>('/admin/business-settings'),

  updateSettings: (body: Partial<BusinessSettings>) =>
    request<BusinessSettings>('/admin/business-settings', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // ── Admin — Asset Upload ─────────────────────────────────────────────────────
  getUploadUrl: (folder: 'services' | 'portfolio', filename: string, contentType: string) =>
    request<{ uploadUrl: string; key: string; publicUrl: string }>('/admin/upload-url', {
      method: 'POST',
      body: JSON.stringify({ folder, filename, contentType }),
    }),

  uploadToPresignedUrl: async (uploadUrl: string, file: File): Promise<void> => {
    let response: Response
    try {
      response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
    } catch (netErr) {
      console.error('[Upload] Network error:', netErr)
      throw new Error('Network error — check browser console for details.')
    }
    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error('[Upload] S3 error:', response.status, body)
      throw new Error(`Upload failed (${response.status}) — check browser console.`)
    }
  },

  createService: (body: Omit<SalonService, 'serviceId' | 'bookingCount' | 'priceUnit' | 'images' | 'imagePosition' | 'subcategory'>) =>
    request<SalonService>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  createPortfolioItem: (body: Omit<PortfolioItem, 'styleId' | 'createdAt'>) =>
    request<PortfolioItem>('/admin/portfolio', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}

export { useMockApi }
