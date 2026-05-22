import React, { useState, useRef } from 'react';
import './Dropzone.css';

export default function Dropzone({ onFileSelected, accept = ".pdf", maxFiles = 1 }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    // Convert FileList to Array
    const filesArray = Array.from(files);
    
    // Check if we need to enforce maxFiles
    const selectedFiles = maxFiles === 1 ? [filesArray[0]] : filesArray.slice(0, maxFiles);
    
    // In a real app we'd check mime types based on 'accept' here
    
    if (maxFiles === 1) {
      onFileSelected(selectedFiles[0]);
    } else {
      onFileSelected(selectedFiles);
    }
  };

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div 
      className={`dropzone-container ${isDragActive ? 'active' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleInputChange} 
        accept={accept} 
        multiple={maxFiles > 1}
        className="dropzone-input"
      />
      
      <div className="dropzone-content">
        <div className="dropzone-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        
        {isDragActive ? (
          <h3 className="dropzone-text drop-text">Drop your file here...</h3>
        ) : (
          <>
            <h3 className="dropzone-text">Click or drag & drop to upload</h3>
            <p className="dropzone-subtext">Supports {accept} files</p>
          </>
        )}
      </div>
    </div>
  );
}
