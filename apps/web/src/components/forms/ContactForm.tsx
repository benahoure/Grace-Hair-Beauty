import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Check, Upload, X } from 'lucide-react'
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import type { z } from 'zod'

import { api } from '../../lib/api'
import { contactSchema } from '../../lib/validators'
import type { ContactRequest } from '../../types'

type ContactErrors = Partial<Record<keyof ContactRequest, string>>

const SERVICES = [
  'African Braids',
  'Knotless Braids',
  'Natural Hairstyle',
  'Sew-In',
  'Silk Press & Styling',
  'Kids Hairstyles',
  'Protective Styling',
  'Crochet Braids',
  'Boho Braid Waist Length',
  'Men Hairstyles',
  'Other',
  'Not sure yet — I need help choosing',
]

const MAX_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const ALLOWED_EXT = /\.(jpg|jpeg|png|webp|heic)$/i

function flattenErrors(error: z.ZodError<ContactRequest>): ContactErrors {
  return error.errors.reduce<ContactErrors>((acc, issue) => {
    acc[issue.path[0] as keyof ContactRequest] = issue.message
    return acc
  }, {})
}

interface ContactFormProps {
  variant?: 'dark'
  onSuccess?: () => void
}

export function ContactForm({ variant, onSuccess }: ContactFormProps = {}) {
  const isDark = variant === 'dark'

  const [formData, setFormData] = useState<ContactRequest>({
    name: '',
    email: '',
    phone: '',
    message: '',
    services: [],
    honeypot: '',
  })
  const [errors, setErrors] = useState<ContactErrors>({})
  const [inspirationFile, setInspirationFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')

  const errorRef = useRef<HTMLDivElement>(null)
  const confirmRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mutation = useMutation({ mutationFn: api.createContactMessage })

  useEffect(() => {
    if (!mutation.isSuccess) return
    window.setTimeout(
      () => confirmRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      60,
    )
  }, [mutation.isSuccess])

  const update = (field: keyof ContactRequest, value: string) => {
    setFormData((cur) => ({ ...cur, [field]: value }))
    setErrors((cur) => {
      const next = { ...cur }
      delete next[field]
      return next
    })
  }

  const toggleService = (service: string) => {
    setFormData((cur) => ({
      ...cur,
      services: cur.services.includes(service)
        ? cur.services.filter((s) => s !== service)
        : [...cur.services, service],
    }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXT.test(file.name)) {
      setFileError('Please upload a JPG, PNG, WebP, or HEIC image.')
      setInspirationFile(null)
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError('Image is too large. Max size is 5 MB.')
      setInspirationFile(null)
      return
    }
    setFileError('')
    setInspirationFile(file)
  }

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInspirationFile(null)
    setFileError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = contactSchema.safeParse(formData)
    if (!result.success) {
      setErrors(flattenErrors(result.error))
      window.setTimeout(() => errorRef.current?.focus(), 0)
      return
    }
    const payload: ContactRequest = {
      ...result.data,
      // Convert empty email to undefined so JSON.stringify omits it cleanly
      email: result.data.email || undefined,
      ...(inspirationFile ? { inspirationPhotoName: inspirationFile.name } : {}),
    }
    mutation.mutate(payload, { onSuccess: () => onSuccess?.() })
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (mutation.isSuccess && !onSuccess) {
    if (isDark) {
      return (
        <motion.div
          ref={confirmRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center gap-5 py-12 text-center"
          aria-live="assertive"
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 14 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gold"
          >
            <Check size={28} strokeWidth={2.5} className="text-espresso" aria-hidden="true" />
          </motion.div>
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-xl font-bold text-cream"
            >
              Message Sent!
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="mt-2 max-w-xs text-sm leading-relaxed"
              style={{ color: 'rgba(254,253,249,0.60)' }}
            >
              {mutation.data.message}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mt-3 text-[0.6rem] font-bold uppercase tracking-[0.1em]"
              style={{ color: 'rgba(212,168,67,0.70)' }}
            >
              We&apos;ll follow up within 24 hours
            </motion.p>
          </div>
        </motion.div>
      )
    }

    return (
      <motion.div
        ref={confirmRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl border border-cream-border bg-paper p-8 text-center shadow-soft"
        aria-live="assertive"
      >
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 14 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold"
        >
          <Check size={28} strokeWidth={2.5} className="text-espresso" aria-hidden="true" />
        </motion.div>
        <p className="mt-5 text-lg font-bold text-espresso">{mutation.data.message}</p>
        <p className="mt-1 text-sm text-mocha">We&apos;ll get back to you within 24 hours.</p>
      </motion.div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  const formClass = isDark
    ? 'grid gap-5'
    : 'grid gap-5 rounded-card border border-cream-border bg-paper p-5 shadow-soft md:p-8'

  const alertClass = isDark
    ? 'rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300'
    : 'border-l-4 border-error bg-error/10 p-4 text-error'

  // Shared label style for sections outside .field (pills, upload)
  const sectionLabelStyle = isDark
    ? { color: 'rgba(254,253,249,0.75)' }
    : { color: '#6b4226' }

  return (
    <div className={isDark ? 'contact-form-dark' : ''}>
      <form className={formClass} onSubmit={submit} noValidate>
        {Object.keys(errors).length > 0 && (
          <div ref={errorRef} tabIndex={-1} role="alert" className={alertClass}>
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

        {/* ── Name ──────────────────────────────────── */}
        <div className="field">
          <label htmlFor="contact-name">Your name</label>
          <input
            id="contact-name"
            value={formData.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        {/* ── Phone (required) ──────────────────────── */}
        <div className="field">
          <label htmlFor="contact-phone">Phone number</label>
          <input
            id="contact-phone"
            type="tel"
            inputMode="tel"
            value={formData.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="(317) 000-0000"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone && <p className="field-error">{errors.phone}</p>}
        </div>

        {/* ── Email (optional) ──────────────────────── */}
        <div className="field">
          <label htmlFor="contact-email">
            Email{' '}
            <span className="normal-case font-normal opacity-60">(optional)</span>
          </label>
          <input
            id="contact-email"
            type="email"
            inputMode="email"
            value={formData.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        {/* ── Service pills ─────────────────────────── */}
        <fieldset>
          <legend
            className="mb-3 block text-[0.65rem] font-bold uppercase tracking-[0.08em]"
            style={sectionLabelStyle}
          >
            Which style are you asking about?{' '}
            <span className="normal-case font-normal opacity-60">(optional)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((service) => {
              const selected = formData.services.includes(service)
              return (
                <label
                  key={service}
                  className="flex cursor-pointer select-none items-center rounded-full focus-within:ring-2 focus-within:ring-gold/60 focus-within:ring-offset-1"
                  style={{ minHeight: '44px' }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleService(service)}
                    className="sr-only"
                  />
                  <span
                    className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold leading-snug transition-all duration-150"
                    style={
                      selected
                        ? {
                            background: '#B8860B',
                            border: '2px solid #B8860B',
                            color: '#1a0f09',
                          }
                        : isDark
                          ? {
                              background: 'rgba(255,253,249,0.05)',
                              border: '1.5px solid rgba(255,253,249,0.15)',
                              color: 'rgba(254,253,249,0.58)',
                            }
                          : {
                              background: 'transparent',
                              border: '1.5px solid rgba(107,66,38,0.25)',
                              color: 'rgba(61,35,20,0.62)',
                            }
                    }
                  >
                    {selected && (
                      <Check size={10} strokeWidth={3} aria-hidden="true" />
                    )}
                    {service}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        {/* ── Inspiration photo upload ───────────────── */}
        <div>
          <p
            className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
            style={sectionLabelStyle}
          >
            Upload inspiration photo{' '}
            <span className="normal-case font-normal opacity-60">(optional)</span>
          </p>

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label={
              inspirationFile
                ? `Replace ${inspirationFile.name}`
                : 'Upload a style inspiration photo'
            }
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            className="cursor-pointer rounded-xl p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            style={
              isDark
                ? {
                    border: '1.5px dashed rgba(212,168,67,0.30)',
                    background: 'rgba(255,253,249,0.04)',
                  }
                : {
                    border: '1.5px dashed #d4b896',
                    background: '#fdfaf6',
                  }
            }
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.heic,image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="sr-only"
              aria-hidden="true"
              onChange={handleFileChange}
            />

            {inspirationFile ? (
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: isDark ? 'rgba(212,168,67,0.15)' : 'rgba(184,134,11,0.10)',
                  }}
                >
                  <Upload
                    size={14}
                    aria-hidden="true"
                    style={{ color: isDark ? '#D4A843' : '#8B6200' }}
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p
                    className="truncate text-xs font-semibold"
                    style={{ color: isDark ? '#fefdf9' : '#3d2314' }}
                  >
                    {inspirationFile.name}
                  </p>
                  <p
                    className="text-[0.65rem]"
                    style={{ color: isDark ? 'rgba(254,253,249,0.52)' : 'rgba(61,35,20,0.55)' }}
                  >
                    {(inspirationFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  aria-label="Remove photo"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                  style={{ color: isDark ? 'rgba(254,253,249,0.50)' : 'rgba(61,35,20,0.45)' }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 py-2 text-center">
                <Upload
                  size={20}
                  aria-hidden="true"
                  style={{ color: isDark ? 'rgba(212,168,67,0.72)' : 'rgba(184,134,11,0.68)' }}
                />
                <p
                  className="text-xs font-semibold"
                  style={{ color: isDark ? 'rgba(254,253,249,0.82)' : 'rgba(61,35,20,0.78)' }}
                >
                  Tap to upload a style photo
                </p>
                <p
                  className="text-[0.65rem]"
                  style={{ color: isDark ? 'rgba(254,253,249,0.62)' : 'rgba(61,35,20,0.64)' }}
                >
                  JPG, PNG, WebP, or HEIC · Max 5 MB
                </p>
              </div>
            )}
          </div>

          {fileError && (
            <p
              role="alert"
              className="mt-1 text-xs"
              style={{ color: isDark ? '#fca5a5' : '#9b2020' }}
            >
              {fileError}
            </p>
          )}
          <p
            className="mt-1.5 text-[0.65rem] leading-relaxed"
            style={{ color: isDark ? 'rgba(254,253,249,0.68)' : 'rgba(61,35,20,0.68)' }}
          >
            Have a style in mind? Upload a photo so we can better understand the look, length, and size you want.
          </p>
        </div>

        {/* ── Message ───────────────────────────────── */}
        <div className="field">
          <label htmlFor="contact-message">Briefly describe what you need</label>
          <textarea
            id="contact-message"
            value={formData.message}
            onChange={(e) => update('message', e.target.value)}
            placeholder="Describe the style you have in mind, any questions, or how we can help…"
            aria-invalid={Boolean(errors.message)}
          />
          {errors.message && <p className="field-error">{errors.message}</p>}
        </div>

        {mutation.isError && (
          <p role="alert" className={alertClass}>
            Something went wrong. Please text us instead.
          </p>
        )}

        {/* ── Submit ────────────────────────────────── */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className={
            isDark
              ? 'mt-1 w-full rounded-xl py-3.5 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50'
              : 'btn btn-primary justify-self-start'
          }
          style={
            isDark ? { background: 'rgba(254,253,249,0.93)', color: '#1c0e08' } : undefined
          }
        >
          {mutation.isPending ? 'Sending…' : 'Send a message'}
        </button>
      </form>
    </div>
  )
}
