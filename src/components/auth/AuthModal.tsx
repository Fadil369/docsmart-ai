import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'

type AuthMode = 'login' | 'signup' | 'forgot-password'

interface AuthModalProps {
  initialMode?: AuthMode
}

export function AuthModal({ initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const toggleLoginSignup = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
  }

  const showForgotPassword = () => {
    setMode('forgot-password')
  }

  const backToLogin = () => {
    setMode('login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <LoginForm
                onToggleMode={toggleLoginSignup}
                onForgotPassword={showForgotPassword}
              />
            </motion.div>
          )}

          {mode === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SignupForm onToggleMode={toggleLoginSignup} />
            </motion.div>
          )}

          {mode === 'forgot-password' && (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ForgotPasswordForm onBack={backToLogin} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}