import { AdminPageShell, AdminPanel } from './AdminDashboard'

export function AdminAppointments() {
  return (
    <AdminPageShell
      title="Appointments"
      intro="Review appointment requests, filter by status or date, and update booking status."
    >
      <AdminPanel title="Appointment queue">
        New deployments start with an empty queue. The API supports pending, confirmed, cancelled, and
        completed states with audit logging.
      </AdminPanel>
    </AdminPageShell>
  )
}
