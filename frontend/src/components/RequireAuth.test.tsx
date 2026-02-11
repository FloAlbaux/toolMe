import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'

vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

async function getUseAuth() {
  const { useAuth } = await import('../context/useAuth')
  return useAuth as ReturnType<typeof vi.fn>
}

describe('RequireAuth', () => {
  it('redirects to /login when not authenticated', async () => {
    const useAuth = await getUseAuth()
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false })
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<RequireAuth><span>Protected content</span></RequireAuth>} />
          <Route path="/login" element={<span>Login page</span>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', async () => {
    const useAuth = await getUseAuth()
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true })
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<RequireAuth><span>Protected content</span></RequireAuth>} />
          <Route path="/login" element={<span>Login page</span>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })
})
