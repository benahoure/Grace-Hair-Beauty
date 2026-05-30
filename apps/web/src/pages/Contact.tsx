import { motion } from 'framer-motion'
import { Check, Clock, Facebook, Instagram, MapPin, MessageSquare, Phone } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'

import { ContactForm } from '../components/forms/ContactForm'
import { PageHero } from '../components/hero/PageHero'
import { PageMeta } from '../components/seo/PageMeta'
import { useBusinessSettings } from '../hooks/useBusinessSettings'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { formatHours, telHref } from '../lib/format'
import { defaultBusinessSettings } from '../lib/mockData'

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  )
}

export function Contact() {
  const { data } = useBusinessSettings()
  const settings = data ?? defaultBusinessSettings
  const reduced = useReducedMotion()
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!submitted) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [submitted])

  const smsHref = `sms:${settings.phone.replace(/[^\d+]/g, '')}`

  const { instagram, facebook, tiktok } = settings.socialLinks
  const socialLinks = [
    instagram && { href: instagram, label: 'Instagram', icon: <Instagram size={16} /> },
    facebook  && { href: facebook,  label: 'Facebook',  icon: <Facebook  size={16} /> },
    tiktok    && { href: tiktok,    label: 'TikTok',    icon: <TikTokIcon size={16} /> },
  ].filter(Boolean) as { href: string; label: string; icon: ReactNode }[]

  if (submitted) {
    return (
      <>
        <PageMeta
          title="Message Sent | Grace Hair Beauty"
          description="Your message has been received. Grace Hair Beauty will follow up within 24 hours."
          canonical="https://gracehairsbeauty.com/contact"
        />
        <section
          className="flex min-h-[70vh] items-center py-16 lg:py-20"
          style={{ background: '#f5ede2' }}
        >
          <div className="container-page flex justify-center">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-paper"
              style={{ boxShadow: '0 32px 80px rgba(44,24,16,0.18), 0 4px 16px rgba(44,24,16,0.10)' }}
            >
              <div className="bg-cocoa px-8 py-12 text-center">
                <motion.div
                  initial={reduced ? false : { scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 14 }}
                  className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold"
                >
                  <Check size={36} strokeWidth={2.5} className="text-espresso" aria-hidden="true" />
                </motion.div>
                <motion.h1
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="font-display mt-6 text-3xl font-semibold text-cream"
                >
                  Message Sent!
                </motion.h1>
                <motion.p
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                  className="mt-3 text-sm leading-relaxed text-cream/65"
                >
                  Thank you for reaching out. Grace Hair Beauty will follow up with care within 24 hours.
                </motion.p>
              </div>
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.35 }}
                className="flex flex-col gap-3 px-8 py-8"
              >
                <a href="/contact" className="btn btn-outline w-full justify-center">
                  Back to Contact
                </a>
                <a href="/" className="btn btn-gold w-full justify-center">
                  Back to Home
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageMeta
        title="Contact Grace Hair Beauty | Hair Salon in Indianapolis"
        description="Contact Grace Hair Beauty to ask questions, choose a service, or book your next appointment in Indianapolis."
        canonical="https://gracehairsbeauty.com/contact"
      />

      <PageHero
        eyebrow="Contact"
        title="Questions About"
        italicTitle="a Style?"
        description="Send a message, text a photo, or call the salon. We’ll help you choose the right service and confirm the next step with care."
        tone="cream"
      />

      <section className="pb-8 pt-10 lg:py-16" style={{ background: '#f5ede2' }}>
        <div className="container-page">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="overflow-hidden rounded-3xl lg:grid lg:grid-cols-2"
            style={{ boxShadow: '0 32px 80px rgba(44,24,16,0.18), 0 4px 16px rgba(44,24,16,0.10)' }}
          >
            {/* ── LEFT: founder image + action overlay ───────────────── */}
            <div className="relative min-h-[520px] lg:min-h-0">
              <img
                src={settings.contactImageUrl || '/contact-us/founder-ariane-about-us.webp'}
                alt="Ariane, founder of Grace Hair Beauty"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: '50% 8%' }}
                draggable={false}
              />

              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                  background:
                    'linear-gradient(to top, rgba(10,5,2,0.98) 0%, rgba(10,5,2,0.97) 40%, rgba(10,5,2,0.91) 60%, rgba(10,5,2,0.74) 74%, rgba(10,5,2,0.42) 85%, rgba(10,5,2,0.14) 93%, transparent 100%)',
                }}
              />

              {/* Overlay content */}
              <div className="absolute inset-0 flex flex-col justify-end p-7 lg:p-10">
                <div className="flex flex-col gap-4">

                  {/* Headline + copy */}
                  <div>
                    <h1 className="font-display text-[clamp(1.9rem,5vw,2.6rem)] font-semibold leading-[1.08] text-cream">
                      Questions about<br />a style?
                    </h1>
                    <p className="mt-2.5 text-sm leading-relaxed text-cream/80">
                      Text or DM us — photos welcome.
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.13em] text-gold-light/80">
                      <span aria-hidden="true">◆</span>
                      Usually replies within 24 hours.
                    </p>
                  </div>

                  {/* Primary CTAs */}
                  <div className="grid gap-2">
                    <a
                      href={smsHref}
                      className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-sm font-bold tracking-[0.04em] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                      style={{ background: '#B8860B', color: '#1a0f09' }}
                    >
                      <MessageSquare size={15} aria-hidden="true" />
                      Text Us
                    </a>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={telHref(settings.phone)}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-[0.05em] text-cream/90 transition-colors hover:bg-cream/10 active:bg-cream/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/50"
                        style={{ border: '1.5px solid rgba(250,246,240,0.28)' }}
                      >
                        <Phone size={13} aria-hidden="true" />
                        Call Us
                      </a>
                      <a
                        href={settings.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-[0.05em] text-cream/90 transition-colors hover:bg-cream/10 active:bg-cream/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/50"
                        style={{ border: '1.5px solid rgba(250,246,240,0.28)' }}
                      >
                        <MapPin size={13} aria-hidden="true" />
                        Directions
                      </a>
                    </div>
                  </div>

                  {/* Social icons + hours */}
                  <div>
                    <div className="mb-3 border-t border-cream/[0.12]" />
                    <div className="flex flex-col gap-3">
                      {socialLinks.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <span className="text-[0.58rem] font-bold uppercase tracking-widest" style={{ color: 'rgba(254,253,249,0.65)' }}>
                            Prefer social? Message us here
                          </span>
                          <div className="flex items-center gap-2">
                            {socialLinks.map(({ href, label, icon }) => (
                              <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Open ${label}`}
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-cream/60 transition-colors hover:text-cream/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                                style={{ background: 'rgba(255,253,249,0.09)', border: '1px solid rgba(255,253,249,0.08)' }}
                              >
                                {icon}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="flex items-center gap-1.5 text-[0.62rem]" style={{ color: 'rgba(254,253,249,0.72)' }}>
                        <Clock size={11} aria-hidden="true" />
                        {formatHours(settings)}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* ── RIGHT: dark form card ────────────────────────────────────── */}
            <div
              className="flex flex-col px-8 pb-8 pt-10 lg:overflow-y-auto lg:p-10"
              style={{ background: 'linear-gradient(160deg, #1a0e06 0%, #251408 100%)' }}
            >
              <div>
                <h2 className="text-xl font-bold text-cream">
                  Send us a message{' '}
                  <span className="text-gold-light" aria-hidden="true">✦</span>
                </h2>
                <p className="mt-2 text-[0.72rem] leading-relaxed" style={{ color: 'rgba(254,253,249,0.72)' }}>
                  Tell us the style, preferred date, and any questions. You can upload a photo below.
                </p>
              </div>

              <div className="mt-8 flex-1">
                <ContactForm variant="dark" onSuccess={() => setSubmitted(true)} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
