// Simplified auth implementation to fix runtime errors
export interface User {
  id: string
  email: string
  name: string
}

class AuthService {
  private users = new Map<string, User>()

  async signup(email: string, password: string, name: string): Promise<User> {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name
    }
    this.users.set(user.id, user)
    return user
  }

  async login(email: string, password: string): Promise<User | null> {
    // Simple mock login
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: 'Test User'
    }
    return user
  }

  async logout(): Promise<void> {
    // Mock logout
    localStorage.removeItem('auth_session')
  }

  getCurrentUser(): User | null {
    // Mock current user
    return null
  }
}

export const authService = new AuthService()
export const { signup, login, logout } = authService
