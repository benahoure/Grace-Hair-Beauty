import { useQuery } from '@tanstack/react-query'

import { PortfolioCard } from '../../components/ui/PortfolioCard'
import { api } from '../../lib/api'
import { AdminPageShell } from './AdminDashboard'

export function AdminPortfolio() {
  const portfolio = useQuery({ queryKey: ['admin-portfolio'], queryFn: () => api.getPortfolio() })

  return (
    <AdminPageShell title="Portfolio" intro="Upload and organize real client work after images are optimized and stored in the assets bucket.">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {portfolio.data?.items.map((item) => <PortfolioCard key={item.styleId} item={item} onOpen={() => undefined} />)}
      </div>
    </AdminPageShell>
  )
}
