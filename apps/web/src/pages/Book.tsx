import { Clock, MapPin, Phone } from 'lucide-react'

import { BookingForm } from '../components/forms/BookingForm'
import { PageHero } from '../components/hero/PageHero'
import { PageMeta } from '../components/seo/PageMeta'
import { useBusinessSettings } from '../hooks/useBusinessSettings'
import { formatAddress, formatHours, formatPhone, telHref } from '../lib/format'
import { defaultBusinessSettings } from '../lib/mockData'

export function Book() {
  const { data } = useBusinessSettings()
  const settings = data ?? defaultBusinessSettings

  return (
    <>
      <PageMeta
        title="Book a Hair Appointment | Grace Hair Beauty"
        description="Book your braiding, protective styling, natural hair, sew-in, silk press, or beauty appointment online."
        canonical="https://gracehairsbeauty.com/book"
      />

      <PageHero
        eyebrow="Book Appointment"
        title="Reserve Your"
        italicTitle="Chair Today."
        description="Choose your service, select your preferred date and time, and secure your appointment with a $30 deposit. Instant confirmation."
        tone="dark"
      />

      {/* Form + Sidebar */}
      <section className="section-pad bg-cream">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_320px]">
          <BookingForm />

          <aside
            className="h-fit overflow-hidden rounded-2xl"
            style={{
              boxShadow:
                '0 0 0 1px rgba(212,168,67,0.22), 0 24px 64px rgba(20,10,4,0.35)',
            }}
          >
            {/* Metallic gold top bar */}
            <div
              aria-hidden="true"
              style={{
                height: '3px',
                background: 'linear-gradient(90deg, #6b4800 0%, #d4a843 45%, #b8860b 100%)',
              }}
            />

            {/* Dark body */}
            <div
              className="relative overflow-hidden px-6 pb-6 pt-5"
              style={{ background: 'linear-gradient(160deg, #1a0c06 0%, #2c1810 55%, #1c0e08 100%)' }}
            >
              {/* Dot-grid texture */}
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    'radial-gradient(rgba(212,168,67,0.06) 1px, transparent 1px)',
                  backgroundSize: '18px 18px',
                }}
              />
              {/* Bottom fade so the dot grid fades toward the divider */}
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-16"
                aria-hidden="true"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent 0%, rgba(28,14,8,0.8) 100%)',
                }}
              />

              <div className="relative">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gold-light" aria-hidden="true">✦</span>
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.22em] text-gold-light">
                    Visit Us
                  </p>
                </div>
                <div
                  className="mt-2.5 h-px"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(212,168,67,0.50) 0%, rgba(212,168,67,0.15) 60%, transparent 100%)',
                  }}
                />

                {/* Contact rows */}
                <div className="mt-1">
                  {/* Phone */}
                  <a
                    href={telHref(settings.phone)}
                    className="group flex items-start gap-4 py-4"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-gold-light transition-all duration-200 group-hover:bg-gold/10"
                      style={{ borderColor: 'rgba(212,168,67,0.32)' }}
                    >
                      <Phone size={13} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[0.55rem] font-bold uppercase tracking-[0.14em]"
                        style={{ color: 'rgba(250,246,240,0.42)' }}
                      >
                        Phone
                      </p>
                      <p className="mt-0.5 font-semibold text-cream transition-colors group-hover:text-gold-light">
                        {formatPhone(settings.phone)}
                      </p>
                    </div>
                  </a>

                  {/* Address */}
                  <a
                    href={settings.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start gap-4 py-4"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-gold-light transition-all duration-200 group-hover:bg-gold/10"
                      style={{ borderColor: 'rgba(212,168,67,0.32)' }}
                    >
                      <MapPin size={13} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[0.55rem] font-bold uppercase tracking-[0.14em]"
                        style={{ color: 'rgba(250,246,240,0.42)' }}
                      >
                        Address
                      </p>
                      <p className="mt-0.5 font-semibold leading-[1.6] text-cream transition-colors group-hover:text-gold-light">
                        {formatAddress(settings)}
                      </p>
                    </div>
                  </a>

                  {/* Hours */}
                  <div className="flex items-start gap-4 py-4">
                    <div
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-gold-light"
                      style={{ borderColor: 'rgba(212,168,67,0.32)' }}
                    >
                      <Clock size={13} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[0.55rem] font-bold uppercase tracking-[0.14em]"
                        style={{ color: 'rgba(250,246,240,0.42)' }}
                      >
                        Hours
                      </p>
                      <p className="mt-0.5 font-semibold text-cream">
                        {formatHours(settings)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <div
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                      style={{ background: '#4ade80' }}
                    />
                    <span className="relative inline-flex h-2 w-2 rounded-full"
                      style={{ background: '#22c55e' }}
                    />
                  </span>
                  <p className="text-xs font-semibold" style={{ color: 'rgba(250,246,240,0.72)' }}>
                    Accepting appointments
                  </p>
                </div>
              </div>
            </div>

            {/* Light bottom: booking note */}
            <div className="flex gap-3 bg-cream-deep px-5 py-4"
              style={{ borderTop: '1px solid rgba(212,168,67,0.18)' }}
            >
              <div className="mt-1 w-0.5 shrink-0 self-stretch rounded-full"
                style={{ background: 'linear-gradient(to bottom, #b8860b, rgba(184,134,11,0.2))' }}
              />
              <p className="text-sm leading-7 text-espresso">
                After booking, Ariane&apos;s team reviews your request and confirms via
                email or phone. A deposit may be required for longer appointments.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
