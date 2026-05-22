import React, { useState } from 'react';
import Dropzone from '../components/Dropzone.jsx';
import { compressPdf } from '../services/conversionService.js';
import './PdfToWord.css'; // Reuse general layouts
import './CompressPdf.css';

export default function CompressPdf() {
  const [file, setFile] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState('recommended'); // 'less', 'recommended', 'extreme'
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelected = (selectedFile) => {
    setError(null);
    setResult(null);
    
    if (selectedFile && selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError("Please select a valid PDF file.");
      return;
    }
    
    setFile(selectedFile);
  };

  const handleCompress = async () => {
    if (!file) return;
    
    setIsCompressing(true);
    setProgress(0);
    setError(null);
    
    try {
      const compressResult = await compressPdf(file, compressionLevel, (p) => setProgress(p));
      setResult(compressResult);
    } catch (err) {
      setError(err.message || "An error occurred during compression.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const handleDownload = () => {
    if (!result || !result.blob) return;
    
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-page-container">
      <div className="tool-page-header">
        <div className="tool-page-icon red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </div>
        <h1 className="tool-page-title">Compress PDF</h1>
        <p className="tool-page-subtitle">Reduce file size while optimizing for maximal PDF quality.</p>
      </div>

      <div className="tool-workspace">
        {error && (
          <div className="error-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!file && !result && (
          <Dropzone onFileSelected={handleFileSelected} accept=".pdf" maxFiles={1} />
        )}

        {file && !result && (
          <div className="file-preview-card">
            <div className="file-info">
              <div className="file-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div className="file-details">
                <h3>{file.name}</h3>
                <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button className="remove-btn" onClick={handleReset} disabled={isCompressing} title="Remove file">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {isCompressing ? (
              <div className="conversion-progress">
                <div className="progress-bar-container">
                  <div className="progress-bar-fill red-gradient" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="progress-status">
                  <span>Compressing document...</span>
                  <span>{progress}%</span>
                </div>
              </div>
            ) : (
              <div className="compression-options-container">
                <div className="compression-levels">
                  <h3>Compression Level</h3>
                  <div className="options-grid">
                    <label className={`option-card ${compressionLevel === 'less' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="compression" 
                        value="less" 
                        checked={compressionLevel === 'less'}
                        onChange={() => setCompressionLevel('less')}
                      />
                      <div className="option-content">
                        <h4>Less Compression</h4>
                        <p>High quality, less compression</p>
                      </div>
                    </label>
                    <label className={`option-card ${compressionLevel === 'recommended' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="compression" 
                        value="recommended" 
                        checked={compressionLevel === 'recommended'}
                        onChange={() => setCompressionLevel('recommended')}
                      />
                      <div className="option-content">
                        <h4>Recommended</h4>
                        <p>Good quality, good compression</p>
                      </div>
                    </label>
                    <label className={`option-card ${compressionLevel === 'extreme' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="compression" 
                        value="extreme" 
                        checked={compressionLevel === 'extreme'}
                        onChange={() => setCompressionLevel('extreme')}
                      />
                      <div className="option-content">
                        <h4>Extreme Compression</h4>
                        <p>Less quality, high compression</p>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="conversion-actions">
                  <button className="btn btn-primary btn-red full-width" onClick={handleCompress}>
                    Compress PDF
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="result-card">
            <div className="success-icon-large red-gradient">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Compression Complete!</h2>
            <p>{result.summary}</p>
            
            <div className="result-actions">
              <button className="btn btn-primary btn-red" onClick={handleDownload}>
                Download Compressed PDF
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                Compress Another File
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="tool-info-section">
        <h2>How to compress a PDF</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number red-text">1</div>
            <h3>Upload PDF</h3>
            <p>Drag and drop your PDF file into the upload area above to get started.</p>
          </div>
          <div className="step-card">
            <div className="step-number red-text">2</div>
            <h3>Select Level</h3>
            <p>Choose your desired compression level based on your quality needs.</p>
          </div>
          <div className="step-card">
            <div className="step-number red-text">3</div>
            <h3>Download</h3>
            <p>Click "Compress PDF" and securely download your optimized document.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
