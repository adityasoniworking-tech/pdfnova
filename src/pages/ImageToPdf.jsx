import React, { useState } from 'react';
import Dropzone from '../components/Dropzone.jsx';
import { imagesToPdf } from '../services/conversionService.js';
import './PdfToWord.css'; // Reuse general layouts
import './MergePdf.css';  // Reuse file listing layouts
import './ImageToPdf.css';

export default function ImageToPdf() {
  const [files, setFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFilesSelected = (selectedFiles) => {
    setError(null);
    setResult(null);
    
    // Ensure it's an array
    let newFiles = Array.isArray(selectedFiles) ? selectedFiles : [selectedFiles];
    
    // Validate Images (PNG, JPG, JPEG)
    const validFiles = newFiles.filter(f => {
      const ft = f.type.toLowerCase();
      const fn = f.name.toLowerCase();
      return ft.includes('image/jpeg') || ft.includes('image/png') || fn.endsWith('.jpg') || fn.endsWith('.jpeg') || fn.endsWith('.png');
    });
    
    if (validFiles.length !== newFiles.length) {
      setError("Some files were skipped because they are not valid JPG or PNG images.");
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setError("Please add at least 1 image file.");
      return;
    }
    
    setIsConverting(true);
    setProgress(0);
    setError(null);
    
    try {
      const mergeResult = await imagesToPdf(files, (p) => setProgress(p));
      setResult(mergeResult);
    } catch (err) {
      setError(err.message || "An error occurred during conversion.");
    } finally {
      setIsConverting(false);
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

  // Create local object URLs for thumbnail previews
  const getThumbnailUrl = (file) => {
    return URL.createObjectURL(file);
  };

  return (
    <div className="tool-page-container">
      <div className="tool-page-header">
        <div className="tool-page-icon pink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
        <h1 className="tool-page-title">Image to PDF</h1>
        <p className="tool-page-subtitle">Convert JPG and PNG images to a high-quality PDF document instantly.</p>
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
              <Dropzone onFileSelected={handleFilesSelected} accept="image/jpeg, image/png, .jpg, .jpeg, .png" maxFiles={20} />
            </div>

            {files.length > 0 && (
              <div className="selected-files-list">
                <h3>Selected Images ({files.length})</h3>
                <div className="files-scroll-container img-grid-container">
                  {files.map((f, index) => (
                    <div key={`${f.name}-${index}`} className="file-list-item img-list-item">
                      <div className="img-thumbnail">
                        <img src={getThumbnailUrl(f)} alt={f.name} onLoad={(e) => URL.revokeObjectURL(e.target.src)} />
                      </div>
                      <div className="file-list-details">
                        <p className="file-name">{f.name}</p>
                        <p className="file-size">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div className="file-list-actions">
                        <button onClick={() => moveFile(index, 'up')} disabled={index === 0} title="Move Left">←</button>
                        <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} title="Move Right">→</button>
                        <button className="remove" onClick={() => removeFile(index)} title="Remove">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {files.length > 0 && (
              <div className="merge-action-area">
                {isConverting ? (
                  <div className="conversion-progress">
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill pink-gradient" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="progress-status">
                      <span>Converting images to PDF...</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                ) : (
                  <button 
                    className="btn btn-primary btn-pink full-width" 
                    onClick={handleConvert}
                  >
                    Convert to PDF
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="result-card">
            <div className="success-icon-large pink-gradient">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Conversion Complete!</h2>
            <p>{result.summary}</p>
            
            <div className="result-actions">
              <button className="btn btn-primary btn-pink" onClick={handleDownload}>
                Download PDF
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                Convert More Images
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="tool-info-section">
        <h2>How to convert Images to PDF</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number pink-text">1</div>
            <h3>Upload Images</h3>
            <p>Drag and drop multiple JPG or PNG image files into the upload box.</p>
          </div>
          <div className="step-card">
            <div className="step-number pink-text">2</div>
            <h3>Reorder</h3>
            <p>Use the arrows to arrange your images. Each image will become a new page in the PDF.</p>
          </div>
          <div className="step-card">
            <div className="step-number pink-text">3</div>
            <h3>Convert</h3>
            <p>Click "Convert to PDF" to generate and download your perfectly formatted document.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
