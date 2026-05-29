import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { PageMeta } from '../../components/seo/PageMeta'
import { api } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import type { SalonService } from '../../types'
import { AdminPageShell } from './AdminDashboard'

export function AdminServices() {
  const queryClient = useQueryClient()

  const { data, isPending, isError } = useQuery({
    queryKey: ['admin-services'],
    queryFn: api.getAdminServices,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Pick<SalonService, 'active' | 'featured'>> }) =>
      api.updateService(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-services'] }),
  })

  const services = data?.services ?? []
  const active = services.filter((s) => s.active)
  const inactive = services.filter((s) => !s.active)

  return (
    <>
      <PageMeta title="Services | Admin" description="" canonical="" />
      <AdminPageShell
        title="Services"
        intro="Toggle services active or featured. Active services appear on the public booking page."
      >
        {isPending && (
          <div className="grid gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-16 animate-pulse rounded-xl bg-cream-deep" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-error">Failed to load services. Please refresh.</p>
        )}

        {!isPending && !isError && (
          <div className="space-y-6">
            <ServiceSection
              title="Active services"
              services={active}
              onToggle={(id, body) => updateMutation.mutate({ id, body })}
              isUpdating={updateMutation.isPending}
            />
            {inactive.length > 0 && (
              <ServiceSection
                title="Inactive services"
                services={inactive}
                onToggle={(id, body) => updateMutation.mutate({ id, body })}
                isUpdating={updateMutation.isPending}
              />
            )}
          </div>
        )}
      </AdminPageShell>
    </>
  )
}

function ServiceSection({
  title,
  services,
  onToggle,
  isUpdating,
}: {
  title: string
  services: SalonService[]
  onToggle: (id: string, body: Partial<Pick<SalonService, 'active' | 'featured'>>) => void
  isUpdating: boolean
}) {
  if (services.length === 0) return null

  return (
    <div>
      <h2 className="mb-3 text-[0.7rem] font-bold uppercase tracking-widest text-cocoa/50">{title}</h2>
      <div className="grid gap-2">
        {services.map((service) => (
          <ServiceRow
            key={service.serviceId}
            service={service}
            onToggle={onToggle}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  )
}

function ServiceRow({
  service,
  onToggle,
  isUpdating,
}: {
  service: SalonService
  onToggle: (id: string, body: Partial<Pick<SalonService, 'active' | 'featured'>>) => void
  isUpdating: boolean
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-4 rounded-xl border border-cream-border bg-paper px-4 py-3.5 shadow-soft">
        {service.imageUrl && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="shrink-0 overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-dark/40"
            title="Click to enlarge"
          >
            <img
              src={service.imageUrl}
              alt={service.name}
              className="h-12 w-12 object-cover transition-opacity hover:opacity-80"
              style={{ imageRendering: 'auto' }}
            />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-espresso">{service.name}</p>
          <p className="mt-0.5 text-xs text-mocha/60 capitalize">
            {service.category.replace(/-/g, ' ')} · {service.durationMinutes} min · from {formatPrice(service.startingPrice)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Toggle
            label="Featured"
            checked={service.featured}
            disabled={!service.active || isUpdating}
            onChange={(v) => onToggle(service.serviceId, { featured: v })}
          />
          <Toggle
            label={service.active ? 'Active' : 'Inactive'}
            checked={service.active}
            disabled={isUpdating}
            onChange={(v) => onToggle(service.serviceId, { active: v, ...(v ? {} : { featured: false }) })}
            activeColor="green"
          />
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          src={service.imageUrl}
          alt={service.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
        />
        <p className="mt-3 text-center text-sm font-semibold text-white/80">{alt}</p>
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-espresso shadow-lg hover:bg-white"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  disabled,
  onChange,
  activeColor = 'gold',
}: {
  label: string
  checked: boolean
  disabled: boolean
  onChange: (v: boolean) => void
  activeColor?: 'gold' | 'green'
}) {
  const trackOn = activeColor === 'green' ? '#16a34a' : '#b8912a'
  return (
    <label className="flex cursor-pointer flex-col items-center gap-1">
      <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-mocha/50">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative h-5 w-9 rounded-full transition-colors disabled:opacity-40"
        style={{ background: checked ? trackOn : 'rgba(0,0,0,0.12)' }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
          style={{ left: '2px', transform: checked ? 'translateX(16px)' : 'none' }}
        />
      </button>
    </label>
  )
}
