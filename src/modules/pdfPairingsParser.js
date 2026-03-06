import { pdfjs } from 'react-pdf';
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url
// ).toString();
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

async function extractPairingsFromPDF(file) {
  try {
    // Create a blob URL for the PDF file
    const blobUrl = URL.createObjectURL(file);
    // Load the PDF file
    const loadingTask = pdfjs.getDocument(blobUrl);
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let extracted = [];

    // Iterate through each page and extract text
    for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      // let transform = textContent.items[0].transform[5];
      let pageText = [];
      let firstPairingIdx = 0;

      // remove ' ', '', and '--' items from textContent
      for (let i = 0; i < textContent.items.length; i++) {
        const item = textContent.items[i];

        if (item.str !== ' ' && item.str !== '' && !item.str.includes('--')) {
          pageText.push(item);
        }
      }

      // find index of first pairing
      for (let i = 0; i < pageText.length; i++) {
        const item = pageText[i];

        if (
          item.str.includes('C5001') ||
          item.str.includes('C7001') ||
          item.str.includes('M5001') ||
          item.str.includes('T5001') ||
          item.str.includes('V5001')
        ) {
          firstPairingIdx = i;
          break;
        }
      }

      pageText = pageText.splice(firstPairingIdx, pageText.length);

      // break up pageText Array into array of pairings
      let transform = pageText[0].transform[5];
      let pairing = [];
      let line = [];
      for (let i = 0; i < pageText.length; i++) {
        const item = pageText[i];
        // console.log(`${item.str} ${item.transform[5]}`);

        if (i === 0) {
          // first line of pairing
          line.push(item.str);
        } else if (item.str.includes('==')) {
          // last line of pairing
          pairing.push(line);

          if (!pairing.length <= 1) {
            pairing && extracted.push(pairing);
          } else {
            console.log(`Error pairing: ${pairing}`);
          }

          line = [];
          pairing = [];
        } else if (item.transform[5] === transform) {
          // same line as previous
          line.push(item.str);
        } else if (item.transform[5] !== transform) {
          // new line

          if (
            line.join('').includes('SuMoTuWeThFrSa') ||
            line.join('').includes('LuMaMeJeVeSa') ||
            line.join(' ').includes('Produced') ||
            line.join(' ').includes('FREQ')
          ) {
            line = [];
            line.push(item.str);
          } else {
            line.length > 0 && pairing.push(line);
            line = [];
            line.push(item.str);
          }
          transform = item.transform[5];
        }
      }
    }
    if (extracted) {
      return extracted;
    }

    console.error('Error extracting text from PDF');
    // Clean up the blob URL
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
  }
}
export default extractPairingsFromPDF;
