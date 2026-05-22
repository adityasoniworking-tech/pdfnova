import React, { useState } from 'react';
import Dropzone from '../components/Dropzone.jsx';
import { splitPdf } from '../services/conversionService.js';
import './PdfToWord.css'; // We can reuse the same layout styles
import './SplitPdf.css';

export default function SplitPdf() {
  const [file, setFile] = useState(null);
  const [ranges, setRanges] = useState(['1-3']);
  const [isSplitting, setIsSplitting] = useState(false);
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

  const handleSplit = async () => {
    if (!file) return;
    
    // Filter out empty ranges
    const validRanges = ranges.filter(r => r.trim() !== '');
    if (validRanges.length === 0) {
      setError("Please enter at least one valid page range.");
      return;
    }
    
    setIsSplitting(true);
    setProgress(0);
    setError(null);
    
    try {
      const splitResult = await splitPdf(file, validRanges, (p) => setProgress(p));
      setResult(splitResult);
    } catch (err) {
      setError(err.message || "An error occurred during splitting.");
    } finally {
      setIsSplitting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setRanges(['1-3']);
  };

  const addRange = () => {
    setRanges([...ranges, '']);
  };

  const removeRange = (index) => {
    if (ranges.length === 1) return;
    setRanges(ranges.filter((_, i) => i !== index));
  };

  const updateRange = (index, value) => {
    const newRanges = [...ranges];
    newRanges[index] = value;
    setRanges(newRanges);
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
        <div className="tool-page-icon orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="8" y1="13" x2="16" y2="13"></line>
            <line x1="8" y1="17" x2="10" y2="17"></line>
            <line x1="14" y1="17" x2="16" y2="17"></line>
          </svg>
        </div>
        <h1 className="tool-page-title">Split PDF Files</h1>
        <p className="tool-page-subtitle">Extract pages from your PDF or split a large file into smaller pieces quickly and securely.</p>
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
              <button className="remove-btn" onClick={handleReset} disabled={isSplitting} title="Remove file">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {isSplitting ? (
              <div className="conversion-progress">
                <div className="progress-bar-container">
                  <div className="progress-bar-fill orange-gradient" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="progress-status">
                  <span>Splitting document...</span>
                  <span>{progress}%</span>
                </div>
              </div>
            ) : (
              <div className="split-options-container">
                <div className="split-ranges-header">
                  <h3>Split Parts</h3>
                  <button className="btn-add-range" onClick={addRange}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Split
                  </button>
                </div>
                
                <div className="ranges-list">
                  {ranges.map((r, index) => (
                    <div key={index} className="form-group split-form-group multi-range-group">
                      <label htmlFor={`range-${index}`}>Part {index + 1} (e.g., 1-5)</label>
                      <div className="range-input-wrapper">
                        <input 
                          type="text" 
                          id={`range-${index}`} 
                          value={r}
                          onChange={(e) => updateRange(index, e.target.value)}
                          placeholder="e.g. 1-3"
                        />
                        {ranges.length > 1 && (
                          <button className="btn-remove-range" onClick={() => removeRange(index)} title="Remove part">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="conversion-actions">
                  <button className="btn btn-primary btn-orange full-width" onClick={handleSplit}>
                    {ranges.length > 1 ? `Split into ${ranges.length} PDFs (ZIP)` : 'Split PDF'}
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
            <div className="success-icon-large orange-gradient">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Splitting Complete!</h2>
            <p>{result.summary}</p>
            
            <div className="result-actions">
              <button className="btn btn-primary btn-orange" onClick={handleDownload}>
                Download {ranges.length > 1 ? 'ZIP Archive' : 'Split PDF'}
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                Split Another File
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="tool-info-section">
        <h2>How to split a PDF file</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number orange-text">1</div>
            <h3>Upload PDF</h3>
            <p>Drag and drop your PDF file into the upload box or click to select a file from your device.</p>
          </div>
          <div className="step-card">
            <div className="step-number orange-text">2</div>
            <h3>Select Pages</h3>
            <p>Enter the page numbers or ranges you want to extract (for example: 1-5, 8, 11-13).</p>
          </div>
          <div className="step-card">
            <div className="step-number orange-text">3</div>
            <h3>Download</h3>
            <p>Click "Split PDF" and securely download your new, smaller PDF document containing only the extracted pages.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
