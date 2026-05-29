import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { PageMeta } from '../../components/seo/PageMeta'
import { api } from '../../lib/api'
import { defaultBusinessSettings } from '../../lib/mockData'
import type { BusinessSettings, DayName } from '../../types'
import { AdminPageShell } from './AdminDashboard'

const DAYS: DayName[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-cocoa" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-cream-border bg-cream px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-gold-dark/40"
      />
    </div>
  )
}

export function AdminSettings() {
  const queryClient = useQueryClient()

  const { data, isPending } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: api.getAdminSettings,
  })

  const settings = data ?? defaultBusinessSettings

  const [form, setForm] = useState<BusinessSettings>(settings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const mutation = useMutation({
    mutationFn: (body: Partial<BusinessSettings>) => api.updateSettings(body),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin-settings'], updated)
      queryClient.invalidateQueries({ queryKey: ['business-settings'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  function set<K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate(form)
  }

  if (isPending) {
    return (
      <AdminPageShell title="Settings" intro="Edit business details displayed on the public site.">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-12 animate-pulse rounded-xl bg-cream-deep" />
          ))}
        </div>
      </AdminPageShell>
    )
  }

  return (
    <>
      <PageMeta title="Settings | Admin" description="" canonical="" />
      <AdminPageShell
        title="Settings"
        intro="Edit business details that appear on the public site."
        action={
          saved ? (
            <span className="text-sm font-semibold text-green-700">Saved!</span>
          ) : undefined
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact */}
          <section className="rounded-xl border border-cream-border bg-paper p-6 shadow-soft">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-cocoa/60">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Business Name"
                name="businessName"
                value={form.businessName}
                onChange={(v) => set('businessName', v)}
              />
              <Field
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={(v) => set('phone', v)}
              />
              <Field
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={(v) => set('email', v)}
              />
            </div>
          </section>

          {/* Address */}
          <section className="rounded-xl border border-cream-border bg-paper p-6 shadow-soft">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-cocoa/60">Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label="Street"
                  name="street"
                  value={form.address.street}
                  onChange={(v) => set('address', { ...form.address, street: v })}
                />
              </div>
              <Field
                label="City"
                name="city"
                value={form.address.city}
                onChange={(v) => set('address', { ...form.address, city: v })}
              />
              <Field
                label="State"
                name="state"
                value={form.address.state}
                onChange={(v) => set('address', { ...form.address, state: v })}
              />
              <Field
                label="ZIP"
                name="zip"
                value={form.address.zip}
                onChange={(v) => set('address', { ...form.address, zip: v })}
              />
            </div>
          </section>

          {/* Hours */}
          <section className="rounded-xl border border-cream-border bg-paper p-6 shadow-soft">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-cocoa/60">Hours</h2>
            <div className="grid gap-3">
              {DAYS.map((day) => {
                const h = form.hours[day]
                return (
                  <div key={day} className="flex flex-wrap items-center gap-3">
                    <span className="w-24 shrink-0 text-xs font-semibold capitalize text-espresso">{day}</span>
                    <label className="flex items-center gap-1.5 text-xs text-mocha">
                      <input
                        type="checkbox"
                        checked={h.closed}
                        onChange={(e) =>
                          set('hours', { ...form.hours, [day]: { ...h, closed: e.target.checked } })
                        }
                        className="accent-cocoa"
                      />
                      Closed
                    </label>
                    {!h.closed && (
                      <>
                        <input
                          type="time"
                          value={h.open}
                          onChange={(e) =>
                            set('hours', { ...form.hours, [day]: { ...h, open: e.target.value } })
                          }
                          className="rounded-lg border border-cream-border bg-cream px-2 py-1.5 text-xs text-espresso focus:outline-none focus:ring-2 focus:ring-gold-dark/40"
                        />
                        <span className="text-xs text-mocha/50">–</span>
                        <input
                          type="time"
                          value={h.close}
                          onChange={(e) =>
                            set('hours', { ...form.hours, [day]: { ...h, close: e.target.value } })
                          }
                          className="rounded-lg border border-cream-border bg-cream px-2 py-1.5 text-xs text-espresso focus:outline-none focus:ring-2 focus:ring-gold-dark/40"
                        />
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Social & Links */}
          <section className="rounded-xl border border-cream-border bg-paper p-6 shadow-soft">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-cocoa/60">Social & Links</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Instagram URL"
                name="instagram"
                value={form.socialLinks.instagram ?? ''}
                onChange={(v) => set('socialLinks', { ...form.socialLinks, instagram: v || null })}
              />
              <Field
                label="Facebook URL"
                name="facebook"
                value={form.socialLinks.facebook ?? ''}
                onChange={(v) => set('socialLinks', { ...form.socialLinks, facebook: v || null })}
              />
              <Field
                label="TikTok URL"
                name="tiktok"
                value={form.socialLinks.tiktok ?? ''}
                onChange={(v) => set('socialLinks', { ...form.socialLinks, tiktok: v || null })}
              />
              <Field
                label="Google Maps URL"
                name="googleMapsUrl"
                value={form.googleMapsUrl}
                onChange={(v) => set('googleMapsUrl', v)}
              />
              <Field
                label="Google Review URL"
                name="googleReviewUrl"
                value={form.googleReviewUrl}
                onChange={(v) => set('googleReviewUrl', v)}
              />
            </div>
          </section>

          {/* Announcements */}
          <section className="rounded-xl border border-cream-border bg-paper p-6 shadow-soft">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-cocoa/60">Announcements</h2>
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-cocoa" htmlFor="announcementBanner">
                  Announcement Banner
                </label>
                <input
                  id="announcementBanner"
                  type="text"
                  value={form.announcementBanner ?? ''}
                  onChange={(e) => set('announcementBanner', e.target.value || null)}
                  placeholder="Leave blank to hide the banner"
                  className="w-full rounded-lg border border-cream-border bg-cream px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-gold-dark/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-cocoa" htmlFor="bookingNotice">
                  Booking Notice
                </label>
                <textarea
                  id="bookingNotice"
                  rows={2}
                  value={form.bookingNotice}
                  onChange={(e) => set('bookingNotice', e.target.value)}
                  className="w-full rounded-lg border border-cream-border bg-cream px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-gold-dark/40"
                />
              </div>
            </div>
          </section>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn btn-gold disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving…' : 'Save Settings'}
            </button>
            {mutation.isError && (
              <p className="text-sm text-error">Failed to save. Please try again.</p>
            )}
          </div>
        </form>
      </AdminPageShell>
    </>
  )
}
