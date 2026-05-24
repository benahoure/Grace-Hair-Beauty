import type { BusinessSettings, DayName } from '../types'

const days: DayName[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  if (local.length !== 10) return phone
  return `+1 (${local.slice(0, 3)})-${local.slice(3, 6)}-${local.slice(6)}`
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function formatAddress(settings: BusinessSettings): string {
  const { street, city, state, zip } = settings.address
  return `${street}, ${city}, ${state} ${zip}`
}

export function formatHours(settings: BusinessSettings): string {
  const canonical = days.every((day) => {
    const value = settings.hours[day]
    return value.open === '09:00' && value.close === '20:00' && !value.closed
  })
  return canonical ? 'Monday–Sunday, 9:00 AM–8:00 PM' : 'See current hours'
}

export function shortDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
