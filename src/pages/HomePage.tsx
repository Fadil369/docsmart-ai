import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentIcon, SparklesIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            DocSmart AI
            <SparklesIcon className="w-12 h-12 text-blue-500 inline-block ml-3" />
          </h1>
          <p className="hero-subtitle">
            Advanced document processing with AI-powered analysis, compression, translation, and insights
          </p>
          
          <div className="hero-features">
            <div className="feature-card">
              <CloudArrowUpIcon className="w-8 h-8 text-blue-500" />
              <h3>Smart Upload</h3>
              <p>Support for PDF, Word, Excel, images, and more</p>
            </div>
            
            <div className="feature-card">
              <DocumentIcon className="w-8 h-8 text-green-500" />
              <h3>AI Processing</h3>
              <p>Compress, translate, merge, and analyze documents</p>
            </div>
            
            <div className="feature-card">
              <SparklesIcon className="w-8 h-8 text-purple-500" />
              <h3>Smart Insights</h3>
              <p>Generate PRDs, recommendations, and actionable insights</p>
            </div>
          </div>
          
          <div className="hero-actions">
            <button
              onClick={() => navigate('/workspace')}
              className="btn-primary btn-large"
            >
              Get Started
            </button>
            
            <button
              onClick={() => navigate('/analytics')}
              className="btn-secondary btn-large"
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <div className="features-content">
          <h2 className="features-title">Powerful Document Processing</h2>
          
          <div className="features-grid">
            <div className="feature-item">
              <h3>Multi-Format Support</h3>
              <p>Process PDF, Word, Excel, PowerPoint, images, and text files with advanced OCR capabilities.</p>
            </div>
            
            <div className="feature-item">
              <h3>AI-Powered Analysis</h3>
              <p>Leverage OpenAI GPT-4 and Azure AI services for document analysis and content understanding.</p>
            </div>
            
            <div className="feature-item">
              <h3>Arabic Translation</h3>
              <p>Professional translation services with support for Arabic and other languages.</p>
            </div>
            
            <div className="feature-item">
              <h3>Smart Compression</h3>
              <p>Advanced compression using Ghostscript and modern algorithms to reduce file sizes.</p>
            </div>
            
            <div className="feature-item">
              <h3>Document Merging</h3>
              <p>Intelligently combine multiple documents into cohesive, well-formatted outputs.</p>
            </div>
            
            <div className="feature-item">
              <h3>Insights Generation</h3>
              <p>Generate PRDs, recommendations, and actionable insights from your documents.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
