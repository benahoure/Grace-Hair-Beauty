import { useMutation, useQuery } from '@tanstack/react-query'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { z } from 'zod'

import { ApiRequestError, api } from '../../lib/api'
import { formatDuration, formatPrice } from '../../lib/format'
import { mockPortfolio } from '../../lib/mockData'
import { bookingSchema } from '../../lib/validators'
import type { AppointmentRequest, AvailabilityDate, AvailabilitySlot, ServiceCategory } from '../../types'

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string)
  : null

const POLICY_CHECKBOX_TEXT =
  'I understand and agree that a $30 deposit is required to secure my appointment. The deposit will be applied toward my final service balance. I understand that I may reschedule online more than 24 hours before my appointment and my deposit will transfer to the new date. I understand that cancellations or rescheduling requests made less than 24 hours before the appointment may result in forfeiture of my deposit. I have read and agree to the Booking, Cancellation, Rescheduling, and Refund Policy.'

interface StripePaymentFormProps {
  appointmentId: string
  policyAccepted: boolean
  onPolicyChange: (v: boolean) => void
  onSuccess: (paymentIntentId: string) => void
  isConfirming: boolean
  isMock: boolean
}

function StripePaymentForm({ appointmentId, policyAccepted, onPolicyChange, onSuccess, isConfirming, isMock }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)

  const handlePay = async () => {
    if (!policyAccepted) return
    if (isMock) { onSuccess('pi_mock'); return }
    if (!stripe || !elements) return
    setPaying(true)
    setStripeError(null)
    // Persist appointmentId so the /booking/success redirect page can call confirm
    sessionStorage.setItem('ghb_pending_appt', appointmentId)
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/success`,
      },
      redirect: 'if_required',
    })
    setPaying(false)
    if (error) {
      setStripeError(error.message ?? 'Payment failed. Please try again.')
      return
    }
    if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    }
  }

  return (
    <div className="space-y-5">
      {/* Policy checkbox */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-cream-border bg-cream p-4">
        <input
          type="checkbox"
          checked={policyAccepted}
          onChange={(e) => onPolicyChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#D4A843]"
        />
        <span className="text-[0.72rem] leading-relaxed text-mocha">
          {POLICY_CHECKBOX_TEXT}
        </span>
      </label>

      {/* Stripe payment input (hidden in mock mode) */}
      {!isMock && (
        <div className="rounded-xl border border-cream-border bg-cream p-4">
          <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha">
            Payment Method
          </p>
          <p className="mb-3 text-[0.65rem] leading-relaxed text-mocha/55">
            Pay your $30 deposit using a debit card, credit card, Apple Pay, Google Pay, Cash App Pay, or Klarna. Available options vary by device, location, and eligibility.
          </p>
          <PaymentElement />
        </div>
      )}

      {isMock && (
        <div className="rounded-xl border border-dashed border-gold-dark/40 bg-gold/5 p-4 text-center">
          <p className="text-xs text-mocha/60">
            <span className="font-semibold text-mocha">Dev mode</span> — Stripe not configured. Payment will be simulated.
          </p>
        </div>
      )}

      {stripeError && (
        <p className="rounded-lg border border-error/30 bg-error/8 p-3 text-sm text-error">{stripeError}</p>
      )}

      <button
        type="button"
        className="btn btn-gold w-full"
        disabled={!policyAccepted || paying || isConfirming || (!isMock && (!stripe || !elements))}
        onClick={handlePay}
      >
        {paying ? 'Processing…' : isConfirming ? 'Confirming…' : 'Pay $30 Deposit to Book'}
      </button>

      <p className="text-center text-[0.65rem] text-mocha/50">
        Powered by Stripe · Your card is never stored on this site
      </p>
    </div>
  )
}

// ── Availability Calendar ──────────────────────────────────────────────────────

const CAL_DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function calDayClass(status: AvailabilityDate['status'] | 'loading' | 'selected'): string {
  const base = 'relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors '
  switch (status) {
    case 'selected':     return base + 'bg-gold text-espresso font-bold cursor-pointer shadow-sm'
    case 'available':    return base + 'text-espresso hover:bg-gold/20 cursor-pointer'
    case 'fully_booked': return base + 'text-mocha/30 cursor-not-allowed'
    case 'blocked_24hr': return base + 'text-amber-700/50 cursor-not-allowed'
    case 'blocked':      return base + 'text-mocha/20 cursor-not-allowed'
    case 'closed':       return base + 'text-mocha/20 cursor-default'
    case 'past':         return base + 'text-mocha/15 cursor-default'
    case 'loading':      return base + 'text-mocha/25 cursor-default'
    default:             return base + 'text-mocha/20 cursor-default'
  }
}

function AvailabilityCalendar({
  year,
  month,
  selectedDate,
  onDateSelect,
  dates,
  isLoading,
  onMonthChange,
}: {
  year: number
  month: number
  selectedDate: string
  onDateSelect: (date: string) => void
  dates: AvailabilityDate[] | undefined
  isLoading: boolean
  onMonthChange: (dir: -1 | 1) => void
}) {
  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const offset = (firstDay.getDay() + 6) % 7
  const monthLabel = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const nowYear = today.getFullYear()
  const nowMonth = today.getMonth() + 1
  const canGoPrev = year > nowYear || (year === nowYear && month > nowMonth)
  let maxYear = nowYear
  let maxMonth = nowMonth + 2
  if (maxMonth > 12) { maxMonth -= 12; maxYear++ }
  const canGoNext = year < maxYear || (year === maxYear && month < maxMonth)

  // Build lookup: date → AvailabilityDate
  const byDate = useMemo(() => {
    const map: Record<string, AvailabilityDate> = {}
    for (const d of (dates ?? [])) map[d.date] = d
    return map
  }, [dates])

  const hasAvailableInMonth = (dates ?? []).some((d) => d.status === 'available')

  const cells: (number | null)[] = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="rounded-xl border border-cream-border bg-paper p-4">
      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button type="button" disabled={!canGoPrev} onClick={() => onMonthChange(-1)}
          className="rounded-lg p-1.5 text-mocha/50 transition-colors hover:text-cocoa disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous month">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <p className="text-sm font-semibold text-espresso">{monthLabel}</p>
        <button type="button" disabled={!canGoNext} onClick={() => onMonthChange(1)}
          className="rounded-lg p-1.5 text-mocha/50 transition-colors hover:text-cocoa disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next month">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7">
        {CAL_DAY_HEADERS.map((d) => (
          <div key={d} className="py-1 text-center text-[0.6rem] font-bold uppercase tracking-wider text-mocha/40">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isSelected = dateStr === selectedDate
          const info = byDate[dateStr]
          const status = dateStr <= todayStr ? 'past' : isLoading ? 'loading' : (info?.status ?? 'loading')
          const cellStatus = isSelected ? 'selected' : status
          const isClickable = status === 'available' || isSelected

          return (
            <button key={dateStr} type="button"
              disabled={!isClickable}
              onClick={() => isClickable ? onDateSelect(dateStr) : undefined}
              className={calDayClass(cellStatus)}
              title={status === 'fully_booked' ? 'Fully booked' : status === 'blocked_24hr' ? 'Call salon — within 24 hrs' : status === 'blocked' ? 'Unavailable' : status === 'closed' ? 'Closed' : undefined}
            >
              {day}
              {status === 'available' && !isSelected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold-dark/60" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 px-1">
        <span className="flex items-center gap-1.5 text-[0.6rem] text-mocha/50">
          <span className="h-2 w-2 rounded-full bg-gold/70" aria-hidden="true" />Available
        </span>
        <span className="flex items-center gap-1.5 text-[0.6rem] text-mocha/50">
          <span className="h-2 w-2 rounded-full bg-mocha/20" aria-hidden="true" />Fully booked
        </span>
        <span className="flex items-center gap-1.5 text-[0.6rem] text-mocha/50">
          <span className="h-2 w-2 rounded-full bg-cream-border" aria-hidden="true" />Closed
        </span>
      </div>

      {isLoading && (
        <p className="mt-2 text-center text-[0.65rem] text-mocha/40">Loading availability…</p>
      )}

      {!isLoading && dates && !hasAvailableInMonth && (
        <div className="mt-3 rounded-lg border border-gold/20 bg-gold-pale/10 p-3 text-center">
          <p className="text-xs text-mocha/70">No available dates this month.</p>
          {canGoNext && (
            <button type="button" onClick={() => onMonthChange(1)}
              className="mt-1 text-xs font-semibold text-gold-dark underline-offset-2 hover:underline">
              Check next month →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Time Slot Picker ───────────────────────────────────────────────────────────

function rawTimeFromSlot(slot: AvailabilitySlot): string {
  // "2026-06-04T10:00:00-05:00" → "10:00"
  const parts = slot.datetime.split('T')[1]?.split(':') ?? []
  return `${parts[0] ?? '00'}:${parts[1] ?? '00'}`
}

function TimeSlotPicker({
  slots,
  selectedRawTime,
  onSelect,
  isLoading,
}: {
  slots: AvailabilitySlot[] | undefined
  selectedRawTime: string
  onSelect: (rawTime: string) => void
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-10 animate-pulse rounded-lg bg-cream-deep" />
        ))}
      </div>
    )
  }
  if (!slots || slots.length === 0) {
    return (
      <p className="rounded-xl border border-cream-border bg-cream-deep/30 p-4 text-center text-sm text-mocha/60">
        No available times for this date. Please choose a different day.
      </p>
    )
  }
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const raw = rawTimeFromSlot(slot)
        const isSelected = raw === selectedRawTime
        return (
          <button
            key={slot.datetime}
            type="button"
            onClick={() => onSelect(raw)}
            className={`flex items-center justify-center rounded-lg border px-2 py-2.5 text-xs font-semibold transition-all ${
              isSelected
                ? 'border-gold bg-gold text-espresso shadow-sm'
                : 'border-cream-border bg-paper text-espresso hover:border-gold/60 hover:bg-gold-pale/20'
            }`}
          >
            {slot.time}
          </button>
        )
      })}
    </div>
  )
}

// ── Main Form ─────────────────────────────────────────────────────────────────

type BookingErrors = Partial<Record<keyof AppointmentRequest, string>>

const STEPS = ['Service', 'Your Info', 'Choose Date & Time', 'Secure Deposit']

interface BookingCategoryDef {
  id: string
  name: string
  tagline: string
  serviceCategories: ServiceCategory[]
  examples: string[]
}

const BOOKING_CATEGORIES: BookingCategoryDef[] = [
  {
    id: 'braids',
    name: 'Braids & Protective Styles',
    tagline: 'Knotless braids, box braids, boho, cornrows, twists, and more.',
    serviceCategories: ['african-braids'],
    examples: ['Knotless Braids', 'Box Braids', 'Boho Knotless', 'Cornrows & Feed-In'],
  },
  {
    id: 'natural',
    name: 'Natural Hair & Ponytails',
    tagline: 'Natural styles, twists, and ponytail services.',
    serviceCategories: ['natural'],
    examples: ['Two-Strand Twists', 'Senegalese Twists', 'Passion Twists', 'Ponytail'],
  },
  {
    id: 'sew-in',
    name: 'Sew-In, Wigs & Crochet',
    tagline: 'Wig cornrows and sew-in foundation styles.',
    serviceCategories: ['sew-in'],
    examples: ['Wig Cornrows'],
  },
  {
    id: 'other',
    name: 'Men & Kids',
    tagline: 'Tailored styles for men, kids, and toddlers.',
    serviceCategories: ['men', 'kids'],
    examples: ['Men Cornrows', 'Men Loc Retwist', 'Youth Box Braids', 'Toddler Styles'],
  },
]

const referralOptions = [
  { value: '', label: 'How did you hear about us?' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'google', label: 'Google' },
  { value: 'yelp', label: 'Yelp' },
  { value: 'friend', label: 'Friend or family' },
  { value: 'other', label: 'Other' },
]

const PORTFOLIO_STYLE_SERVICE_MAP: Record<string, string> = {
  'style-knotless-waist':          'svc-knotless-braids',
  'style-boho-braids':             'svc-boho-waist',
  'style-boho-golden':             'svc-boho-waist',
  'style-boho-copper':             'svc-boho-waist',
  'style-african-braids':          'svc-box-braids',
  'style-fulani-braids':           'svc-knotless-braids',
  'style-miracle-knot':            'svc-miracle-knot',
  'style-crochet':                 'svc-kids-crochet-cornrows',
  'style-jumbo-box-braids':        'svc-box-braids',
  'style-box-braids':              'svc-box-braids',
  'style-box-braids-styled':       'svc-box-braids-styled',
  'style-senegalese-twist':        'svc-senegalese-twist',
  'style-senegalese-twist-colors': 'svc-senegalese-twist-colors',
  'style-sew-in-layered':          'svc-wig-cornrows',
  'style-natural-hairstyle':       'svc-natural-hairstyle',
  'style-cornrows-bun':            'svc-feed-in-cornrows',
  'style-kids-beads':              'svc-kids-hairstyles',
  'style-kids-twists-bow':         'svc-kids-hairstyles',
  'style-kids-star-beads':         'svc-kids-hairstyles',
  'style-kids-color-beads':        'svc-kids-hairstyles',
  'style-kids-flower-beads':       'svc-kids-hairstyles',
  'style-men-hairstyles':          'svc-men-hairstyles',
  'style-men-hairstyle-2':         'svc-men-hairstyles',
  'style-men-hairstyle-3':         'svc-men-hairstyles',
  'style-men-dreadlocks':          'svc-men-dreadlocks',
}

function serviceIdForPortfolioStyle(styleId: string): string {
  return PORTFOLIO_STYLE_SERVICE_MAP[styleId] ?? ''
}

function flattenErrors(error: z.ZodError<AppointmentRequest>): BookingErrors {
  return error.errors.reduce<BookingErrors>((acc, issue) => {
    const field = issue.path[0] as keyof AppointmentRequest
    acc[field] = issue.message
    return acc
  }, {})
}

function formatPhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function formatBookingDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatBookingTime(timeStr: string): string {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function scrollTo(el: HTMLElement | null, block: ScrollLogicalPosition = 'start') {
  el?.scrollIntoView({ behavior: 'smooth', block })
}

function todayLocal(): { year: number; month: number } {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export function BookingForm() {
  const [searchParams] = useSearchParams()
  const requestedService = searchParams.get('service') ?? ''
  const requestedStyle = searchParams.get('style') ?? ''
  const requestedStyleTitle = useMemo(
    () => mockPortfolio.find((item) => item.styleId === requestedStyle)?.title ?? '',
    [requestedStyle],
  )
  const requestedStyleServiceId = useMemo(
    () => serviceIdForPortfolioStyle(requestedStyle),
    [requestedStyle],
  )
  const initialServiceId = requestedService || requestedStyleServiceId
  const [step, setStep] = useState(1)
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [stripePaymentHold, setStripePaymentHold] = useState<{ appointmentId: string; clientSecret: string } | null>(null)
  const [portalUrl, setPortalUrl] = useState<string | null>(null)
  const isMock = !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  const [selectedCategory, setSelectedCategory] = useState('')
  const [errors, setErrors] = useState<BookingErrors>({})
  const [calendarMonth, setCalendarMonth] = useState<{ year: number; month: number }>(todayLocal)
  const errorRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const serviceListRef = useRef<HTMLDivElement>(null)
  const continueAreaRef = useRef<HTMLDivElement>(null)
  const clientNameRef = useRef<HTMLInputElement>(null)
  const hasMounted = useRef(false)
  const confirmRef = useRef<HTMLElement>(null)

  const [formData, setFormData] = useState<AppointmentRequest>({
    serviceId: initialServiceId,
    portfolioStyleId: requestedStyle || undefined,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    preferredDate: '',
    preferredTime: '',
    notes: requestedStyleTitle
      ? `Portfolio inspiration: ${requestedStyleTitle}`
      : requestedStyle
        ? `Portfolio inspiration: ${requestedStyle}`
        : '',
    referralSource: '',
    honeypot: '',
  })

  useEffect(() => {
    const nextServiceId = requestedService || requestedStyleServiceId
    if (!nextServiceId) return
    setFormData((cur) =>
      cur.serviceId === nextServiceId ? cur : { ...cur, serviceId: nextServiceId },
    )
  }, [requestedService, requestedStyleServiceId])

  useEffect(() => {
    const styleNote = requestedStyleTitle
      ? `Portfolio inspiration: ${requestedStyleTitle}`
      : requestedStyle
        ? `Portfolio inspiration: ${requestedStyle}`
        : ''
    setFormData((cur) => {
      if (!requestedStyle) {
        return cur.portfolioStyleId ? { ...cur, portfolioStyleId: undefined } : cur
      }
      if (cur.notes?.includes(styleNote)) return { ...cur, portfolioStyleId: requestedStyle }
      return {
        ...cur,
        portfolioStyleId: requestedStyle,
        notes: cur.notes ? `${styleNote}\n${cur.notes}` : styleNote,
      }
    })
  }, [requestedStyle, requestedStyleTitle])

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: () => api.getServices(),
  })

  // Month availability: re-fetch when serviceId or month changes
  const monthKey = `${calendarMonth.year}-${String(calendarMonth.month).padStart(2, '0')}`
  const monthAvailabilityQuery = useQuery({
    queryKey: ['avail-month', monthKey, formData.serviceId],
    queryFn: () => api.getMonthAvailability({ month: monthKey, serviceId: formData.serviceId || undefined }),
    enabled: step >= 3,
    staleTime: 60_000,
  })

  // Date slots: re-fetch when serviceId or date changes
  const dateSlotsQuery = useQuery({
    queryKey: ['avail-slots', formData.preferredDate, formData.serviceId],
    queryFn: () => api.getDateSlots({ date: formData.preferredDate, serviceId: formData.serviceId || undefined }),
    enabled: step >= 3 && Boolean(formData.preferredDate),
    staleTime: 30_000,
  })

  useEffect(() => {
    const contextServiceId = formData.serviceId || requestedService || requestedStyleServiceId
    if (!contextServiceId || !servicesQuery.data || selectedCategory) return
    const svc = servicesQuery.data.services.find((s) => s.serviceId === contextServiceId)
    if (!svc) return
    const cat = BOOKING_CATEGORIES.find((c) => c.serviceCategories.includes(svc.category))
    if (cat) setSelectedCategory(cat.id)
  }, [formData.serviceId, requestedService, requestedStyleServiceId, servicesQuery.data, selectedCategory])

  // Clear date/time when service changes — different services have different durations and slot availability
  const prevServiceIdRef = useRef(formData.serviceId)
  useEffect(() => {
    if (prevServiceIdRef.current === formData.serviceId) return
    prevServiceIdRef.current = formData.serviceId
    if (formData.preferredDate || formData.preferredTime) {
      setFormData((cur) => ({ ...cur, preferredDate: '', preferredTime: '' }))
    }
  }, [formData.serviceId, formData.preferredDate, formData.preferredTime])

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    scrollTo(formRef.current, 'start')
    const t = window.setTimeout(() => {
      if (step === 2) clientNameRef.current?.focus()
    }, 420)
    return () => window.clearTimeout(t)
  }, [step])

  const selectedService = useMemo(
    () => servicesQuery.data?.services.find((s) => s.serviceId === formData.serviceId),
    [formData.serviceId, servicesQuery.data?.services],
  )

  const categoryServices = useMemo(() => {
    if (!selectedCategory || !servicesQuery.data) return []
    const cat = BOOKING_CATEGORIES.find((c) => c.id === selectedCategory)
    if (!cat) return []
    return servicesQuery.data.services.filter(
      (s) => s.active && cat.serviceCategories.includes(s.category),
    )
  }, [selectedCategory, servicesQuery.data])

  const categoryMinPrices = useMemo(() => {
    if (!servicesQuery.data) return {} as Record<string, number>
    return BOOKING_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
      const svcs = servicesQuery.data.services.filter(
        (s) => s.active && cat.serviceCategories.includes(s.category),
      )
      if (svcs.length) acc[cat.id] = Math.min(...svcs.map((s) => s.startingPrice))
      return acc
    }, {})
  }, [servicesQuery.data])

  const paymentIntentMutation = useMutation({
    mutationFn: (data: AppointmentRequest) =>
      api.createPaymentIntent({ ...data, policyAccepted: true }),
    onSuccess: (data) => {
      setStripePaymentHold(data)
      setStep(4)
    },
    onError: (error) => {
      if (error instanceof ApiRequestError && error.fieldErrors) {
        setErrors(error.fieldErrors as BookingErrors)
        window.setTimeout(() => errorRef.current?.focus(), 0)
      }
    },
  })

  const confirmMutation = useMutation({
    mutationFn: ({ appointmentId, intentId }: { appointmentId: string; intentId: string }) =>
      api.confirmAppointment(appointmentId, intentId),
    onSuccess: (data) => {
      if (data.portalUrl) setPortalUrl(data.portalUrl)
    },
  })

  useEffect(() => {
    if (!confirmMutation.isSuccess) return
    window.setTimeout(() => scrollTo(confirmRef.current, 'start'), 60)
  }, [confirmMutation.isSuccess])

  const update = (field: keyof AppointmentRequest, value: string) => {
    setFormData((cur) => ({ ...cur, [field]: value }))
    setErrors((cur) => {
      const next = { ...cur }
      delete next[field]
      return next
    })
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    if (formData.serviceId && servicesQuery.data) {
      const svc = servicesQuery.data.services.find((s) => s.serviceId === formData.serviceId)
      const newCat = BOOKING_CATEGORIES.find((c) => c.id === categoryId)
      if (svc && newCat && !newCat.serviceCategories.includes(svc.category)) {
        update('serviceId', '')
      }
    }
    window.setTimeout(() => scrollTo(serviceListRef.current, 'start'), 60)
  }

  const handleServiceSelect = (serviceId: string) => {
    update('serviceId', serviceId)
    window.setTimeout(() => scrollTo(continueAreaRef.current, 'nearest'), 60)
  }

  const handleMonthChange = (dir: -1 | 1) => {
    setCalendarMonth((prev) => {
      let { year, month } = prev
      month += dir
      if (month > 12) { month = 1; year++ }
      if (month < 1) { month = 12; year-- }
      return { year, month }
    })
    update('preferredDate', '')
    update('preferredTime', '')
  }

  const hasErrors = Object.keys(errors).length > 0

  const validateFields = (fields: Array<keyof AppointmentRequest>) => {
    const result = bookingSchema.safeParse(formData)
    if (result.success) {
      setErrors({})
      return true
    }
    const all = flattenErrors(result.error)
    const stepErrors = Object.fromEntries(
      Object.entries(all).filter(([f]) => fields.includes(f as keyof AppointmentRequest)),
    ) as BookingErrors
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length > 0) {
      window.setTimeout(() => errorRef.current?.focus(), 0)
      return false
    }
    return true
  }

  const next = () => {
    if (step === 1 && validateFields(['serviceId'])) {
      setStep(2)
    } else if (step === 2 && validateFields(['clientName', 'clientEmail', 'clientPhone'])) {
      setStep(3)
    } else if (step === 3) {
      const result = bookingSchema.safeParse(formData)
      if (!result.success) {
        setErrors(flattenErrors(result.error))
        window.setTimeout(() => errorRef.current?.focus(), 0)
        return
      }
      paymentIntentMutation.mutate(result.data)
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  // ── Confirmation Screen ───────────────────────────────────────────────────

  if (confirmMutation.isSuccess) {
    const summaryRows = [
      { label: 'Name', value: formData.clientName },
      { label: 'Service', value: selectedService?.name },
      { label: 'Date', value: formatBookingDate(formData.preferredDate) },
      { label: 'Time', value: formatBookingTime(formData.preferredTime) },
      { label: 'Deposit paid', value: '$30.00' },
      { label: 'Confirmation to', value: formData.clientEmail },
    ]

    return (
      <motion.section
        ref={confirmRef}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ scrollMarginTop: '88px' }}
        className="overflow-hidden rounded-2xl border border-cream-border shadow-soft"
        aria-live="assertive"
      >
        <div className="bg-cocoa px-8 py-12 text-center">
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 14 }}
            className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold"
          >
            <Check size={36} strokeWidth={2.5} className="text-espresso" aria-hidden="true" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="font-display mt-6 text-4xl font-semibold text-cream"
          >
            Appointment Confirmed!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="mx-auto mt-3 max-w-md leading-7 text-cream/75"
          >
            Your appointment is confirmed. Your $30 deposit has been received and will be applied
            toward your final service balance. Please check your email for your appointment details
            and a link to manage your appointment.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          className="bg-paper px-8 py-7"
        >
          <p className="mb-5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-mocha/50">
            Appointment Summary
          </p>
          <dl className="divide-y divide-cream-border">
            {summaryRows.map(({ label, value }) =>
              value ? (
                <div key={label} className="flex items-center justify-between gap-4 py-3">
                  <dt className="shrink-0 text-xs font-semibold text-mocha/60">{label}</dt>
                  <dd className="text-right text-sm font-medium text-espresso">{value}</dd>
                </div>
              ) : null,
            )}
          </dl>
        </motion.div>

        <div className="border-t border-cream-border bg-cream-deep/40 px-8 py-7 text-center">
          <p className="text-sm leading-relaxed text-mocha">
            Your deposit will be applied toward your final service balance.{' '}
            <span className="font-semibold text-espresso">Check your email</span> for a link to view or manage your appointment.
          </p>
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {portalUrl && (
              <a href={portalUrl} className="btn btn-gold inline-flex items-center gap-2">
                View My Appointment
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
            <Link to="/" className="btn btn-outline">
              Back to Home
            </Link>
          </div>
        </div>
      </motion.section>
    )
  }

  // ── Booking Form ─────────────────────────────────────────────────────────

  const servicePrice = selectedService?.startingPrice ?? 0
  const depositAmount = 3000
  const remainingBalance = Math.max(0, servicePrice - depositAmount)

  return (
    <form
      ref={formRef}
      className="overflow-hidden rounded-2xl border border-cream-border bg-paper shadow-soft"
      style={{ scrollMarginTop: '88px' }}
      onSubmit={submit}
    >
      {/* Step indicator */}
      <div className="border-b border-cream-border bg-cream-deep/40 px-6 py-5 md:px-8">
        <div className="flex items-center">
          {STEPS.map((label, i) => {
            const n = i + 1
            const done = step > n
            const active = step === n
            return (
              <div key={n} className="flex flex-1 items-center last:flex-none">
                <div className="flex shrink-0 items-center gap-2.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      done
                        ? 'bg-gold text-espresso'
                        : active
                          ? 'bg-cocoa text-cream'
                          : 'bg-cream-border text-mocha'
                    }`}
                  >
                    {done ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : n}
                  </div>
                  <span
                    className={`hidden text-[0.65rem] font-bold uppercase tracking-[0.08em] transition-colors sm:block ${
                      active ? 'text-cocoa' : done ? 'text-gold-dark' : 'text-mocha/50'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mx-3 h-px flex-1 bg-cream-border">
                    <div
                      className={`h-px bg-gold transition-all duration-500 ${done ? 'w-full' : 'w-0'}`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-6 md:p-8">
        {hasErrors && (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-error/30 bg-error/8 p-4 text-sm text-error"
          >
            <span className="mt-0.5 shrink-0" aria-hidden="true">⚠</span>
            Please review the highlighted fields.
          </div>
        )}

        {/* Honeypot */}
        <input
          type="text"
          name="company"
          value={formData.honeypot}
          onChange={(e) => update('honeypot', e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {/* ── Step 1: Service ────────────────────────────────── */}
        {step === 1 && (
          <div className="grid gap-6">
            {!selectedCategory ? (
              <>
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha">
                    Choose a Category
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-mocha/70">
                    Select the type of service you&apos;re looking for to get started.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {BOOKING_CATEGORIES.map((cat) => {
                    const minPrice = categoryMinPrices[cat.id]
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        aria-pressed={false}
                        onClick={() => handleCategorySelect(cat.id)}
                        className="group flex flex-col rounded-2xl border-2 border-cream-border bg-paper p-5 text-left shadow-soft transition-all duration-200 hover:border-gold/60 hover:shadow-[0_4px_24px_rgba(184,134,11,0.14)] focus-visible:border-gold"
                      >
                        <p className="font-display text-xl font-semibold text-espresso">
                          {cat.name}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-gold-dark">
                          {minPrice !== undefined
                            ? `Starting at ${formatPrice(minPrice)}`
                            : 'Pricing confirmed at appointment'}
                        </p>
                        <p className="mt-2 text-sm leading-snug text-mocha/75">
                          {cat.tagline}
                        </p>
                        <div className="my-3.5 h-px bg-cream-border" />
                        <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-[0.10em] text-mocha/45">
                          Includes
                        </p>
                        <ul className="grid gap-1.5">
                          {cat.examples.map((ex) => (
                            <li key={ex} className="flex items-center gap-2 text-xs text-espresso">
                              <span
                                className="h-1 w-1 shrink-0 rounded-full bg-gold-dark/60"
                                aria-hidden="true"
                              />
                              {ex}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4 self-end text-[0.7rem] font-bold uppercase tracking-[0.08em] text-gold-dark transition-colors group-hover:text-gold">
                          Choose →
                        </p>
                      </button>
                    )
                  })}
                </div>

                {errors.serviceId && (
                  <p className="field-error">{errors.serviceId}</p>
                )}
              </>
            ) : (
              <div
                ref={serviceListRef}
                style={{ scrollMarginTop: '100px' }}
                className="grid gap-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha">
                      {BOOKING_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                    </p>
                    <p className="mt-0.5 text-sm text-mocha/65">
                      Choose your specific service below
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('')
                      update('serviceId', '')
                      window.setTimeout(() => scrollTo(formRef.current, 'start'), 60)
                    }}
                    className="shrink-0 text-xs font-semibold text-gold-dark underline-offset-2 transition-colors hover:text-gold hover:underline"
                  >
                    Change category
                  </button>
                </div>

                {servicesQuery.isPending ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="h-16 animate-pulse rounded-xl bg-cream-deep" />
                    ))}
                  </div>
                ) : categoryServices.length === 0 ? (
                  <p className="text-sm text-mocha/60">
                    No services available in this category at this time.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {categoryServices.map((svc) => {
                      const isSelected = formData.serviceId === svc.serviceId
                      return (
                        <button
                          key={svc.serviceId}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => handleServiceSelect(svc.serviceId)}
                          className={`flex flex-col rounded-xl border-2 p-4 text-left transition-all duration-150 ${
                            isSelected
                              ? 'border-gold bg-gold-pale/30 shadow-[0_2px_16px_rgba(184,134,11,0.18)]'
                              : 'border-cream-border bg-paper hover:border-gold/50 hover:bg-gold-pale/10'
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold leading-snug text-espresso">
                              {svc.name}
                            </span>
                            {isSelected && (
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold">
                                <Check
                                  size={10}
                                  strokeWidth={3}
                                  className="text-espresso"
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                          </span>
                          <span className="mt-1 text-xs text-gold-dark">
                            Starting at {formatPrice(svc.startingPrice)}&nbsp;&middot;&nbsp;{formatDuration(svc.durationMinutes)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {selectedService && (
                  <div className="rounded-xl border border-gold/40 bg-gradient-to-br from-gold-pale to-cream p-4">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.10em] text-gold-dark">
                      Selected Service
                    </p>
                    <p className="mt-1 font-semibold text-cocoa">{selectedService.name}</p>
                    <p className="mt-0.5 text-sm text-espresso">
                      Starting at {formatPrice(selectedService.startingPrice)}
                      &nbsp;&middot;&nbsp;{formatDuration(selectedService.durationMinutes)}
                    </p>
                  </div>
                )}

                {errors.serviceId && (
                  <p className="field-error">{errors.serviceId}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Contact Info ────────────────────────────── */}
        {step === 2 && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field md:col-span-2">
              <label
                htmlFor="clientName"
                className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha"
              >
                Full Name
              </label>
              <input
                ref={clientNameRef}
                id="clientName"
                value={formData.clientName}
                onChange={(e) => update('clientName', e.target.value)}
                autoComplete="name"
                placeholder="Your full name"
                aria-invalid={Boolean(errors.clientName)}
                className="mt-2"
              />
              {errors.clientName && <p className="field-error">{errors.clientName}</p>}
            </div>
            <div className="field">
              <label
                htmlFor="clientEmail"
                className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha"
              >
                Email Address
              </label>
              <input
                id="clientEmail"
                type="email"
                inputMode="email"
                value={formData.clientEmail}
                onChange={(e) => update('clientEmail', e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.clientEmail)}
                className="mt-2"
              />
              {errors.clientEmail && <p className="field-error">{errors.clientEmail}</p>}
            </div>
            <div className="field">
              <label
                htmlFor="clientPhone"
                className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha"
              >
                Phone Number
              </label>
              <input
                id="clientPhone"
                type="tel"
                inputMode="tel"
                value={formData.clientPhone}
                onChange={(e) => update('clientPhone', formatPhoneNumber(e.target.value))}
                autoComplete="tel"
                placeholder="(317) 000-0000"
                maxLength={14}
                aria-invalid={Boolean(errors.clientPhone)}
                className="mt-2"
              />
              {errors.clientPhone && <p className="field-error">{errors.clientPhone}</p>}
            </div>
          </div>
        )}

        {/* ── Step 3: Choose Date & Time ──────────────────────── */}
        {step === 3 && (
          <div className="grid gap-7">
            {/* Date selection */}
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha">
                Choose an Available Date
              </p>
              <p className="mt-0.5 text-sm text-mocha/65">
                Dates marked with a dot have open slots. Tap a date to see available times.
              </p>
              <div className="mt-3">
                <AvailabilityCalendar
                  year={calendarMonth.year}
                  month={calendarMonth.month}
                  selectedDate={formData.preferredDate}
                  onDateSelect={(date) => {
                    update('preferredDate', date)
                    update('preferredTime', '')
                  }}
                  dates={monthAvailabilityQuery.data?.dates}
                  isLoading={monthAvailabilityQuery.isPending}
                  onMonthChange={handleMonthChange}
                />
              </div>
              {errors.preferredDate && <p className="field-error mt-2">{errors.preferredDate}</p>}
            </div>

            {/* Time selection — appears after a date is chosen */}
            {formData.preferredDate && (
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha">
                  Choose an Available Time
                </p>
                <p className="mt-0.5 text-sm text-mocha/65">
                  {formatBookingDate(formData.preferredDate)}
                </p>
                <div className="mt-3">
                  <TimeSlotPicker
                    slots={dateSlotsQuery.data?.slots}
                    selectedRawTime={formData.preferredTime}
                    onSelect={(rawTime) => update('preferredTime', rawTime)}
                    isLoading={dateSlotsQuery.isPending}
                  />
                </div>
                {errors.preferredTime && <p className="field-error mt-2">{errors.preferredTime}</p>}
              </div>
            )}

            {/* Referral + Notes */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="field md:col-span-2">
                <label
                  htmlFor="referralSource"
                  className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha"
                >
                  How did you hear about us?
                </label>
                <select
                  id="referralSource"
                  value={formData.referralSource}
                  onChange={(e) => update('referralSource', e.target.value)}
                  className="mt-2"
                >
                  {referralOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field md:col-span-2">
                <label
                  htmlFor="notes"
                  className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha"
                >
                  Hair Notes or Questions
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  maxLength={500}
                  placeholder="Share details about the style you have in mind, hair length, or any questions…"
                  className="mt-2"
                />
                {errors.notes && <p className="field-error">{errors.notes}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Secure Deposit ──────────────────────────── */}
        {step === 4 && stripePaymentHold && (
          <div className="space-y-4">
            {/* Deposit info note */}
            <div className="rounded-xl border border-gold/30 bg-gold-pale/20 p-4">
              <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-gold-dark">
                About Your Deposit
              </p>
              <p className="text-xs leading-relaxed text-mocha">
                A $30 deposit is required to secure your appointment. This deposit will be applied toward your final service balance at the salon.
              </p>
            </div>

            {/* Payment breakdown */}
            <div className="rounded-xl border border-cream-border bg-cream-deep/30 p-4">
              <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha/60">
                Payment Summary
              </p>
              <dl className="divide-y divide-cream-border">
                {selectedService && (
                  <div className="flex items-center justify-between py-2">
                    <dt className="text-xs text-mocha/70">Service</dt>
                    <dd className="text-xs font-medium text-espresso">{selectedService.name}</dd>
                  </div>
                )}
                {servicePrice > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <dt className="text-xs text-mocha/70">Service total (starting at)</dt>
                    <dd className="text-xs font-medium text-espresso">{formatPrice(servicePrice)}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-lg bg-gold-pale/10 px-2 py-2.5 -mx-2">
                  <dt className="text-sm font-semibold text-espresso">Deposit due today</dt>
                  <dd className="text-sm font-bold text-espresso">$30.00</dd>
                </div>
                {remainingBalance > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <dt className="text-xs text-mocha/70">Remaining balance at salon</dt>
                    <dd className="text-xs font-medium text-mocha">{formatPrice(remainingBalance)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Date + time recap */}
            {formData.preferredDate && formData.preferredTime && (
              <div className="rounded-xl border border-cream-border bg-cream-deep/30 p-4">
                <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha/60">
                  Your Appointment
                </p>
                <p className="text-sm font-medium text-espresso">
                  {formatBookingDate(formData.preferredDate)} at {formatBookingTime(formData.preferredTime)}
                </p>
              </div>
            )}

            <Elements
              stripe={stripePromise}
              options={!isMock ? { clientSecret: stripePaymentHold.clientSecret } : undefined}
            >
              <StripePaymentForm
                appointmentId={stripePaymentHold.appointmentId}
                policyAccepted={policyAccepted}
                onPolicyChange={setPolicyAccepted}
                isConfirming={confirmMutation.isPending}
                isMock={isMock}
                onSuccess={(intentId) =>
                  confirmMutation.mutate({
                    appointmentId: stripePaymentHold.appointmentId,
                    intentId,
                  })
                }
              />
            </Elements>

            {confirmMutation.isError && (
              <div role="alert" className="rounded-xl border border-error/30 bg-error/8 p-4 text-sm text-error space-y-2">
                <p className="font-semibold">Your deposit was received, but we could not confirm your appointment.</p>
                <p>Please contact the salon and share your payment confirmation — we will manually confirm your booking.</p>
                <button
                  type="button"
                  className="mt-1 underline underline-offset-2 text-error/80 hover:text-error"
                  onClick={() =>
                    confirmMutation.mutate({
                      appointmentId: stripePaymentHold!.appointmentId,
                      intentId: confirmMutation.variables!.intentId,
                    })
                  }
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}

        {paymentIntentMutation.isError && (
          <p role="alert" className="mt-6 rounded-xl border border-error/30 bg-error/8 p-4 text-sm text-error">
            {(paymentIntentMutation.error instanceof ApiRequestError && paymentIntentMutation.error.message)
              ? paymentIntentMutation.error.message
              : 'That time slot was taken by another booking just now. Please select a different time.'}
          </p>
        )}

        {/* Action buttons */}
        {step < 4 && (
          <div
            ref={continueAreaRef}
            style={{ scrollMarginTop: '120px' }}
            className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"
          >
            {step > 1 ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => { setErrors({}); setStep((s) => s - 1) }}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              key="continue-btn"
              type="button"
              className="btn btn-primary"
              disabled={step === 3 && paymentIntentMutation.isPending}
              onClick={next}
            >
              {step === 3 && paymentIntentMutation.isPending
                ? 'Checking availability…'
                : step === 3
                  ? <>Continue to $30 Deposit <ArrowRight size={16} aria-hidden="true" /></>
                  : <>Continue <ArrowRight size={16} aria-hidden="true" /></>
              }
            </button>
          </div>
        )}
        {step === 4 && (
          <div className="mt-4">
            <button
              type="button"
              className="btn btn-outline text-sm"
              onClick={() => { setStep(3); setStripePaymentHold(null); setPolicyAccepted(false) }}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to Choose Your Date
            </button>
          </div>
        )}
      </div>
    </form>
  )
}
