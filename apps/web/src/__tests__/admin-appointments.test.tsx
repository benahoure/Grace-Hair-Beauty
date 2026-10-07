import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { api } from '../lib/api'
import { AdminAppointments } from '../pages/admin/AdminAppointments'
import type { AdminAppointment } from '../types'

function dateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function appointment(id: string, preferredDate: string, status: AdminAppointment['status'] = 'confirmed'): AdminAppointment {
  return {
    appointmentId: id,
    serviceId: 'svc-protective-styling',
    serviceName: 'Protective Styling',
    clientName: `Client ${id}`,
    clientEmail: 'client@example.com',
    clientPhone: '3175550123',
    preferredDate,
    preferredTime: '10:00',
    notes: '',
    status,
    depositStatus: 'paid',
    createdAt: `${preferredDate}T00:00:00Z`,
  } as AdminAppointment
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminAppointments />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  )
}

describe('AdminAppointments', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads the calendar one month at a time and never requests every appointment', async () => {
    const now = new Date()
    const monthStart = dateStr(new Date(now.getFullYear(), now.getMonth(), 1))
    const monthEnd = dateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0))
    const today = dateStr(now)
    const spy = vi.spyOn(api, 'getAdminAppointments').mockImplementation(async (params = {}) => ({
      appointments: params.from === monthStart ? [appointment('a1', today)] : [],
      nextCursor: null,
    }))

    renderPage()

    await waitFor(() => expect(spy).toHaveBeenCalledWith({ from: monthStart, to: monthEnd }))
    expect(await screen.findByText('Client a1')).toBeInTheDocument()
    for (const [params] of spy.mock.calls) {
      expect(params?.from && params?.to).toBeTruthy()
    }
  })

  it('pages through a status tab with Load more', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(api, 'getAdminAppointments').mockImplementation(async (params = {}) => {
      if (params.status !== 'completed') return { appointments: [], nextCursor: null }
      return params.cursor
        ? { appointments: [appointment('old', '2026-06-01', 'completed')], nextCursor: null }
        : { appointments: [appointment('new', '2026-09-01', 'completed')], nextCursor: 'page-2' }
    })

    renderPage()
    await user.click(screen.getByRole('button', { name: 'List' }))
    await user.click(screen.getByRole('button', { name: 'Completed' }))

    expect(await screen.findByText('Client new')).toBeInTheDocument()
    expect(spy).toHaveBeenCalledWith({ status: 'completed', limit: 25, order: 'desc', cursor: undefined })

    await user.click(screen.getByRole('button', { name: 'Load more' }))

    expect(await screen.findByText('Client old')).toBeInTheDocument()
    expect(screen.getByText('Client new')).toBeInTheDocument()
    expect(spy).toHaveBeenCalledWith({ status: 'completed', limit: 25, order: 'desc', cursor: 'page-2' })
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument())
  })
})
