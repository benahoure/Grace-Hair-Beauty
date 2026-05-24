import { useBusinessSettings } from '../../hooks/useBusinessSettings'
import { formatAddress, formatHours, formatPhone } from '../../lib/format'
import { defaultBusinessSettings } from '../../lib/mockData'
import { AdminPageShell, AdminPanel } from './AdminDashboard'

export function AdminSettings() {
  const { data } = useBusinessSettings()
  const settings = data ?? defaultBusinessSettings

  return (
    <AdminPageShell
      title="Business Settings"
      intro="Business contact details come from the BusinessSettings API and are reflected across the public site."
    >
      <AdminPanel title="Current public settings">
        <dl className="grid gap-3">
          <div>
            <dt className="font-semibold text-cocoa">Business</dt>
            <dd>{settings.businessName}</dd>
          </div>
          <div>
            <dt className="font-semibold text-cocoa">Phone</dt>
            <dd>{formatPhone(settings.phone)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-cocoa">Email</dt>
            <dd>{settings.email}</dd>
          </div>
          <div>
            <dt className="font-semibold text-cocoa">Address</dt>
            <dd>{formatAddress(settings)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-cocoa">Hours</dt>
            <dd>{formatHours(settings)}</dd>
          </div>
        </dl>
      </AdminPanel>
    </AdminPageShell>
  )
}
