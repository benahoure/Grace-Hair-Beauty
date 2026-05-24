import { useQuery } from '@tanstack/react-query'

import { ServiceCard } from '../../components/ui/ServiceCard'
import { api } from '../../lib/api'
import { AdminPageShell } from './AdminDashboard'

export function AdminServices() {
  const services = useQuery({ queryKey: ['admin-services'], queryFn: () => api.getServices() })

  return (
    <AdminPageShell title="Services" intro="Create, edit, feature, and deactivate salon services.">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.data?.services.map((service) => <ServiceCard key={service.serviceId} service={service} />)}
      </div>
    </AdminPageShell>
  )
}
