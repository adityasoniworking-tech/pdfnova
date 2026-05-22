import React, { useState } from 'react';
import Dropzone from '../components/Dropzone.jsx';
import { convertPdfToWord } from '../services/conversionService.js';
import './PdfToWord.css';

export default function PdfToWord() {
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
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

  const handleConvert = async () => {
    if (!file) return;
    
    setIsConverting(true);
    setProgress(0);
    setError(null);
    
    try {
      const conversionResult = await convertPdfToWord(file, (p) => setProgress(p));
      setResult(conversionResult);
    } catch (err) {
      setError(err.message || "An error occurred during conversion.");
    } finally {
      setIsConverting(false);
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
        <div className="tool-page-icon blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M16 13H8"></path>
            <path d="M16 17H8"></path>
            <path d="M10 9H8"></path>
          </svg>
        </div>
        <h1 className="tool-page-title">PDF to Word Converter</h1>
        <p className="tool-page-subtitle">Convert your PDF documents to editable Word files with high accuracy.</p>
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
              <button className="remove-btn" onClick={handleReset} disabled={isConverting} title="Remove file">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {isConverting ? (
              <div className="conversion-progress">
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="progress-status">
                  <span>Converting document...</span>
                  <span>{progress}%</span>
                </div>
              </div>
            ) : (
              <div className="conversion-actions">
                <button className="btn btn-primary full-width" onClick={handleConvert}>
                  Convert to Word
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="result-card">
            <div className="success-icon-large">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Conversion Complete!</h2>
            <p>{result.summary}</p>
            
            <div className="result-actions">
              <button className="btn btn-primary" onClick={handleDownload}>
                Download Word File
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                Convert Another File
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="tool-info-section">
        <h2>How to convert PDF to Word</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Upload PDF</h3>
            <p>Drag and drop your PDF file into the upload box or click to select a file from your device.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Convert</h3>
            <p>Click the "Convert to Word" button. Our engine will quickly process and format your document.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Download</h3>
            <p>Once finished, securely download your new, fully editable Microsoft Word (.doc) file.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
