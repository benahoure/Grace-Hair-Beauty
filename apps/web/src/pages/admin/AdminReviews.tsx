import { useQuery } from '@tanstack/react-query'

import { ReviewCard } from '../../components/ui/ReviewCard'
import { api } from '../../lib/api'
import { AdminPageShell, AdminPanel } from './AdminDashboard'

export function AdminReviews() {
  const reviews = useQuery({ queryKey: ['admin-reviews'], queryFn: api.getReviews })

  return (
    <AdminPageShell title="Reviews" intro="Approve, reject, or remove submitted reviews before they appear publicly.">
      {reviews.data?.reviews.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.data.reviews.map((review) => <ReviewCard key={review.reviewId} review={review} />)}
        </div>
      ) : (
        <AdminPanel title="No reviews waiting">Submitted reviews will appear here for moderation.</AdminPanel>
      )}
    </AdminPageShell>
  )
}
