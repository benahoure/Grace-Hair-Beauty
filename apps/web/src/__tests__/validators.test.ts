import { describe, expect, it } from 'vitest'

import { bookingSchema, contactSchema, reviewSubmissionSchema } from '../lib/validators'

describe('client validation', () => {
  it('accepts a valid booking request', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 2)
    const value = bookingSchema.safeParse({
      serviceId: 'svc-knotless-braids',
      portfolioStyleId: 'style-boho-braids',
      clientName: 'Amara Test',
      clientEmail: 'amara@example.com',
      clientPhone: '3175550123',
      preferredDate: tomorrow.toISOString().slice(0, 10),
      preferredTime: '10:00',
      alternateDate: '',
      notes: '',
      referralSource: 'instagram',
      honeypot: '',
    })
    expect(value.success).toBe(true)
    expect(value.data).toMatchObject({
      serviceId: 'svc-knotless-braids',
      portfolioStyleId: 'style-boho-braids',
    })
  })

  it('rejects honeypot values on contact and review forms', () => {
    expect(
      contactSchema.safeParse({
        name: 'Jordan',
        email: 'jordan@example.com',
        phone: '',
        message: 'I have a question about protective styles.',
        honeypot: 'bot text',
      }).success,
    ).toBe(false)
    expect(
      reviewSubmissionSchema.safeParse({
        clientName: 'Jordan T.',
        rating: 5,
        body: 'Grace took great care of my hair.',
        honeypot: 'bot text',
      }).success,
    ).toBe(false)
  })
})
