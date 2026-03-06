// 'use client';

import { pdfjs } from 'react-pdf';
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url
// ).toString();
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

async function extractExpensesFromPDF(file) {
  try {
    // Create a blob URL for the PDF file
    const blobUrl = URL.createObjectURL(file);
    // Load the PDF file
    const loadingTask = pdfjs.getDocument(blobUrl);
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    // Iterate through each page and extract text
    for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
      // console.log(`Page: ${pageNumber}`);
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      let pageText = [];
      let firstExpenseIdx = 0;

      // remove ' ', '', and '$' items from textContent
      for (let i = 0; i < textContent.items.length; i++) {
        const item = textContent.items[i];

        if (item.str !== ' ' && item.str !== '' && item.str !== '$') {
          pageText.push(item);
        }
      }

      // find index of Algiers
      for (let i = 0; i < pageText.length; i++) {
        const item = pageText[i];

        if (item.str.includes('Algiers')) {
          firstExpenseIdx = i;
          break;
        }
      }

      pageText = pageText.splice(firstExpenseIdx, pageText.length);

      // break up pageText Array into array of destinations
      let extracted = [];
      let destination = [];
      for (let i = 0; i < pageText.length; i++) {
        const item = pageText[i];

        if (i === 0) {
          destination.push(item.str);
        } else if (
          destination.length !== 0 &&
          (item.str.includes('(') ||
            item.str.includes(')') ||
            item.str.includes('Canada') ||
            item.str.includes('Mexico') ||
            item.str.includes('Jamaica') ||
            item.str.includes('U.S.'))
        ) {
          extracted.push(destination);
          destination = [];
          destination.push(item.str);
        } else {
          destination.push(item.str);
        }
      }
      if (extracted) {
        return extracted;
      }
    }

    console.error('Error extracting text from PDF');
    // Clean up the blob URL
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
  }
}
export default extractExpensesFromPDF;
