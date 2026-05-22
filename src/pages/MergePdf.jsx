import React, { useState } from 'react';
import Dropzone from '../components/Dropzone.jsx';
import { mergePdfs } from '../services/conversionService.js';
import './PdfToWord.css'; // Reuse general layouts
import './MergePdf.css';

export default function MergePdf() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFilesSelected = (selectedFiles) => {
    setError(null);
    setResult(null);
    
    // Ensure it's an array
    let newFiles = Array.isArray(selectedFiles) ? selectedFiles : [selectedFiles];
    
    // Validate PDFs
    const validFiles = newFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    
    if (validFiles.length !== newFiles.length) {
      setError("Some files were skipped because they are not valid PDF files.");
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }
    
    setIsMerging(true);
    setProgress(0);
    setError(null);
    
    try {
      const mergeResult = await mergePdfs(files, (p) => setProgress(p));
      setResult(mergeResult);
    } catch (err) {
      setError(err.message || "An error occurred during merging.");
    } finally {
      setIsMerging(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const moveFile = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newFiles = [...files];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      setFiles(newFiles);
    } else if (direction === 'down' && index < files.length - 1) {
      const newFiles = [...files];
      [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
      setFiles(newFiles);
    }
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
        <div className="tool-page-icon green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6h13"></path>
            <path d="M8 12h13"></path>
            <path d="M8 18h13"></path>
            <path d="M3 6h.01"></path>
            <path d="M3 12h.01"></path>
            <path d="M3 18h.01"></path>
          </svg>
        </div>
        <h1 className="tool-page-title">Merge PDF Files</h1>
        <p className="tool-page-subtitle">Combine multiple PDF files into one single document seamlessly and securely.</p>
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

        {!result && (
          <div className="merge-workspace-grid">
            <div className="dropzone-area">
              <Dropzone onFileSelected={handleFilesSelected} accept=".pdf" maxFiles={10} />
            </div>

            {files.length > 0 && (
              <div className="selected-files-list">
                <h3>Selected Files ({files.length})</h3>
                <div className="files-scroll-container">
                  {files.map((f, index) => (
                    <div key={`${f.name}-${index}`} className="file-list-item">
                      <div className="file-list-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                      </div>
                      <div className="file-list-details">
                        <p className="file-name">{f.name}</p>
                        <p className="file-size">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div className="file-list-actions">
                        <button onClick={() => moveFile(index, 'up')} disabled={index === 0} title="Move Up">↑</button>
                        <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} title="Move Down">↓</button>
                        <button className="remove" onClick={() => removeFile(index)} title="Remove">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {files.length > 0 && (
              <div className="merge-action-area">
                {isMerging ? (
                  <div className="conversion-progress">
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill green-gradient" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="progress-status">
                      <span>Merging documents...</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                ) : (
                  <button 
                    className="btn btn-primary btn-green full-width" 
                    onClick={handleMerge}
                    disabled={files.length < 2}
                  >
                    Merge PDFs
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                )}
                {files.length < 2 && !isMerging && (
                  <p className="helper-text text-center mt-2">Please add at least 2 files to merge.</p>
                )}
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="result-card">
            <div className="success-icon-large green-gradient">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Merge Complete!</h2>
            <p>{result.summary}</p>
            
            <div className="result-actions">
              <button className="btn btn-primary btn-green" onClick={handleDownload}>
                Download Merged PDF
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                Merge More Files
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="tool-info-section">
        <h2>How to merge PDF files</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number green-text">1</div>
            <h3>Upload PDFs</h3>
            <p>Drag and drop multiple PDF files into the upload box or select them from your device.</p>
          </div>
          <div className="step-card">
            <div className="step-number green-text">2</div>
            <h3>Reorder</h3>
            <p>Use the up and down arrows to arrange your files in the exact order you want them merged.</p>
          </div>
          <div className="step-card">
            <div className="step-number green-text">3</div>
            <h3>Merge & Download</h3>
            <p>Click "Merge PDFs" and immediately download your new, fully combined document.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
