import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LoginPage } from './LoginPage'

const mockLogin = vi.fn()
vi.mock('../context/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset()
  })

  it('renders login form with email and password fields', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 2, name: /log in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create account/i })).toHaveAttribute('href', '/signup')
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/')
  })

  it('calls login and navigates on success', async () => {
    mockLogin.mockResolvedValue(undefined)
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<span>Home</span>} />
        </Routes>
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(mockLogin).toHaveBeenCalledWith({ email: 'user@example.com', password: 'password123' })
    expect(await screen.findByText('Home')).toBeInTheDocument()
  })

  it('shows error when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'))
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials')
  })
})
