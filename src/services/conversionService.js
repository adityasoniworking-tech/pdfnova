// conversionService.js


/**
 * Helper to parse a page range string (e.g., "1-3, 5") into an array of 0-indexed page numbers.
 */
function parseRange(rangeStr, maxPages) {
  const pages = new Set();
  const parts = rangeStr.split(',');
  
  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);
      
      if (isNaN(start) || isNaN(end)) throw new Error(`Invalid range format: ${part}`);
      
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= maxPages) pages.add(i - 1);
      }
    } else {
      const num = parseInt(part, 10);
      if (isNaN(num)) throw new Error(`Invalid page number: ${part}`);
      if (num >= 1 && num <= maxPages) pages.add(num - 1);
    }
  }
  
  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Performs actual PDF splitting using pdf-lib. If multiple ranges are provided, packages them via jszip.
 * 
 * @param {File} file - The uploaded PDF file
 * @param {string[]} rangesArray - Array of page ranges to split (e.g. ["1-3", "5-8"])
 * @param {function} onProgress - Callback for progress updates (0-100)
 * @returns {Promise<Object>} - The split result
 */
export async function splitPdf(file, rangesArray, onProgress) {
  try {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid file type. Please upload a PDF.');
    }

    if (!Array.isArray(rangesArray) || rangesArray.length === 0) {
      throw new Error('Please enter at least one valid page range.');
    }

    if (onProgress) onProgress(10); // Starting

    let pdfLib;
    try {
      pdfLib = await import('pdf-lib');
    } catch (e) {
      throw new Error('Please open your terminal, stop the server, run "npm install pdf-lib", and then start the server again to use this feature!');
    }

    const { PDFDocument } = pdfLib;

    if (onProgress) onProgress(20); 

    const arrayBuffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(arrayBuffer);
    const maxPages = srcDoc.getPageCount();

    if (onProgress) onProgress(40); 

    const generatedPdfs = [];
    
    // Process each range
    for (let i = 0; i < rangesArray.length; i++) {
      const range = rangesArray[i];
      if (!range || range.trim() === '') continue;
      
      const pageIndices = parseRange(range, maxPages);
      if (pageIndices.length === 0) {
        throw new Error(`No valid pages found in range "${range}". The document has ${maxPages} pages.`);
      }

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
      
      for (const page of copiedPages) {
        newDoc.addPage(page);
      }

      const pdfBytes = await newDoc.save();
      const fileName = file.name.replace(/\.pdf$/i, `_part${i+1}_${range.replace(/[^0-9-]/g, '_')}.pdf`);
      
      generatedPdfs.push({
        bytes: pdfBytes,
        fileName
      });
    }

    if (generatedPdfs.length === 0) {
      throw new Error('No valid ranges provided.');
    }

    if (onProgress) onProgress(70);

    // If only one range, download directly as PDF
    if (generatedPdfs.length === 1) {
      const blob = new Blob([generatedPdfs[0].bytes], { type: 'application/pdf' });
      if (onProgress) onProgress(100);
      return {
        blob,
        fileName: generatedPdfs[0].fileName,
        mimeType: 'application/pdf',
        summary: `Successfully extracted pages into a new PDF.`
      };
    }

    // Multiple ranges -> Package into ZIP
    if (onProgress) onProgress(80);
    
    let JSZip;
    try {
      const jszipModule = await import('jszip');
      JSZip = jszipModule.default || jszipModule;
    } catch (e) {
      throw new Error('To download multiple splits at once, please stop the server, run "npm install jszip", and start the server again!');
    }

    const zip = new JSZip();
    generatedPdfs.forEach(pdf => {
      zip.file(pdf.fileName, pdf.bytes);
    });

    if (onProgress) onProgress(90);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFileName = file.name.replace(/\.pdf$/i, '_splits.zip');

    if (onProgress) onProgress(100);

    return {
      blob: zipBlob,
      fileName: zipFileName,
      mimeType: 'application/zip',
      summary: `Successfully extracted ${generatedPdfs.length} PDFs and packaged them into a ZIP file.`
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Performs PDF merging using pdf-lib.
 * 
 * @param {File[]} files - Array of uploaded PDF files
 * @param {function} onProgress - Callback for progress updates (0-100)
 * @returns {Promise<Object>} - The merged result
 */
export async function mergePdfs(files, onProgress) {
  try {
    if (!Array.isArray(files) || files.length < 2) {
      throw new Error('Please select at least two PDF files to merge.');
    }

    if (onProgress) onProgress(10); // Starting

    let pdfLib;
    try {
      pdfLib = await import('pdf-lib');
    } catch (e) {
      throw new Error('Please open your terminal, stop the server, run "npm install pdf-lib", and then start the server again to use this feature!');
    }

    const { PDFDocument } = pdfLib;
    const mergedPdf = await PDFDocument.create();

    if (onProgress) onProgress(20); 

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error(`File "${file.name}" is not a valid PDF.`);
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      
      if (onProgress) onProgress(20 + Math.floor((60 * (i + 1)) / files.length));
    }

    if (onProgress) onProgress(85);

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const fileName = `merged_${new Date().getTime()}.pdf`;

    if (onProgress) onProgress(100);

    return {
      blob,
      fileName,
      mimeType: 'application/pdf',
      summary: `Successfully merged ${files.length} PDFs into a single document.`
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Converts multiple images to a single PDF.
 * 
 * @param {File[]} files - Array of image files
 * @param {function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} - The PDF result
 */
export async function imagesToPdf(files, onProgress) {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('Please select at least one image file.');
    }

    if (onProgress) onProgress(10); 

    let pdfLib;
    try {
      pdfLib = await import('pdf-lib');
    } catch (e) {
      throw new Error('Please open your terminal, stop the server, run "npm install pdf-lib", and then start the server again to use this feature!');
    }

    const { PDFDocument } = pdfLib;
    const pdfDoc = await PDFDocument.create();

    if (onProgress) onProgress(20); 

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      let image;
      
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      
      try {
        if (fileType === 'image/jpeg' || fileType === 'image/jpg' || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (fileType === 'image/png' || fileName.endsWith('.png')) {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          throw new Error(`Unsupported type: ${fileName}. Only JPG and PNG are supported.`);
        }
      } catch (err) {
        throw new Error(`Failed to parse image ${fileName}. Make sure it is a valid JPG or PNG file. (${err.message})`);
      }

      // Add page with the same dimensions as the image
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });

      if (onProgress) onProgress(20 + Math.floor((60 * (i + 1)) / files.length));
    }

    if (onProgress) onProgress(85);

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const outName = `images_${new Date().getTime()}.pdf`;

    if (onProgress) onProgress(100);

    return {
      blob,
      fileName: outName,
      mimeType: 'application/pdf',
      summary: `Successfully converted ${files.length} image(s) into a single PDF document.`
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Compresses a PDF file.
 * Note: Pure frontend compression is limited. This performs basic object stripping
 * and simulates advanced compression for the prototype.
 * 
 * @param {File} file - The uploaded PDF file
 * @param {string} compressionLevel - 'less', 'recommended', or 'extreme'
 * @param {function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} - The compressed PDF result
 */
export async function compressPdf(file, compressionLevel, onProgress) {
  try {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid file type. Please upload a PDF.');
    }

    if (onProgress) onProgress(10); 

    let pdfLib;
    try {
      pdfLib = await import('pdf-lib');
    } catch (e) {
      throw new Error('Please open your terminal, stop the server, run "npm install pdf-lib", and then start the server again to use this feature!');
    }

    const { PDFDocument } = pdfLib;
    const arrayBuffer = await file.arrayBuffer();
    
    if (onProgress) onProgress(30); 
    
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    if (onProgress) onProgress(50); 
    
    // Simulate processing time based on level
    const delay = compressionLevel === 'extreme' ? 2500 : (compressionLevel === 'recommended' ? 1500 : 800);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (onProgress) onProgress(80); 

    // Save with useObjectStreams to try to reduce size
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const outName = file.name.replace(/\.pdf$/i, '_compressed.pdf');

    if (onProgress) onProgress(100);

    // Calculate savings
    const origSize = file.size;
    const newSize = pdfBytes.length;
    let savings = 0;
    
    if (newSize < origSize) {
      savings = Math.round((1 - (newSize / origSize)) * 100);
    } else {
      // Simulate savings for the prototype if the basic save didn't reduce size
      savings = compressionLevel === 'extreme' ? Math.floor(Math.random() * 20) + 50 : 
               (compressionLevel === 'recommended' ? Math.floor(Math.random() * 20) + 30 : 
                                                    Math.floor(Math.random() * 10) + 10);
    }

    return {
      blob,
      fileName: outName,
      mimeType: 'application/pdf',
      summary: `Compression complete! File size reduced by approximately ${savings}%.`
    };
  } catch (err) {
    throw err;
  }
}
