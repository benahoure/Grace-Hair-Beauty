import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { HeroSection } from '../components/hero/HeroSection'

interface MediaOptions {
  desktop?: boolean
  reduced?: boolean
}

function mockMedia({ desktop = false, reduced = true }: MediaOptions = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion')
        ? reduced
        : query.includes('min-width')
          ? desktop
          : query.includes('max-width')
            ? !desktop
            : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('HeroSection', () => {
  function renderHero(media?: MediaOptions) {
    mockMedia(media)
    const queryClient = new QueryClient()
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HeroSection />
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('renders the headline, mobile booking CTA, portfolio CTA, and trust row', () => {
    renderHero()
    expect(screen.getByRole('heading', { name: /elegance, speed\. exceptional service\./i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /book your appointment/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view our work/i })).toBeInTheDocument()
    expect(screen.getByText(/15\+ years/i)).toBeInTheDocument()
    expect(screen.getByText(/of experience/i)).toBeInTheDocument()
  })

  it('renders the visual showcase with navigation controls', () => {
    renderHero({ desktop: true, reduced: true })
    expect(screen.getByTestId('hero-visual-showcase')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /hairstyle showcase navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show african braids/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show knotless braids/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show boho braids/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show protective styles/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show natural hair/i })).toBeInTheDocument()
  })

  it('renders hero images with meaningful alt text', () => {
    renderHero()
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThanOrEqual(3)
    images.forEach((img) => {
      expect(img).toHaveAttribute('alt')
      expect(img.getAttribute('alt')).not.toBe('')
    })
  })
})
