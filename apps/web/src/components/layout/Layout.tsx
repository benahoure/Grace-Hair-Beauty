import { Outlet, useLocation } from 'react-router-dom'

import { defaultBusinessSettings } from '../../lib/mockData'
import { LocalBusinessSchema } from '../seo/LocalBusinessSchema'
import { useBusinessSettings } from '../../hooks/useBusinessSettings'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout() {
  const { data } = useBusinessSettings()
  const settings = data ?? defaultBusinessSettings
  const { pathname } = useLocation()

  return (
    <>
      <a href="#main-content" className="skip-link sr-only">
        Skip to main content
      </a>
      <LocalBusinessSchema settings={settings} />
      <Header settings={settings} />
      {/* Header is position:fixed — inner pages need padding-top so content
          starts below it. Homepage has no padding; the hero fills from y=0. */}
      <main
        id="main-content"
        style={pathname === '/' ? undefined : { paddingTop: 'var(--header-height)' }}
      >
        <Outlet />
      </main>
      <Footer settings={settings} />
    </>
  )
}
