'use client'

import { useState, useEffect } from 'react'

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

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    user: null,
    loading: true,
  })

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
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
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
        credentials: 'include',
      })
      setAuthState({
        authenticated: false,
        user: null,
        loading: false,
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return {
    ...authState,
    checkAuth,
    logout,
  }
}