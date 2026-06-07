import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
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
    const futureDate = futureDateString()

    // Services — both test services must be present so selectedService resolves
    vi.spyOn(api, 'getServices').mockResolvedValue({
      services: [
        {
          serviceId: 'svc-knotless-braids',
          name: 'Knotless Braids',
          category: 'african-braids',
          description: 'Knotless braids',
          startingPrice: 18000,
          priceUnit: 'cents',
          durationMinutes: 300,
          imageUrl: '',
          featured: true,
          active: true,
        },
        {
          serviceId: 'svc-boho-waist',
          name: 'Boho Braid Waist Length',
          category: 'african-braids',
          description: 'Boho braids waist length',
          startingPrice: 25000,
          priceUnit: 'cents',
          durationMinutes: 360,
          imageUrl: '',
          featured: false,
          active: true,
        },
      ],
    })

    // Month availability — marks the future date as available so the day button is clickable
    vi.spyOn(api, 'getMonthAvailability').mockResolvedValue({
      month: futureDate.slice(0, 7),
      timezone: 'America/Indiana/Indianapolis',
      dates: [{ date: futureDate, status: 'available', availableSlots: 5 }],
    })

    // Date slots — returns one time slot after the date is selected
    vi.spyOn(api, 'getDateSlots').mockResolvedValue({
      date: futureDate,
      timezone: 'America/Indiana/Indianapolis',
      slots: [{ time: '10:00 AM', datetime: `${futureDate}T10:00:00-05:00`, available: true }],
    })

    // The form calls createPaymentIntent (createAppointment is a deprecated alias)
    const createPaymentIntent = vi.spyOn(api, 'createPaymentIntent').mockResolvedValue({
      appointmentId: 'appt-test',
      clientSecret: 'pi_test_secret_fake',
    })

    renderBookingForm(route)

    // Step 1: wait for service pre-selection, then continue
    await screen.findByText('Selected Service')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Step 2: contact info
    await user.type(screen.getByLabelText(/full name/i), 'Amara Test')
    await user.type(screen.getByLabelText(/email address/i), 'amara@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '3175550123')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Step 3: calendar date selection — click the available day button
    const futureDay = String(parseInt(futureDate.split('-')[2], 10))
    const dayButton = await screen.findByRole('button', { name: futureDay })
    await user.click(dayButton)

    // Time slot appears after date selection — click it
    const timeButton = await screen.findByRole('button', { name: /10:00/i })
    await user.click(timeButton)

    // Continue to payment step — triggers createPaymentIntent
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => expect(createPaymentIntent).toHaveBeenCalledTimes(1))

    return createPaymentIntent.mock.calls[0][0] as AppointmentRequest
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
