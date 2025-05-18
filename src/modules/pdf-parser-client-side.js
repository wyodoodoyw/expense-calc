'use client';

import { pdfjs } from 'react-pdf';
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url
// ).toString();
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

async function extractTextFromPDF(file) {
  try {
    // Create a blob URL for the PDF file
    const blobUrl = URL.createObjectURL(file);
    // Load the PDF file
    const loadingTask = pdfjs.getDocument(blobUrl);
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let extractedText = '';
    // Iterate through each page and extract text
    for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
      // console.log(`Page: ${pageNumber}`);
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      // console.log(textContent);
      let transform = textContent.items[0].transform[5];
      let pageText = [];

      // insert '*!*' each time transform changes to separate line
      for (let i = 0; i < textContent.items.length; i++) {
        const item = textContent.items[i];
        if (item.transform[5] !== transform) {
          transform = item.transform[5];
          pageText.push('*!*');
          pageText.push(item.str);
        } else {
          pageText.push(item.str);
        }
      }
      // join strings together
      const pageTextString = pageText.join(' ');
      extractedText += pageTextString;
    }

    if (extractedText) {
      return extractedText;
    }

    console.error('Error extracting text from PDF');
    // Clean up the blob URL
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
  }
}
export default extractTextFromPDF;
