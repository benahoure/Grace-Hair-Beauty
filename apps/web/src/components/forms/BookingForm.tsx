import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { z } from 'zod'

import { ApiRequestError, api } from '../../lib/api'
import { formatDuration, formatPrice } from '../../lib/format'
import { mockPortfolio } from '../../lib/mockData'
import { bookingSchema, tomorrowInSalonTimeZone } from '../../lib/validators'
import type { AppointmentRequest, ServiceCategory } from '../../types'

type BookingErrors = Partial<Record<keyof AppointmentRequest, string>>

const STEPS = ['Service', 'Your Info', 'Date & Time']

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
    name: 'Braids',
    tagline: 'Protective braided styles with clean parts and lasting hold.',
    serviceCategories: ['african-braids'],
    examples: ['Knotless Braids', 'Box Braids', 'Senegalese Twist', 'Fulani Braids'],
  },
  {
    id: 'natural',
    name: 'Natural Hair',
    tagline: 'Silk press, natural styling, and healthy hair care.',
    serviceCategories: ['natural'],
    examples: ['Natural Hairstyle', 'Silk Press & Styling', 'Protective Styling', 'Deep Hair Treatment'],
  },
  {
    id: 'sew-in',
    name: 'Sew-In & Extensions',
    tagline: 'Polished sew-ins and extension styling for a flawless finish.',
    serviceCategories: ['sew-in'],
    examples: ['Sew-In'],
  },
  {
    id: 'other',
    name: 'Other Hair Services',
    tagline: 'Tailored styles for men, kids, and specialty requests.',
    serviceCategories: ['men', 'kids'],
    examples: ['Men Hairstyles', 'Men Dreadlocks', 'Kids Hairstyles'],
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
  'style-knotless-waist': 'svc-knotless-braids',
  'style-boho-braids': 'svc-boho-waist',
  'style-boho-golden': 'svc-boho-waist',
  'style-boho-copper': 'svc-boho-waist',
  'style-african-braids': 'svc-african-braids',
  'style-fulani-braids': 'svc-fulani-braids',
  'style-miracle-knot': 'svc-miracle-knot',
  'style-crochet': 'svc-crochet-braids',
  'style-jumbo-box-braids': 'svc-box-braids',
  'style-box-braids': 'svc-box-braids',
  'style-box-braids-styled': 'svc-box-braids-styled',
  'style-senegalese-twist': 'svc-senegalese-twist',
  'style-senegalese-twist-colors': 'svc-senegalese-twist-colors',
  'style-sew-in-layered': 'svc-sew-in',
  'style-natural-hairstyle': 'svc-natural-hairstyle',
  'style-cornrows-bun': 'svc-protective-styling',
  'style-kids-beads': 'svc-kids-hairstyles',
  'style-kids-twists-bow': 'svc-kids-hairstyles',
  'style-kids-star-beads': 'svc-kids-hairstyles',
  'style-kids-color-beads': 'svc-kids-hairstyles',
  'style-kids-flower-beads': 'svc-kids-hairstyles',
  'style-men-hairstyles': 'svc-men-hairstyles',
  'style-men-hairstyle-2': 'svc-men-hairstyles',
  'style-men-hairstyle-3': 'svc-men-hairstyles',
  'style-men-dreadlocks': 'svc-men-dreadlocks',
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

// Scrolls an element into view accounting for the sticky header (76px) + breathing room.
function scrollTo(el: HTMLElement | null, block: ScrollLogicalPosition = 'start') {
  el?.scrollIntoView({ behavior: 'smooth', block })
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
  const [selectedCategory, setSelectedCategory] = useState('')
  const [errors, setErrors] = useState<BookingErrors>({})
  const errorRef = useRef<HTMLDivElement>(null)

  // ── Scroll / focus refs ────────────────────────────────────────────────────
  // The form card itself — scrolled into view on every step transition.
  const formRef = useRef<HTMLFormElement>(null)
  // Top of the specific-service list (step 1b) — scrolled to after category pick.
  const serviceListRef = useRef<HTMLDivElement>(null)
  // The action-button row — scrolled to after a service is selected so the user
  // can immediately see and tap "Continue".
  const continueAreaRef = useRef<HTMLDivElement>(null)
  // First focusable field per step, focused after the scroll animation settles.
  const clientNameRef = useRef<HTMLInputElement>(null)
  const preferredDateRef = useRef<HTMLInputElement>(null)
  // Skip scroll on the very first render (user just arrived at the page).
  const hasMounted = useRef(false)
  // Scrolled into view automatically when the confirmation screen renders.
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

  // When a service is pre-selected via URL, auto-derive and set its booking category
  useEffect(() => {
    const contextServiceId = formData.serviceId || requestedService || requestedStyleServiceId
    if (!contextServiceId || !servicesQuery.data || selectedCategory) return
    const svc = servicesQuery.data.services.find((s) => s.serviceId === contextServiceId)
    if (!svc) return
    const cat = BOOKING_CATEGORIES.find((c) => c.serviceCategories.includes(svc.category))
    if (cat) setSelectedCategory(cat.id)
  }, [formData.serviceId, requestedService, requestedStyleServiceId, servicesQuery.data, selectedCategory])

  // ── Scroll + focus on every step transition ────────────────────────────────
  // Brings the step indicator back into view so the user always starts each
  // step from the top of the form — not mid-page or at the sidebar below.
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    scrollTo(formRef.current, 'start')
    // Focus the first field once the scroll animation has settled (~400ms)
    const t = window.setTimeout(() => {
      if (step === 2) clientNameRef.current?.focus()
      if (step === 3) preferredDateRef.current?.focus()
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

  const appointmentMutation = useMutation({
    mutationFn: api.createAppointment,
    onError: (error) => {
      if (error instanceof ApiRequestError && error.fieldErrors) {
        setErrors(error.fieldErrors as BookingErrors)
        window.setTimeout(() => errorRef.current?.focus(), 0)
      }
    },
  })

  // Scroll the confirmation screen into view the moment it appears
  useEffect(() => {
    if (!appointmentMutation.isSuccess) return
    window.setTimeout(() => scrollTo(confirmRef.current, 'start'), 60)
  }, [appointmentMutation.isSuccess])

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
    // Scroll to the service list so the user sees the next sub-step immediately.
    window.setTimeout(() => scrollTo(serviceListRef.current, 'start'), 60)
  }

  const handleServiceSelect = (serviceId: string) => {
    update('serviceId', serviceId)
    // After selecting a service, bring the Continue button into view so the user
    // knows exactly where to tap next — no hunting, no confusion.
    window.setTimeout(() => scrollTo(continueAreaRef.current, 'nearest'), 60)
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
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (step !== 3) return
    handleFinalSubmit()
  }

  const handleFinalSubmit = () => {
    if (step !== 3 || appointmentMutation.isPending) return
    const result = bookingSchema.safeParse(formData)
    if (!result.success) {
      setErrors(flattenErrors(result.error))
      window.setTimeout(() => errorRef.current?.focus(), 0)
      return
    }
    appointmentMutation.mutate(result.data)
  }

  if (appointmentMutation.isSuccess) {
    const summaryRows = [
      { label: 'Name', value: formData.clientName },
      { label: 'Service', value: selectedService?.name },
      { label: 'Date', value: formatBookingDate(formData.preferredDate) },
      { label: 'Time', value: formatBookingTime(formData.preferredTime) },
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
        {/* Hero band */}
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
            You&apos;re All Set!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="mx-auto mt-3 max-w-md leading-7 text-cream/75"
          >
            {appointmentMutation.data.message}
          </motion.p>
        </div>

        {/* Booking summary */}
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

        {/* Footer */}
        <div className="border-t border-cream-border bg-cream-deep/40 px-8 py-7 text-center">
          <p className="text-sm leading-relaxed text-mocha">
            We&apos;ll confirm by{' '}
            <span className="font-semibold text-espresso">text and email within 24 hours.</span>
            {' '}Questions? Call us anytime.
          </p>
          <div className="mt-5 flex justify-center">
            <Link to="/" className="btn btn-gold">
              Back to Home
            </Link>
          </div>
        </div>
      </motion.section>
    )
  }

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

        {/* Honeypot — hidden from real users */}
        <input
          type="text"
          name="company"
          value={formData.honeypot}
          onChange={(e) => update('honeypot', e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {/* ── Step 1: Service ─────────────────────────────── */}
        {step === 1 && (
          <div className="grid gap-6">
            {!selectedCategory ? (
              /* ── 1a: Category Cards ── */
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
              /* ── 1b: Specific Service Selector ── */
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
                      // Scroll back to the top of the form so the category cards are visible
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

        {/* ── Step 2: Contact Info ─────────────────────────── */}
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
                onChange={(e) => update('clientPhone', e.target.value)}
                autoComplete="tel"
                placeholder="(317) 000-0000"
                aria-invalid={Boolean(errors.clientPhone)}
                className="mt-2"
              />
              {errors.clientPhone && <p className="field-error">{errors.clientPhone}</p>}
            </div>
          </div>
        )}

        {/* ── Step 3: Date & Time ─────────────────────────── */}
        {step === 3 && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field">
              <label
                htmlFor="preferredDate"
                className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha"
              >
                Preferred Date
              </label>
              <input
                ref={preferredDateRef}
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                min={tomorrowInSalonTimeZone()}
                onChange={(e) => update('preferredDate', e.target.value)}
                onFocus={() => {
                  if (!formData.preferredDate) update('preferredDate', tomorrowInSalonTimeZone())
                }}
                aria-invalid={Boolean(errors.preferredDate)}
                className="mt-2"
              />
              {errors.preferredDate && <p className="field-error">{errors.preferredDate}</p>}
            </div>
            <div className="field">
              <label
                htmlFor="preferredTime"
                className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha"
              >
                Preferred Time
              </label>
              <input
                id="preferredTime"
                type="time"
                value={formData.preferredTime}
                onChange={(e) => update('preferredTime', e.target.value)}
                onFocus={() => {
                  if (!formData.preferredTime) update('preferredTime', '10:00')
                }}
                aria-invalid={Boolean(errors.preferredTime)}
                className="mt-2"
              />
              {errors.preferredTime && <p className="field-error">{errors.preferredTime}</p>}
            </div>
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
        )}

        {appointmentMutation.isError && (
          <p role="alert" className="mt-6 rounded-xl border border-error/30 bg-error/8 p-4 text-sm text-error">
            We could not submit your request. Please call the salon or try again.
          </p>
        )}

        {/* Action buttons — also serves as the scroll target after service selection */}
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
          {step < 3 ? (
            <button key="continue-btn" type="button" className="btn btn-primary" onClick={next}>
              Continue
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              key="confirm-btn"
              type="button"
              className="btn btn-gold"
              disabled={appointmentMutation.isPending}
              onClick={handleFinalSubmit}
            >
              {appointmentMutation.isPending ? 'Submitting…' : 'Confirm Appointment Request'}
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
