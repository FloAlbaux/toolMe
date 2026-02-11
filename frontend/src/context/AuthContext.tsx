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
  login as apiLogin,
  logout as apiLogout,
  me,
  type LoginInput,
} from '../api/auth'

type AuthState = {
  email: string | null
  isAuthenticated: boolean
  loading: boolean
}

type AuthContextValue = AuthState & {
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<AuthState>({
    email: null,
    isAuthenticated: false,
    loading: true,
  })

  useEffect(() => {
    me()
      .then((user) => {
        setState({
          email: user?.email ?? null,
          isAuthenticated: !!user,
          loading: false,
        })
      })
      .catch(() => {
        setState({ email: null, isAuthenticated: false, loading: false })
      })
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    await apiLogin(input)
    const user = await me()
    setState({
      email: user?.email ?? null,
      isAuthenticated: !!user,
      loading: false,
    })
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setState({ email: null, isAuthenticated: false, loading: false })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout }),
    [state.email, state.isAuthenticated, state.loading, login, logout]
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
