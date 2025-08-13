import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  emailVerified: boolean
}

export interface UserProfile {
  id: string
  userId: string
  avatar?: string
  bio?: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: 'en' | 'ar'
    notifications: boolean
  }
}

export interface Subscription {
  id: string
  userId: string
  provider: 'stripe' | 'paddle' | 'paypal'
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid'
  plan: 'basic' | 'pro' | 'enterprise'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  paymentMethod: {
    type: 'card' | 'paypal'
    last4?: string
    brand?: string
  }
}

export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  subscription: Subscription | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  deleteAccount: () => Promise<void>
  exportUserData: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Mock authentication service
class AuthService {
  private users: Map<string, User> = new Map()
  private profiles: Map<string, UserProfile> = new Map()
  private subscriptions: Map<string, Subscription> = new Map()
  private sessions: Map<string, string> = new Map() // sessionId -> userId

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      const usersData = localStorage.getItem('auth_users')
      if (usersData) {
        const users = JSON.parse(usersData)
        this.users = new Map(Object.entries(users))
      }

      const profilesData = localStorage.getItem('auth_profiles')
      if (profilesData) {
        const profiles = JSON.parse(profilesData)
        this.profiles = new Map(Object.entries(profiles))
      }

      const subscriptionsData = localStorage.getItem('auth_subscriptions')
      if (subscriptionsData) {
        const subscriptions = JSON.parse(subscriptionsData)
        this.subscriptions = new Map(Object.entries(subscriptions))
      }

