import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AdminLayout } from './components/layout/AdminLayout'
import { Layout } from './components/layout/Layout'
import { ScrollToTop } from './components/ScrollToTop'
import { adminIsAuthenticated } from './lib/auth'
import { About } from './pages/About'
import { Book } from './pages/Book'
import { Contact } from './pages/Contact'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Portfolio } from './pages/Portfolio'
import { Products } from './pages/Products'
import { Reviews } from './pages/Reviews'
import { Services } from './pages/Services'
import { AppointmentPortal } from './pages/AppointmentPortal'
import { BookingSuccess } from './pages/BookingSuccess'
import { AdminAppointments } from './pages/admin/AdminAppointments'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminMessages } from './pages/admin/AdminMessages'
import { AdminPortfolio } from './pages/admin/AdminPortfolio'
import { AdminReviews } from './pages/admin/AdminReviews'
import { AdminRoot } from './pages/admin/AdminRoot'
import { AdminServices } from './pages/admin/AdminServices'
import { AdminSettings } from './pages/admin/AdminSettings'

function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  if (!adminIsAuthenticated()) {
    return <Navigate to="/admin" replace state={{ from: location }} />
  }
  return children
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* ── Public pages — shared Header + Footer + StickyBar ── */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="products" element={<Products />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="book" element={<Book />} />
        <Route path="about" element={<About />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="contact" element={<Contact />} />
        <Route path="appointment/:token" element={<AppointmentPortal />} />
        <Route path="booking/success" element={<BookingSuccess />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ── Admin login — standalone, no sidebar ── */}
      <Route path="admin" element={<AdminRoot />} />

      {/* ── Admin pages — no public Header, Footer, or StickyBar ── */}
      <Route element={<AdminLayout />}>
        <Route
          path="admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="admin/appointments"
          element={
            <ProtectedAdminRoute>
              <AdminAppointments />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="admin/messages"
          element={
            <ProtectedAdminRoute>
              <AdminMessages />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="admin/services"
          element={
            <ProtectedAdminRoute>
              <AdminServices />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="admin/portfolio"
          element={
            <ProtectedAdminRoute>
              <AdminPortfolio />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="admin/reviews"
          element={
            <ProtectedAdminRoute>
              <AdminReviews />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="admin/settings"
          element={
            <ProtectedAdminRoute>
              <AdminSettings />
            </ProtectedAdminRoute>
          }
        />
      </Route>
    </Routes>
    </>
  )
}
