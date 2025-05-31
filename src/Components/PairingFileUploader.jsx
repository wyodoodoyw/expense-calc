import { useState } from 'react';
import extractTextFromPDF from '../modules/pdf-parser-client-side';
import cutStringAfterInclusive from '../modules/cutStringAfterInclusive';
import parse from '../modules/parse';
// import { ClipLoader } from 'react-spinners';

// import cutStringAfterExclusive from '../cutStringAfterExclusive';
// import cutStringBeforeExclusive from '../cutStringBeforeExclusive';
// import all_airports from '../data/all_airports';
// import parseAsFlight from '../modules/parseAsFlight';
// import parseAsLayover from '../modules/parseAsLayover';

const PairingFileUploader = ({ setUploaded }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    setLoading(!loading);
    // delete existing DB
    const request = window.indexedDB.deleteDatabase('PairingsDB');
    request.onsuccess = () => {
      console.log('Database deleted successfully');
    };
    request.onerror = () => {
      console.log('Error deleting database');
    };
    request.onblocked = () => {
      console.log('Database deletion blocked');
    };

    if (file) {
      // Read pdf file
      let text = await extractTextFromPDF(file);
      text && setUploaded(true);
      // Remove header
      const firstPairingNumber = text.match(/(C|M|T|V)[0-9]{4}/)[0];
      text = cutStringAfterInclusive(text, firstPairingNumber);
      const pairings = text.match(
        /(C[0-9]{4}|M[0-9]{4}|T[0-9]{4}|V[0-9]{4})[a-zA-Z0-9 .,!?/()\-$*]*/g
      );

      for (let i = 0; i <= pairings.length; i++) {
        if (i < pairings.length) {
          const pairing = pairings[i];
          const pairingNo = pairing.match(/T[0-9]{4}/g)[0];
          // console.log((pairingNo);
          if (pairing === '' || pairing === ' ' || pairing === null) {
            //pass
          } else if (pairing.includes('==')) {
            //pass
            // } else if (pairingNo === 'T5147') {
          } else if (pairing.length > 2) {
            // console.log(pairing);
            parse(pairing);
          }
        } else {
          setLoading(!loading);
        }
      }
    }
  };

  return (
    <>
      <div className="input-group">
        <input id="file" type="file" onChange={handleFileChange} />
      </div>

      {file && (
        <button onClick={handleUpload} className="submit">
          Upload Pairing File
        </button>
      )}
    </>
  );
};

export default PairingFileUploader;
