import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import React from 'react'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Test component that uses auth
function TestAuthComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth()
  
  return (
    <div>
      <div data-testid="auth-status">
        {isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      {user && <div data-testid="user-name">{user.name}</div>}
      <button 
        data-testid="login-btn" 
        onClick={() => login('demo@docsmart.ai', 'demo123')}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  )
}

function renderWithAuth(component: React.ReactElement) {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('Authentication System', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should start with unauthenticated state', () => {
    renderWithAuth(<TestAuthComponent />)
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
  })

  it('should login with correct credentials', async () => {
    renderWithAuth(<TestAuthComponent />)
    
    const loginBtn = screen.getByTestId('login-btn')
    fireEvent.click(loginBtn)
    
    // Should show loading state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('loading')
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    }, { timeout: 2000 })
    
    // Should show user name
    expect(screen.getByTestId('user-name')).toHaveTextContent('Demo User')
  })

  it('should logout successfully', async () => {
    renderWithAuth(<TestAuthComponent />)
    
    // Login first
    const loginBtn = screen.getByTestId('login-btn')
    fireEvent.click(loginBtn)
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    })
    
    // Now logout
    const logoutBtn = screen.getByTestId('logout-btn')
    fireEvent.click(logoutBtn)
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
  })

  it('should persist auth state in localStorage', async () => {
    renderWithAuth(<TestAuthComponent />)
    
    const loginBtn = screen.getByTestId('login-btn')
    fireEvent.click(loginBtn)
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    })
    
    // Check localStorage
    expect(localStorage.getItem('auth_token')).toBeTruthy()
    expect(localStorage.getItem('user_data')).toBeTruthy()
    
    const userData = JSON.parse(localStorage.getItem('user_data')!)
    expect(userData.email).toBe('demo@docsmart.ai')
    expect(userData.name).toBe('Demo User')
  })

  it('should clear localStorage on logout', async () => {
    renderWithAuth(<TestAuthComponent />)
    
    // Login first
    const loginBtn = screen.getByTestId('login-btn')
    fireEvent.click(loginBtn)
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    })
    
    // Logout
    const logoutBtn = screen.getByTestId('logout-btn')
    fireEvent.click(logoutBtn)
    
    // Check localStorage is cleared
    expect(localStorage.getItem('auth_token')).toBe(null)
    expect(localStorage.getItem('user_data')).toBe(null)
  })
})