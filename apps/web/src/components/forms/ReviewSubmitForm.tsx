import { useMutation } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { FormEvent, useEffect, useRef, useState } from 'react'

import { api } from '../../lib/api'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { reviewSubmissionSchema } from '../../lib/validators'
import type { ReviewSubmission } from '../../types'

const CARD_SHADOW = '0 8px 40px rgba(44,24,16,0.13)'
const CARD_SHADOW_HOVER = '0 16px 56px rgba(44,24,16,0.20)'

type FieldErrors = {
  clientName?: string
  body?: string
  general?: string
}

interface ReviewSubmitFormProps {
  googleReviewUrl?: string
  onSuccess?: () => void
}

export function ReviewSubmitForm({ googleReviewUrl, onSuccess }: ReviewSubmitFormProps) {
  const reduced = useReducedMotion()
  const [formData, setFormData] = useState<ReviewSubmission>({
    clientName: '',
    rating: 5,
    body: '',
    honeypot: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const confirmRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLParagraphElement>(null)
  const mutation = useMutation({ mutationFn: api.submitReview })

  useEffect(() => {
    if (!mutation.isSuccess) return
    window.setTimeout(() => {
      // Move focus first (preventScroll so we control scroll ourselves)
      headingRef.current?.focus({ preventScroll: true })
      // Then center the confirmation card in the viewport
      confirmRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [mutation.isSuccess])

  const update = (field: keyof ReviewSubmission, value: string | number) => {
    setFormData((cur) => ({ ...cur, [field]: value }))
    if (field === 'clientName' || field === 'body') {
      setFieldErrors((cur) => ({ ...cur, [field]: undefined, general: undefined }))
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = reviewSubmissionSchema.safeParse(formData)
    if (!result.success) {
      const errors: FieldErrors = {}
      const nonHoneypot = result.error.issues.filter((i) => i.path[0] !== 'honeypot')
      if (nonHoneypot.length === 0) {
        errors.general = 'Invalid submission.'
      } else {
        for (const issue of nonHoneypot) {
          const field = String(issue.path[0])
          if (field === 'clientName') errors.clientName = issue.message
          else if (field === 'body') errors.body = issue.message
          else errors.general = 'Please fill in all required fields.'
        }
      }
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    mutation.mutate(result.data, { onSuccess: () => onSuccess?.() })
  }

  if (mutation.isSuccess && !onSuccess) {
    return (
      <motion.div
        ref={confirmRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex flex-col items-center gap-5 rounded-2xl border border-[#ede8df] bg-[#fefdf9] p-10 text-center"
        style={{ boxShadow: CARD_SHADOW }}
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2c5f2e] text-cream">
          <Check size={24} aria-hidden="true" />
        </div>
        <p
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-semibold text-cocoa focus:outline-none"
        >
          Thank you — your review has been submitted.
        </p>
        <p className="max-w-xs text-sm leading-[1.75] text-espresso/80">
          Reviews are checked by our team before they appear on the website.
        </p>
        {googleReviewUrl && (
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2 text-sm font-semibold text-gold-dark transition-colors hover:border-gold hover:text-gold"
          >
            Leave a Google Review <span aria-hidden="true">↗</span>
          </a>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="rounded-2xl border border-[#ede8df] bg-[#fefdf9] p-6 md:p-8"
      style={{ boxShadow: CARD_SHADOW }}
      initial={reduced ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={reduced ? {} : { y: -3, boxShadow: CARD_SHADOW_HOVER, transition: { duration: 0.22 } }}
    >
      <form className="grid gap-5" onSubmit={submit}>
        {fieldErrors.general && (
          <p role="alert" className="rounded-xl border border-error/30 bg-error/8 p-4 text-sm text-error">
            {fieldErrors.general}
          </p>
        )}

        {mutation.isError && (
          <p role="alert" className="rounded-xl border border-error/30 bg-error/8 p-4 text-sm text-error">
            Something went wrong. Please try again or leave a Google review instead.
          </p>
        )}

        {/* Honeypot — hidden from real users, aria-hidden so SR ignores it */}
        <input
          type="text"
          name="website_url"
          value={formData.honeypot}
          onChange={(e) => update('honeypot', e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div className="field">
          <label
            htmlFor="clientName"
            className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha"
          >
            Your Name
          </label>
          <input
            id="clientName"
            value={formData.clientName}
            onChange={(e) => update('clientName', e.target.value)}
            placeholder="e.g. Salimatou T. or Jordan M."
            autoComplete="name"
            aria-describedby={fieldErrors.clientName ? 'clientName-error' : undefined}
            className="mt-2"
          />
          {fieldErrors.clientName && (
            <p id="clientName-error" role="alert" className="mt-1.5 text-xs text-error">
              {fieldErrors.clientName}
            </p>
          )}
        </div>

        <div className="field">
          <label
            htmlFor="rating"
            className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha"
          >
            Rating
          </label>
          <select
            id="rating"
            value={formData.rating}
            onChange={(e) => update('rating', Number(e.target.value))}
            className="mt-2"
          >
            <option value={5}>★★★★★ — 5 stars</option>
            <option value={4}>★★★★☆ — 4 stars</option>
            <option value={3}>★★★☆☆ — 3 stars</option>
            <option value={2}>★★☆☆☆ — 2 stars</option>
            <option value={1}>★☆☆☆☆ — 1 star</option>
          </select>
        </div>

        <div className="field">
          <label
            htmlFor="body"
            className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-mocha"
          >
            Your Review
          </label>
          <textarea
            id="body"
            value={formData.body}
            onChange={(e) => update('body', e.target.value)}
            placeholder="Tell us about your experience — the style, the service, how you felt leaving the chair…"
            aria-describedby={fieldErrors.body ? 'body-error' : undefined}
            className="mt-2"
          />
          {fieldErrors.body && (
            <p id="body-error" role="alert" className="mt-1.5 text-xs text-error">
              {fieldErrors.body}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 self-start rounded-full border border-gold/60 px-6 py-2.5 text-sm font-semibold text-gold-dark transition-all duration-200 hover:border-gold hover:bg-gold/8 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? 'Submitting…' : <>Share Your Experience <span aria-hidden="true">→</span></>}
        </button>
      </form>
    </motion.div>
  )
}
