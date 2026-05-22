import React from 'react';
import './Home.css';

const tools = [
  {
    id: 'merge-pdf',
    title: 'Merge PDF',
    description: 'Combine multiple PDF documents into a single cohesive file instantly.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5"></path>
        <path d="M8 3H3v5"></path>
        <path d="M12 22v-8"></path>
        <path d="M21 3l-6 6"></path>
        <path d="M3 3l6 6"></path>
      </svg>
    ),
    color: 'purple'
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    description: 'Extract pages from your PDF or split a large file into smaller pieces.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="8" y1="13" x2="16" y2="13"></line>
        <line x1="8" y1="17" x2="10" y2="17"></line>
        <line x1="14" y1="17" x2="16" y2="17"></line>
      </svg>
    ),
    color: 'orange'
  },
  {
    id: 'compress-pdf',
    title: 'Compress PDF',
    description: 'Reduce file size while preserving quality for easy sharing.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="8" y1="12" x2="16" y2="12"></line>
        <line x1="12" y1="8" x2="12" y2="16"></line>
      </svg>
    ),
    color: 'green'
  },
  {
    id: 'image-to-pdf',
    title: 'Image to PDF',
    description: 'Convert JPG, PNG, and other image formats into a secure PDF.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    ),
    color: 'teal'
  }
];

export default function Home({ setCurrentPage }) {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <div className="badge">✨ The Ultimate PDF Toolkit</div>
          <h1 className="hero-title">
            Every tool you need to work with <span className="text-gradient">PDFs</span>
          </h1>
          <p className="hero-subtitle">
            PDFNova is an all-in-one platform for converting, merging, splitting, and compressing PDF files. 
            Experience high-quality document processing with a modern, lightning-fast interface.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => {
              document.querySelector('.tools-section').scrollIntoView({ behavior: 'smooth' });
            }}>
              Explore Tools
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button className="btn btn-secondary" onClick={() => alert('Documentation is coming soon!')}>
              View Documentation
            </button>
          </div>
        </div>
        
        {/* Abstract decorative elements for rich aesthetics */}
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
      </div>

      <div className="tools-section">
        <div className="tools-header">
          <h2>Our Power Tools</h2>
          <p>Select a tool below to start processing your files securely.</p>
        </div>
        
        <div className="tools-grid">
          {tools.map((tool) => (
            <div 
              key={tool.id} 
              className={`tool-card ${tool.color}`}
              onClick={() => {
                if (['split-pdf', 'merge-pdf', 'image-to-pdf', 'compress-pdf'].includes(tool.id)) {
                  setCurrentPage(tool.id);
                  window.scrollTo(0, 0);
                } else {
                  alert('This tool is not yet implemented!');
                }
              }}
            >
              <div className="tool-icon-wrapper">
                {tool.icon}
              </div>
              <h3 className="tool-title">{tool.title}</h3>
              <p className="tool-desc">{tool.description}</p>
              <div className="tool-hover-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="features-banner">
        <div className="feature-item">
          <div className="feature-icon">🔒</div>
          <div className="feature-text">Secure Processing</div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">⚡</div>
          <div className="feature-text">Lightning Fast</div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">💎</div>
          <div className="feature-text">Premium Quality</div>
        </div>
      </div>
    </div>
  );
}
