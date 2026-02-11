import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import {
  getStoredToken,
  clearStoredToken,
  setStoredToken,
  decodeTokenPayload,
  login as apiLogin,
  type LoginInput,
} from '../api/auth'

type AuthState = {
  token: string | null
  email: string | null
  isAuthenticated: boolean
}

type AuthContextValue = AuthState & {
  login: (input: LoginInput) => Promise<void>
  logout: () => void
  setToken: (token: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredAuth(): AuthState {
  const token = getStoredToken()
  if (!token) {
    return { token: null, email: null, isAuthenticated: false }
  }
  const payload = decodeTokenPayload(token)
  const email = payload?.email ?? null
  return { token, email, isAuthenticated: true }
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<AuthState>(readStoredAuth)

  useEffect(() => {
    const token = getStoredToken()
    if (token) {
      const payload = decodeTokenPayload(token)
      setState({ token, email: payload?.email ?? null, isAuthenticated: true })
    }
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    const { access_token } = await apiLogin(input)
    setStoredToken(access_token)
    const payload = decodeTokenPayload(access_token)
    setState({
      token: access_token,
      email: payload?.email ?? null,
      isAuthenticated: true,
    })
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setState({ token: null, email: null, isAuthenticated: false })
  }, [])

  const setToken = useCallback((token: string) => {
    setStoredToken(token)
    const payload = decodeTokenPayload(token)
    setState({
      token,
      email: payload?.email ?? null,
      isAuthenticated: true,
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, setToken }),
    [state.token, state.email, state.isAuthenticated, login, logout, setToken]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
