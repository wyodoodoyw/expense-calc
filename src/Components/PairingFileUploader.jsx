import { useState } from 'react';
import extractPairingsFromPDF from '../modules/pdfPairingsParser';
// import cutStringAfterInclusive from '../modules/cutStringAfterInclusive';
import parse from '../modules/parse';

const PairingFileUploader = (props) => {
  const { setPairingsUploaded } = props;
  const [file, setFile] = useState(null);
  // const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    // setLoading(!loading);
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
      let pairingsArray = await extractPairingsFromPDF(file);
      pairingsArray && setPairingsUploaded(true);

      // console.log(pairingsArray[1602]);

      for (let i = 0; i <= pairingsArray.length - 1; i++) {
        parse(pairingsArray[i], i);
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
