import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as cognito from '../lib/cognitoClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const session = await cognito.getCurrentSession().catch(() => null)
    setUser(session)
    return session
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const login = async (email, password) => {
    await cognito.signIn(email, password)
    return refresh()
  }

  const logout = () => {
    cognito.signOut()
    setUser(null)
  }

  const value = { user, loading, isAuthenticated: !!user, login, logout, refresh }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
