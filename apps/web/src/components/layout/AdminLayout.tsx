import { Outlet } from 'react-router-dom'

// Minimal wrapper for admin pages — no public Header, Footer, or StickyBookingBar.
export function AdminLayout() {
  return (
    <main id="main-content">
      <Outlet />
    </main>
  )
}
