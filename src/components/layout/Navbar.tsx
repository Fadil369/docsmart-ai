import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <SparklesIcon className="w-8 h-8 text-blue-600" />
          <span className="brand-text">DocSmart AI</span>
        </Link>
        
        <div className="navbar-links">
          <Link 
            to="/" 
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/workspace" 
            className={`navbar-link ${location.pathname === '/workspace' ? 'active' : ''}`}
          >
            Workspace
          </Link>
          <Link 
            to="/analytics" 
            className={`navbar-link ${location.pathname === '/analytics' ? 'active' : ''}`}
          >
            Analytics
          </Link>
          <Link 
            to="/settings" 
            className={`navbar-link ${location.pathname === '/settings' ? 'active' : ''}`}
          >
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
