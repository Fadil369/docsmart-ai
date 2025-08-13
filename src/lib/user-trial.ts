/**
 * User Trial Management System
 * Manages 3-day demo period with server-side validation simulation
 */

import { trackTrialEvent } from './analytics'

export interface TrialData {
  trial_start: string; // ISO UTC timestamp
  trial_end: string; // ISO UTC timestamp
  isExpired: boolean;
  isActive: boolean;
  daysRemaining: number;
  hoursRemaining: number;
}

export interface User {
  id: string;
  trial_start: string;
  trial_end: string;
  hasActiveTrial: boolean;
}

const TRIAL_DURATION_DAYS = 3;
const TRIAL_STORAGE_KEY = 'docsmart_trial_data';
const USER_STORAGE_KEY = 'docsmart_user_data';

/**
 * Initialize trial for new user (first login/activation)
 */
export function initializeTrial(): TrialData {
  const now = new Date();
  const trialStart = now.toISOString();
  const trialEnd = new Date(now.getTime() + (TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000)).toISOString();
  
  const user: User = {
    id: generateUserId(),
    trial_start: trialStart,
    trial_end: trialEnd,
    hasActiveTrial: true
  };

  const trialData: TrialData = {
    trial_start: trialStart,
    trial_end: trialEnd,
    isExpired: false,
    isActive: true,
    daysRemaining: TRIAL_DURATION_DAYS,
    hoursRemaining: TRIAL_DURATION_DAYS * 24
  };

  // Simulate server-side storage
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(trialData));

  // Emit analytics event
  trackTrialEvent('trial_start', {
    trial_start: trialStart,
    trial_end: trialEnd,
    duration_days: TRIAL_DURATION_DAYS
  });

  return trialData;
}

/**
 * Get current trial status with server-side validation
 */
export function getTrialStatus(): TrialData | null {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const storedTrial = localStorage.getItem(TRIAL_STORAGE_KEY);
    
    if (!storedUser || !storedTrial) {
      return null;
    }

    const user: User = JSON.parse(storedUser);
    const now = new Date();
    const trialEnd = new Date(user.trial_end);
    const trialStart = new Date(user.trial_start);
    
    const isExpired = now > trialEnd;
    const isActive = !isExpired && user.hasActiveTrial;
    
    const timeRemaining = Math.max(0, trialEnd.getTime() - now.getTime());
    const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
    const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));

    const trialData: TrialData = {
      trial_start: user.trial_start,
      trial_end: user.trial_end,
      isExpired,
      isActive,
      daysRemaining: Math.max(0, daysRemaining),
      hoursRemaining: Math.max(0, hoursRemaining)
    };

    // Update stored trial data
    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(trialData));

    // Emit analytics for trial milestones
    checkAndEmitTrialMilestones(trialData);

    return trialData;
  } catch (error) {
    console.error('Error getting trial status:', error);
    return null;
  }
}

/**
 * Check if user has access to gated features
 */
export function hasGatedAccess(): boolean {
  const trial = getTrialStatus();
  return trial ? trial.isActive && !trial.isExpired : false;
}

/**
 * End trial (for testing or admin purposes)
 */
export function endTrial(): void {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (storedUser) {
    const user: User = JSON.parse(storedUser);
    user.hasActiveTrial = false;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
  
  trackTrialEvent('trial_ended_manually');
}

/**
 * Reset trial (for development/testing)
 */
export function resetTrial(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TRIAL_STORAGE_KEY);
  localStorage.removeItem('trial_milestones_emitted');
}

/**
 * Check and emit analytics events for trial milestones
 */
function checkAndEmitTrialMilestones(trial: TrialData): void {
  const milestonesKey = 'trial_milestones_emitted';
  const emittedMilestones = JSON.parse(localStorage.getItem(milestonesKey) || '{}');

  // 24 hours left milestone
  if (trial.hoursRemaining <= 24 && trial.hoursRemaining > 0 && !emittedMilestones['24h_left']) {
    trackTrialEvent('trial_24h_left', {
      hours_remaining: trial.hoursRemaining,
      trial_end: trial.trial_end
    });
    emittedMilestones['24h_left'] = true;
    localStorage.setItem(milestonesKey, JSON.stringify(emittedMilestones));
  }

  // Trial expired milestone
  if (trial.isExpired && !emittedMilestones['expired']) {
    trackTrialEvent('trial_expired', {
      trial_start: trial.trial_start,
      trial_end: trial.trial_end
    });
    emittedMilestones['expired'] = true;
    localStorage.setItem(milestonesKey, JSON.stringify(emittedMilestones));
  }
}

/**
 * Generate a simple user ID
 */
function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

/**
 * Get or create user trial
 */
export function getOrCreateTrial(): TrialData {
  const existingTrial = getTrialStatus();
  if (existingTrial) {
    return existingTrial;
  }
  
  return initializeTrial();
}