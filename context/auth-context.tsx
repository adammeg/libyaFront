"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import axios from "axios"

type User = {
  username: string;
  role: string;
  id: string;
}

type AuthState = {
  user: User | null;
  token: string | null;
}

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedToken = localStorage.getItem("libya-auto-token")
    const storedUser = localStorage.getItem("libya-auto-user")
    
    if (storedToken && storedUser) {
      try {
        setAuthState({
          token: storedToken,
          user: JSON.parse(storedUser)
        })
        
        // Configure axios to use the token for all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      } catch (e) {
        console.error("Failed to restore authentication state", e)
        localStorage.removeItem("libya-auto-token")
        localStorage.removeItem("libya-auto-user")
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await axios.post(`${apiBaseUrl}/auth/login`, {
        username,
        password
      })
      
      const { user, token } = response.data
      
      // Save to state
      setAuthState({ user, token })
      
      // Save to localStorage
      localStorage.setItem("libya-auto-token", token)
      localStorage.setItem("libya-auto-user", JSON.stringify(user))
      
      // Configure axios to use the token for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.response?.data?.message || "Login failed")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear state
    setAuthState({ user: null, token: null })
    
    // Clear localStorage
    localStorage.removeItem("libya-auto-token")
    localStorage.removeItem("libya-auto-user")
    
    // Remove Authorization header
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        login,
        logout,
        isAuthenticated: !!authState.token,
        isLoading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 