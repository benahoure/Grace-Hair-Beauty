import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { PageMeta } from '../../components/seo/PageMeta'
import { api } from '../../lib/api'
import { formatPhone, shortDate } from '../../lib/format'
import type { AdminAppointment } from '../../types'
import { AdminPageShell } from './AdminDashboard'

const STATUS_TABS = ['pending', 'confirmed', 'cancelled', 'completed', 'all'] as const
type StatusFilter = typeof STATUS_TABS[number]

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: 'rgba(251,191,36,0.12)',  color: '#92400e' },
  confirmed: { bg: 'rgba(34,197,94,0.12)',   color: '#166534' },
  cancelled: { bg: 'rgba(239,68,68,0.12)',   color: '#991b1b' },
  completed: { bg: 'rgba(59,130,246,0.12)',  color: '#1e40af' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg: 'rgba(0,0,0,0.06)', color: '#555' }
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  )
}

export function AdminAppointments() {
  const [filter, setFilter] = useState<StatusFilter>('pending')
  const queryClient = useQueryClient()

  const { data, isPending, isError } = useQuery({
    queryKey: ['admin-appointments', filter],
    queryFn: () => api.getAdminAppointments(filter !== 'all' ? { status: filter } : {}),
  })

  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
      adminNote,
    }: {
      id: string
      status: 'confirmed' | 'cancelled' | 'completed'
      adminNote?: string
    }) => api.updateAppointment(id, { status, adminNote: adminNote?.trim() || null }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-appointments'] }),
  })

  const appointments = data?.appointments ?? []

  return (
    <>
      <PageMeta title="Appointments | Admin" description="" canonical="" />
      <AdminPageShell
        title="Appointments"
        intro="Review booking requests and update their status."
      >
        {/* Filter tabs */}
        <div className="mb-6 flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === tab
                  ? 'bg-cocoa text-cream'
                  : 'bg-cream-deep text-mocha hover:bg-cream-border'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isPending && (
          <div className="grid gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 animate-pulse rounded-xl bg-cream-deep" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-error">Failed to load appointments. Please refresh.</p>
        )}

        {!isPending && !isError && appointments.length === 0 && (
          <div className="rounded-xl border border-cream-border bg-paper p-10 text-center">
            <p className="text-sm text-mocha/60">
              No {filter !== 'all' ? filter : ''} appointments.
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {appointments.map((apt) => (
            <AppointmentCard
              key={apt.appointmentId}
              apt={apt}
              onUpdate={(status, adminNote) => mutation.mutate({ id: apt.appointmentId, status, adminNote })}
              isUpdating={mutation.isPending}
            />
          ))}
        </div>
      </AdminPageShell>
    </>
  )
}

function AppointmentCard({
  apt,
  onUpdate,
  isUpdating,
}: {
  apt: AdminAppointment
  onUpdate: (status: 'confirmed' | 'cancelled' | 'completed', adminNote?: string) => void
  isUpdating: boolean
}) {
  // pending action state: which button was clicked, waiting for note input
  const [pendingAction, setPendingAction] = useState<'confirmed' | 'cancelled' | null>(null)
  const [note, setNote] = useState('')

  function submitWithNote() {
    if (!pendingAction) return
    onUpdate(pendingAction, note)
    setPendingAction(null)
    setNote('')
  }

  function cancelAction() {
    setPendingAction(null)
    setNote('')
  }

  return (
    <div className="rounded-xl border border-cream-border bg-paper shadow-soft">
      <div className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-espresso">{apt.clientName}</p>
              <StatusBadge status={apt.status} />
            </div>
            <p className="mt-0.5 text-sm font-medium text-mocha">{apt.serviceName}</p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-mocha/65">
              <span>{apt.preferredDate} at {apt.preferredTime}</span>
              <span>{formatPhone(apt.clientPhone)}</span>
              <span>{apt.clientEmail}</span>
              {apt.referralSource && <span>via {apt.referralSource}</span>}
            </div>
            {apt.notes && (
              <p className="mt-2 text-xs italic text-mocha/55">"{apt.notes}"</p>
            )}
            {apt.adminNote && (
              <p className="mt-1 text-xs font-medium text-gold-dark">Admin note: {apt.adminNote}</p>
            )}
            <p className="mt-2 text-[0.65rem] text-mocha/40">Received {shortDate(apt.createdAt)}</p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {apt.status === 'pending' && !pendingAction && (
              <>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setPendingAction('confirmed')}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#166534' }}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setPendingAction('cancelled')}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#991b1b' }}
                >
                  Cancel
                </button>
              </>
            )}
            {apt.status === 'confirmed' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onUpdate('completed')}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                style={{ background: 'rgba(59,130,246,0.12)', color: '#1e40af' }}
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline note panel — shown after clicking Confirm or Cancel */}
      {pendingAction && (
        <div
          className="border-t px-5 pb-5 pt-4"
          style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.015)' }}
        >
          <p className="mb-2 text-xs font-semibold" style={{
            color: pendingAction === 'confirmed' ? '#166534' : '#991b1b',
          }}>
            {pendingAction === 'confirmed' ? 'Confirming appointment' : 'Cancelling appointment'}
            {' '}— add a note for your records (optional)
          </p>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Confirmed via phone call · Cancelled — client rescheduled"
            autoFocus
            className="w-full resize-none rounded-lg border border-cream-border bg-white px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-gold-dark/40"
          />
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              disabled={isUpdating}
              onClick={submitWithNote}
              className="rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
              style={{
                background: pendingAction === 'confirmed' ? '#166534' : '#991b1b',
              }}
            >
              {isUpdating
                ? 'Saving…'
                : pendingAction === 'confirmed'
                  ? 'Confirm Appointment'
                  : 'Cancel Appointment'}
            </button>
            <button
              type="button"
              onClick={cancelAction}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-mocha/60 hover:text-mocha"
            >
              Go back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
