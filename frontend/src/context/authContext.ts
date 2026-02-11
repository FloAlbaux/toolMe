import { createContext } from 'react'
import type { LoginInput } from '../api/auth'

export type AuthState = {
  email: string | null
  isAuthenticated: boolean
  loading: boolean
}

export type AuthContextValue = AuthState & {
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
