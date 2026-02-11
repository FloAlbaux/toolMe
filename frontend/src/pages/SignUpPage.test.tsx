import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SignUpPage } from './SignUpPage'
import * as authApi from '../api/auth'

vi.mock('../api/auth', () => ({
  signUp: vi.fn(),
}))

const mockLogin = vi.fn()
vi.mock('../context/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.mocked(authApi.signUp).mockReset()
    mockLogin.mockReset()
  })

  it('renders sign up form', () => {
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 2, name: /create an account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('disables submit when password too short or passwords do not match', () => {
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'short' } })
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
  })

  it('calls signUp and login then navigates on success', async () => {
    vi.mocked(authApi.signUp).mockResolvedValue({ id: '1', email: 'user@example.com' })
    mockLogin.mockResolvedValue(undefined)
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/" element={<span>Home</span>} />
        </Routes>
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'longpassword123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'longpassword123' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText('Home')).toBeInTheDocument()
    expect(authApi.signUp).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'longpassword123',
      password_confirm: 'longpassword123',
    })
    expect(mockLogin).toHaveBeenCalledWith({ email: 'user@example.com', password: 'longpassword123' })
  })

  it('shows error when signUp fails', async () => {
    vi.mocked(authApi.signUp).mockRejectedValue(new Error('Email already registered'))
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'longpassword123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'longpassword123' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Email already registered')
  })
})
