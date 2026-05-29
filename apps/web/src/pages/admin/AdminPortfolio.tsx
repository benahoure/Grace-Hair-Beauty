import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'

import { PageMeta } from '../../components/seo/PageMeta'
import { api } from '../../lib/api'
import { shortDate } from '../../lib/format'
import type { PortfolioItem } from '../../types'
import { AdminPageShell } from './AdminDashboard'

export function AdminPortfolio() {
  const queryClient = useQueryClient()

  const { data, isPending, isError } = useQuery({
    queryKey: ['admin-portfolio'],
    queryFn: api.getAdminPortfolio,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Pick<PortfolioItem, 'active' | 'featured'>> }) =>
      api.updatePortfolio(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-portfolio'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePortfolio(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-portfolio'] }),
  })

  const items = data?.portfolio ?? []
  const isMutating = updateMutation.isPending || deleteMutation.isPending

  function handleDelete(item: PortfolioItem) {
    if (window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(item.styleId)
    }
  }

  return (
    <>
      <PageMeta title="Portfolio | Admin" description="" canonical="" />
      <AdminPageShell
        title="Portfolio"
        intro="Toggle items visible or featured. Delete items that are no longer relevant."
      >
        {isPending && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="aspect-square animate-pulse rounded-xl bg-cream-deep" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-error">Failed to load portfolio. Please refresh.</p>
        )}

        {!isPending && !isError && items.length === 0 && (
          <div className="rounded-xl border border-cream-border bg-paper p-10 text-center">
            <p className="text-sm text-mocha/60">No portfolio items yet.</p>
          </div>
        )}

        {!isPending && !isError && items.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <PortfolioAdminCard
                key={item.styleId}
                item={item}
                onToggleActive={() =>
                  updateMutation.mutate({
                    id: item.styleId,
                    body: { active: !item.active, ...(item.active ? { featured: false } : {}) },
                  })
                }
                onToggleFeatured={() =>
                  updateMutation.mutate({ id: item.styleId, body: { featured: !item.featured } })
                }
                onDelete={() => handleDelete(item)}
                isUpdating={isMutating}
              />
            ))}
          </div>
        )}
      </AdminPageShell>
    </>
  )
}

function PortfolioAdminCard({
  item,
  onToggleActive,
  onToggleFeatured,
  onDelete,
  isUpdating,
}: {
  item: PortfolioItem
  onToggleActive: () => void
  onToggleFeatured: () => void
  onDelete: () => void
  isUpdating: boolean
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-cream-border bg-paper shadow-soft"
      style={{ opacity: item.active ? 1 : 0.55 }}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={item.thumbnailUrl || item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-3">
        <p className="truncate text-xs font-semibold text-espresso">{item.title}</p>
        <p className="mt-0.5 text-[0.6rem] capitalize text-mocha/50">
          {item.category.replace(/-/g, ' ')} · {shortDate(item.createdAt)}
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={isUpdating}
            onClick={onToggleActive}
            className="rounded px-2 py-0.5 text-[0.65rem] font-semibold disabled:opacity-40"
            style={
              item.active
                ? { background: 'rgba(34,197,94,0.12)', color: '#166534' }
                : { background: 'rgba(0,0,0,0.07)', color: '#555' }
            }
          >
            {item.active ? 'Active' : 'Hidden'}
          </button>

          {item.active && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={onToggleFeatured}
              className="rounded px-2 py-0.5 text-[0.65rem] font-semibold disabled:opacity-40"
              style={
                item.featured
                  ? { background: 'rgba(212,168,67,0.15)', color: '#92400e' }
                  : { background: 'rgba(0,0,0,0.07)', color: '#555' }
              }
            >
              {item.featured ? 'Featured' : 'Not featured'}
            </button>
          )}

          <button
            type="button"
            disabled={isUpdating}
            onClick={onDelete}
            className="ml-auto rounded p-0.5 text-error/60 transition-colors hover:text-error disabled:opacity-40"
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
