'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface User {
  id: number
  username: string
  email: string
  totalScore: number
  gamesPlayed: number
  createdAt: string
}

interface AuthState {
  authenticated: boolean
  user: User | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  checkAuth: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    user: null,
    loading: true,
  })

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        // Next.js fetch usually handles credentials correctly, but we ensure it here
        cache: 'no-store'
      })

      if (res.ok) {
        const data = await res.json()
        setAuthState({
          authenticated: true,
          user: data.user,
          loading: false,
        })
      } else {
        setAuthState({
          authenticated: false,
          user: null,
          loading: false,
        })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setAuthState({
        authenticated: false,
        user: null,
        loading: false,
      })
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
      })
      setAuthState({
        authenticated: false,
        user: null,
        loading: false,
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await checkAuth()
    }
    init()
  }, [checkAuth])

  return (
    <AuthContext.Provider value={{ ...authState, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
