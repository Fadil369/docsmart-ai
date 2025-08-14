import "@/lib/mock-spark";
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from './ErrorFallback.tsx';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';

import "./index.css";
import "./main.css";
import "./styles/theme.css";

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <AuthProvider>
      <App />
    </AuthProvider>
   </ErrorBoundary>
)
