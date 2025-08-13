import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DocumentProvider } from './contexts/DocumentContext';
import { Toaster } from 'react-hot-toast';

// Import pages
import HomePage from './pages/HomePage';
import WorkspacePage from './pages/WorkspacePage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

// Import layout components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Import styles
import './App.css';

function App() {
  return (
    <DocumentProvider>
      <Router>
        <div className="App">
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          {/* Navigation */}
          <Navbar />
          
          <div className="app-container">
            <Sidebar />
            
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/workspace" element={<WorkspacePage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </DocumentProvider>
  );
}

export default App;
