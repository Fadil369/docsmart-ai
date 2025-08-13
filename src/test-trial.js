/**
 * Test script for trial functionality
 * This can be run in the browser console to test trial features
 */

// Test the trial system
console.log('Testing Trial System...')

// Import trial functions (these would be available in the browser)
const testTrial = async () => {
  console.log('1. Testing trial initialization...')
  
  // Reset trial for clean test
  if (typeof resetTrial !== 'undefined') {
  if (typeof window !== 'undefined' && window.trialDebug && typeof window.trialDebug.resetTrial === 'function') {
    window.trialDebug.resetTrial()
  }
  
  // Initialize new trial
  if (typeof getOrCreateTrial !== 'undefined') {
    const trial = getOrCreateTrial()
    console.log('Trial created:', trial)
    
    // Test trial status
    const status = getTrialStatus()
    console.log('Trial status:', status)
    
    // Test access check
    const hasAccess = hasGatedAccess()
    console.log('Has gated access:', hasAccess)
  }
  
  console.log('2. Testing analytics...')
  
  // Test analytics tracking
  if (typeof trackTrialEvent !== 'undefined') {
    trackTrialEvent('trial_start', { test: true })
  if (typeof trialDebug !== 'undefined' && typeof trialDebug.resetTrial === 'function') {
    trialDebug.resetTrial()
  }
  
  // Initialize new trial
  if (typeof trialDebug !== 'undefined' && typeof trialDebug.getOrCreateTrial === 'function') {
    const trial = trialDebug.getOrCreateTrial()
    console.log('Trial created:', trial)
    
    // Test trial status
    const status = trialDebug.getTrialStatus()
    console.log('Trial status:', status)
    
    // Test access check
    const hasAccess = trialDebug.hasGatedAccess()
    console.log('Has gated access:', hasAccess)
  }
  
  console.log('2. Testing analytics...')
  
  // Test analytics tracking
  if (typeof trialDebug !== 'undefined' && typeof trialDebug.trackTrialEvent === 'function') {
    trialDebug.trackTrialEvent('trial_start', { test: true })
    trialDebug.trackFeatureUsage('upload', { test: true })
  }
  
  console.log('3. Check localStorage...')
  console.log('User data:', localStorage.getItem('docsmart_user_data'))
  console.log('Trial data:', localStorage.getItem('docsmart_trial_data'))
  console.log('Analytics:', localStorage.getItem('docsmart_analytics'))
}

// Instructions
console.log(`
To test the trial system:
1. Open browser console
2. Run: testTrial()
3. Check the trial countdown in the UI
4. Try clicking on gated features (marked with "Pro" badge)
5. Test payment page by clicking "Upgrade" or navigating to #/payment
`)

if (typeof window !== 'undefined') {
  window.testTrial = testTrial
}