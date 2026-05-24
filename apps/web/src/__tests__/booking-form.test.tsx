import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BookingForm } from '../components/forms/BookingForm'
import { api } from '../lib/api'
import type { AppointmentRequest } from '../types'

function futureDateString() {
  const date = new Date()
  date.setDate(date.getDate() + 2)
  return date.toISOString().slice(0, 10)
}

function renderBookingForm(route = '/book') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <BookingForm />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BookingForm', () => {
  beforeEach(() => {
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function completeBookingRequest(route: string) {
    const user = userEvent.setup()
    const createAppointment = vi.spyOn(api, 'createAppointment').mockResolvedValue({
      appointmentId: 'appt-test',
      status: 'pending',
      message: 'Your appointment request has been received.',
    })

    renderBookingForm(route)

    await screen.findByText('Selected Service')

    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.type(screen.getByLabelText(/full name/i), 'Amara Test')
    await user.type(screen.getByLabelText(/email address/i), 'amara@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '3175550123')

    await user.click(screen.getByRole('button', { name: /continue/i }))
    fireEvent.change(screen.getByLabelText(/preferred date/i), {
      target: { value: futureDateString() },
    })
    fireEvent.change(screen.getByLabelText(/preferred time/i), {
      target: { value: '10:00' },
    })

    await user.click(screen.getByRole('button', { name: /confirm appointment request/i }))

    await waitFor(() => expect(createAppointment).toHaveBeenCalledTimes(1))

    return createAppointment.mock.calls[0][0] as AppointmentRequest
  }

  it('submits service and portfolio style context without removing the visible notes context', async () => {
    const payload = await completeBookingRequest('/book?service=svc-knotless-braids&style=style-boho-braids')

    expect(payload.serviceId).toBe('svc-knotless-braids')
    expect(payload.portfolioStyleId).toBe('style-boho-braids')
    expect(payload.notes).toContain('Portfolio inspiration: Boho Braids with Soft Curls')
  })

  it('selects the matching service when booking from a portfolio style only', async () => {
    const payload = await completeBookingRequest('/book?style=style-boho-braids')

    expect(payload.serviceId).toBe('svc-boho-waist')
    expect(payload.portfolioStyleId).toBe('style-boho-braids')
    expect(payload.notes).toContain('Portfolio inspiration: Boho Braids with Soft Curls')
  })
})
