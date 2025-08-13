import { useState, useEffect } from 'react'
import { useAuth } from './auth'

// Enhanced useKV hook that scopes data to the current user
export function useUserKV<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const { user } = useAuth()
  
  // Create user-scoped key
  const scopedKey = user ? `user_${user.id}_${key}` : `anonymous_${key}`
  
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(scopedKey)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(scopedKey, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to store value in localStorage:', error)
    }
  }, [scopedKey, value])

  return [value, setValue]
}

// Utility to migrate anonymous data to user account
export function migrateAnonymousData(userId: string) {
  const anonymousKeys: string[] = []
  
  // Find all anonymous keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('anonymous_')) {
      anonymousKeys.push(key)
    }
  }

  // Migrate each key to user-scoped
  anonymousKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        const newKey = key.replace('anonymous_', `user_${userId}_`)
        
        // Only migrate if user doesn't already have this data
        if (!localStorage.getItem(newKey)) {
          localStorage.setItem(newKey, data)
        }
        
        // Remove anonymous data
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Failed to migrate data for key ${key}:`, error)
    }
  })
}

// Utility to get all user data keys
export function getUserDataKeys(userId: string): string[] {
  const userKeys: string[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(`user_${userId}_`)) {
      userKeys.push(key)
    }
  }
  
  return userKeys
}

// Utility to delete all user data
export function deleteUserData(userId: string) {
  const userKeys = getUserDataKeys(userId)
  userKeys.forEach(key => localStorage.removeItem(key))
}

// Utility to export all user data
export function exportUserData(userId: string): Record<string, any> {
  const userKeys = getUserDataKeys(userId)
  const userData: Record<string, any> = {}
  
  userKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        // Remove user prefix for cleaner export
        const cleanKey = key.replace(`user_${userId}_`, '')
        userData[cleanKey] = JSON.parse(data)
      }
    } catch (error) {
      console.warn(`Failed to export data for key ${key}:`, error)
    }
  })
  
  return userData
}

// Check if user has pro features based on subscription
export function useUserPermissions() {
  const { subscription } = useAuth()
  
  const isBasic = !subscription || subscription.plan === 'basic'
  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'enterprise'
  const isEnterprise = subscription?.plan === 'enterprise'
  
  const canUseAI = isPro
  const canUseAdvancedAnalysis = isPro
  const canUseTeamFeatures = isEnterprise
  const canUseCustomTemplates = isPro
  const canUploadLargeFiles = isPro
  const canExportData = isPro
  const hasUnlimitedDocuments = isPro
  
  const documentLimit = isBasic ? 10 : -1 // -1 means unlimited
  const fileSizeLimit = isBasic ? 5 * 1024 * 1024 : 100 * 1024 * 1024 // 5MB vs 100MB
  
  return {
    isBasic,
    isPro,
    isEnterprise,
    canUseAI,
    canUseAdvancedAnalysis,
    canUseTeamFeatures,
    canUseCustomTemplates,
    canUploadLargeFiles,
    canExportData,
    hasUnlimitedDocuments,
    documentLimit,
    fileSizeLimit
  }
}