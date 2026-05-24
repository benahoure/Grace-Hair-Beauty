import { z } from 'zod'

const phoneSchema = z
  .string()
  .min(7, 'Enter a valid phone number.')
  .max(20, 'Phone number is too long.')
  .regex(/^[+()\-\s\d.]+$/, 'Enter a valid phone number.')

const futureDate = z.string().refine((value) => {
  const selected = new Date(`${value}T00:00:00`)
  const tomorrow = new Date()
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const max = new Date()
  max.setHours(0, 0, 0, 0)
  max.setDate(max.getDate() + 90)
  return selected >= tomorrow && selected <= max
}, 'Choose a date within the next 90 days, starting tomorrow.')

export const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Choose a service.'),
  portfolioStyleId: z.string().trim().max(120).optional(),
  clientName: z.string().trim().min(2, 'Enter your name.').max(100),
  clientEmail: z.string().trim().email('Enter a valid email address.'),
  clientPhone: phoneSchema,
  preferredDate: futureDate,
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, 'Choose a preferred time.'),
  alternateDate: z.string().optional().or(z.literal('')),
  notes: z.string().max(500, 'Please keep notes under 500 characters.').optional(),
  referralSource: z
    .enum(['instagram', 'tiktok', 'google', 'yelp', 'friend', 'other', ''])
    .optional(),
  honeypot: z.string().max(0, 'Invalid submission.'),
})

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(100),
  // NOTE: backend /contact endpoint must be updated to accept missing email before removing frontend requirement
  email: z.string().trim().email('Enter a valid email address.').optional().or(z.literal('')),
  phone: phoneSchema,  // now required — was optional
  message: z.string().trim().min(10, 'Tell us how we can help.').max(1000),
  services: z.array(z.string().max(60)).max(20).default([]),
  honeypot: z.string().max(0, 'Invalid submission.'),
})

export const reviewSubmissionSchema = z.object({
  clientName: z.string().trim().min(1, 'Enter your name.').max(100),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(3, 'Write a short review — even a few words count.').max(1000),
  honeypot: z.string().max(0, 'Invalid submission.'),
})

export type BookingFormData = z.infer<typeof bookingSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type ReviewSubmissionData = z.infer<typeof reviewSubmissionSchema>
