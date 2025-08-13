import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'user' | 'admin'
  emailVerified: boolean
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on app load
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (token) {
          // In a real app, validate token with backend
          const storedUser = localStorage.getItem('user_data')
          if (storedUser) {
            setUser(JSON.parse(storedUser))
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Mock authentication - in real app, call backend API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email === 'demo@docsmart.ai' && password === 'demo123') {
        const mockUser: User = {
          id: '1',
          email,
          name: 'Demo User',
          role: 'user',
          emailVerified: true,
          createdAt: new Date()
        }
        
        const mockToken = 'mock_jwt_token_' + Date.now()
        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('user_data', JSON.stringify(mockUser))
        setUser(mockUser)
        toast.success('Welcome back!')
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Mock registration - in real app, call backend API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'user',
        emailVerified: false,
        createdAt: new Date()
      }
      
      const mockToken = 'mock_jwt_token_' + Date.now()
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('user_data', JSON.stringify(mockUser))
      setUser(mockUser)
      toast.success('Account created! Please check your email to verify your account.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const forgotPassword = async (email: string) => {
    setIsLoading(true)
    try {
      // Mock forgot password - in real app, call backend API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Password reset email sent! Check your inbox.')
    } catch (error) {
      toast.error('Failed to send password reset email')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true)
    try {
      // Mock password reset - in real app, call backend API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Password reset successfully! Please log in with your new password.')
    } catch (error) {
      toast.error('Password reset failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmail = async (token: string) => {
    setIsLoading(true)
    try {
      // Mock email verification - in real app, call backend API
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (user) {
        const updatedUser = { ...user, emailVerified: true }
        setUser(updatedUser)
        localStorage.setItem('user_data', JSON.stringify(updatedUser))
        toast.success('Email verified successfully!')
      }
    } catch (error) {
      toast.error('Email verification failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true)
    try {
      // Mock profile update - in real app, call backend API
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (user) {
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)
        localStorage.setItem('user_data', JSON.stringify(updatedUser))
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      toast.error('Profile update failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export type { User, AuthContextType }