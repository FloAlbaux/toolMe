import {
  useCallback,
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
import { AuthContext } from './authContext'
import type { AuthContextValue, AuthState } from './authContext'

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<AuthState>({
    userId: null,
    email: null,
    isAuthenticated: false,
    loading: true,
  })

  useEffect(() => {
    me()
      .then((user) => {
        setState({
          userId: user?.id ?? null,
          email: user?.email ?? null,
          isAuthenticated: !!user,
          loading: false,
        })
      })
      .catch(() => {
        setState({ userId: null, email: null, isAuthenticated: false, loading: false })
      })
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    await apiLogin(input)
    const user = await me()
    setState({
      userId: user?.id ?? null,
      email: user?.email ?? null,
      isAuthenticated: !!user,
      loading: false,
    })
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setState({ userId: null, email: null, isAuthenticated: false, loading: false })
  }, [])

  const refreshUser = useCallback(async () => {
    const user = await me()
    setState({
      userId: user?.id ?? null,
      email: user?.email ?? null,
      isAuthenticated: !!user,
      loading: false,
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, refreshUser }),
    [state, login, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