      const sessionsData = localStorage.getItem('auth_sessions')
      if (sessionsData) {
        const sessions = JSON.parse(sessionsData)
        this.sessions = new Map(Object.entries(sessions))
      }
    } catch (error) {
      console.warn('Failed to load auth data from storage:', error)
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('auth_users', JSON.stringify(Object.fromEntries(this.users)))
      localStorage.setItem('auth_profiles', JSON.stringify(Object.fromEntries(this.profiles)))
      localStorage.setItem('auth_subscriptions', JSON.stringify(Object.fromEntries(this.subscriptions)))
      localStorage.setItem('auth_sessions', JSON.stringify(Object.fromEntries(this.sessions)))
    } catch (error) {
      console.warn('Failed to save auth data to storage:', error)
    }
  }

  async login(email: string, password: string): Promise<{ user: User; profile: UserProfile; subscription: Subscription | null }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Find user by email
    const user = Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      throw new Error('Invalid email or password')
    }

    // In a real app, you'd verify the password hash
    // For demo purposes, we'll just check if password is not empty
    if (!password) {
      throw new Error('Invalid email or password')
    }

    // Create session
    const sessionId = Math.random().toString(36).substring(2)
    this.sessions.set(sessionId, user.id)
    localStorage.setItem('auth_session', sessionId)

    const profile = this.profiles.get(user.id)
    const subscription = this.subscriptions.get(user.id)

    this.saveToStorage()

    return {
      user,
      profile: profile || this.createDefaultProfile(user.id),
      subscription: subscription || null
    }
  }

  async signup(email: string, password: string, name: string): Promise<{ user: User; profile: UserProfile; subscription: Subscription | null }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Create new user
    const userId = Math.random().toString(36).substring(2)
    const user: User = {
      id: userId,
      email: email.toLowerCase(),
      name,
      createdAt: new Date().toISOString(),
      emailVerified: false
    }

    this.users.set(userId, user)

    // Create default profile
    const profile = this.createDefaultProfile(userId)
    this.profiles.set(userId, profile)

    // Create basic subscription
    const subscription: Subscription = {
      id: Math.random().toString(36).substring(2),
      userId,
      provider: 'stripe',
      status: 'active',
      plan: 'basic',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      cancelAtPeriodEnd: false,
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'visa'
      }
    }
    this.subscriptions.set(userId, subscription)

    // Create session
    const sessionId = Math.random().toString(36).substring(2)
    this.sessions.set(sessionId, userId)
    localStorage.setItem('auth_session', sessionId)

    this.saveToStorage()

    return { user, profile, subscription }
  }

  async getCurrentUser(): Promise<{ user: User; profile: UserProfile; subscription: Subscription | null } | null> {
    const sessionId = localStorage.getItem('auth_session')
    if (!sessionId) return null

    const userId = this.sessions.get(sessionId)
    if (!userId) return null

    const user = this.users.get(userId)
    if (!user) return null

    const profile = this.profiles.get(userId)
    const subscription = this.subscriptions.get(userId)

    return {
      user,
      profile: profile || this.createDefaultProfile(userId),
      subscription: subscription || null
    }
  }

  logout() {
    const sessionId = localStorage.getItem('auth_session')
    if (sessionId) {
      this.sessions.delete(sessionId)
      localStorage.removeItem('auth_session')
      this.saveToStorage()
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const existingProfile = this.profiles.get(userId)
    if (!existingProfile) {
      throw new Error('Profile not found')
    }

    const updatedProfile = { ...existingProfile, ...updates }
    this.profiles.set(userId, updatedProfile)
    this.saveToStorage()

    return updatedProfile
  }

  async resetPassword(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      // Don't reveal if email exists
      return
    }

    // In a real app, you'd send a reset email
    console.log(`Password reset email would be sent to ${email}`)
  }

  async verifyEmail(token: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))

    // In a real app, you'd verify the token and update the user
    console.log(`Email verification with token: ${token}`)
  }

  async deleteAccount(userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    this.users.delete(userId)
    this.profiles.delete(userId)
    this.subscriptions.delete(userId)

    // Remove all sessions for this user
    for (const [sessionId, sessionUserId] of this.sessions.entries()) {
      if (sessionUserId === userId) {
        this.sessions.delete(sessionId)
      }
    }

    // Clear user-specific data
    const userDataKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`user_${userId}_`)) {
        userDataKeys.push(key)
      }
    }
    userDataKeys.forEach(key => localStorage.removeItem(key))

    this.saveToStorage()
  }

  async exportUserData(userId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 800))

    const user = this.users.get(userId)
    const profile = this.profiles.get(userId)
    const subscription = this.subscriptions.get(userId)

    // Collect user-specific data from localStorage
    const userData: any = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`user_${userId}_`)) {
        try {
          userData[key] = JSON.parse(localStorage.getItem(key) || 'null')
        } catch {
          userData[key] = localStorage.getItem(key)
        }
      }
    }

    return {
      user,
      profile,
      subscription,
      data: userData,
      exportedAt: new Date().toISOString()
    }
  }

  private createDefaultProfile(userId: string): UserProfile {
    return {
      id: Math.random().toString(36).substring(2),
      userId,
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: true
      }
    }
  }
}

const authService = new AuthService()

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser.user)
          setProfile(currentUser.profile)
          setSubscription(currentUser.subscription)
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password)
    setUser(result.user)
    setProfile(result.profile)
    setSubscription(result.subscription)
  }

  const signup = async (email: string, password: string, name: string) => {
    const result = await authService.signup(email, password, name)
    setUser(result.user)
    setProfile(result.profile)
    setSubscription(result.subscription)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setProfile(null)
    setSubscription(null)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')
    const updatedProfile = await authService.updateProfile(user.id, updates)
    setProfile(updatedProfile)
  }

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email)
  }

  const verifyEmail = async (token: string) => {
    await authService.verifyEmail(token)
  }

  const deleteAccount = async () => {
    if (!user) throw new Error('No user logged in')
    await authService.deleteAccount(user.id)
    setUser(null)
    setProfile(null)
    setSubscription(null)
  }

  const exportUserData = async () => {
    if (!user) throw new Error('No user logged in')
    return await authService.exportUserData(user.id)
  }

  const value: AuthContextType = {
    user,
    profile,
    subscription,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
    resetPassword,
    verifyEmail,
    deleteAccount,
    exportUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { authService }