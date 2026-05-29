import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { useState } from 'react'

import { PageMeta } from '../../components/seo/PageMeta'
import { api } from '../../lib/api'
import { shortDate } from '../../lib/format'
import type { AdminReview } from '../../types'
import { AdminPageShell } from './AdminDashboard'

const FILTER_TABS = ['pending', 'approved', 'all'] as const
type ReviewFilter = typeof FILTER_TABS[number]

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={n <= rating ? 'fill-gold-dark text-gold-dark' : 'fill-cream-border text-cream-border'}
        />
      ))}
    </span>
  )
}

export function AdminReviews() {
  const [filter, setFilter] = useState<ReviewFilter>('pending')
  const queryClient = useQueryClient()

  const { data, isPending, isError } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: api.getAdminReviews,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { approved?: boolean; featured?: boolean } }) =>
      api.updateReview(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  })

  const allReviews = data?.reviews ?? []
  const reviews = allReviews.filter((r) => {
    if (filter === 'pending') return !r.approved
    if (filter === 'approved') return r.approved
    return true
  })

  const isMutating = updateMutation.isPending || deleteMutation.isPending

  return (
    <>
      <PageMeta title="Reviews | Admin" description="" canonical="" />
      <AdminPageShell
        title="Reviews"
        intro="Approve or remove submitted reviews before they appear publicly."
      >
        <div className="mb-6 flex flex-wrap gap-1.5">
          {FILTER_TABS.map((tab) => (
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
              <div key={n} className="h-28 animate-pulse rounded-xl bg-cream-deep" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-error">Failed to load reviews. Please refresh.</p>
        )}

        {!isPending && !isError && reviews.length === 0 && (
          <div className="rounded-xl border border-cream-border bg-paper p-10 text-center">
            <p className="text-sm text-mocha/60">No {filter !== 'all' ? filter : ''} reviews.</p>
          </div>
        )}

        <div className="grid gap-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.reviewId}
              review={review}
              onApprove={() => updateMutation.mutate({ id: review.reviewId, body: { approved: true } })}
              onRevoke={() => updateMutation.mutate({ id: review.reviewId, body: { approved: false } })}
              onToggleFeatured={() =>
                updateMutation.mutate({ id: review.reviewId, body: { featured: !review.featured } })
              }
              onDelete={() => {
                if (window.confirm(`Delete review from ${review.clientName}? This cannot be undone.`)) {
                  deleteMutation.mutate(review.reviewId)
                }
              }}
              isUpdating={isMutating}
            />
          ))}
        </div>
      </AdminPageShell>
    </>
  )
}

function ReviewCard({
  review,
  onApprove,
  onRevoke,
  onToggleFeatured,
  onDelete,
  isUpdating,
}: {
  review: AdminReview
  onApprove: () => void
  onRevoke: () => void
  onToggleFeatured: () => void
  onDelete: () => void
  isUpdating: boolean
}) {
  return (
    <div className="rounded-xl border border-cream-border bg-paper p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-espresso">{review.clientName}</p>
            <StarRating rating={review.rating} />
            {review.approved ? (
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                Approved
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                Pending
              </span>
            )}
            {review.featured && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                Featured
              </span>
            )}
          </div>
          {review.serviceName && (
            <p className="mt-0.5 text-xs font-medium text-mocha">{review.serviceName}</p>
          )}
          <p className="mt-2 text-sm text-espresso">"{review.body}"</p>
          <p className="mt-2 text-[0.65rem] text-mocha/40">
            via {review.source} · {shortDate(review.createdAt)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {!review.approved ? (
            <button
              type="button"
              disabled={isUpdating}
              onClick={onApprove}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#166534' }}
            >
              Approve
            </button>
          ) : (
            <button
              type="button"
              disabled={isUpdating}
              onClick={onRevoke}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              style={{ background: 'rgba(251,191,36,0.12)', color: '#92400e' }}
            >
              Revoke
            </button>
          )}
          <button
            type="button"
            disabled={isUpdating}
            onClick={onToggleFeatured}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            style={{ background: 'rgba(59,130,246,0.12)', color: '#1e40af' }}
          >
            {review.featured ? 'Unfeature' : 'Feature'}
          </button>
          <button
            type="button"
            disabled={isUpdating}
            onClick={onDelete}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#991b1b' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
