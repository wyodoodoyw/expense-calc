import { useState, useEffect } from 'react';
import PairingFileUploader from './PairingFileUploader';
import SearchPairings from './SearchPairings';

function Accordian() {
  // const [selectedValue, setSelectedValue] = useState();
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    checkDBExists;
  }, []);

  const checkDBExists = () => {
    // check if PairingsDB exists and skip uploading if so
    const request = window.indexedDB.open('PairingsDB', 1);
    request.onsuccess = (e) => {
      console.log(`version: ${e.target.addEventListener.result.oldversion}`);
      if (e.target.result.oldversion === 1) {
        console.log('Exists!');
        setUploaded(true);
      }
    };
  };

  return (
    <div className="accordion" id="accordian">
      {/* UPLOAD PANEL */}

      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseOne"
            aria-expanded="true"
            aria-controls="collapseOne"
          >
            <strong>Upload the expenses file for the block month.</strong>
            <span className="ms-2">ex. 202410-MealAllowances.pdf</span>
          </button>
        </h2>
        <div
          id="collapseOne"
          className={'accordion-collapse ' + (uploaded ? 'collapse' : 'show')}
          data-bs-parent="#accordian"
        >
          <div className="accordion-body">
            <p className="text-start">
              Example: For May 2025, go to the following:
            </p>
            <p className="text-start">
              ACAeronet → Crew Scheduling & Planning → Block Bid Packages →
              2025-05 May → ALL → 202505-MealAllowances
            </p>
            {/* <FileUploader setUploaded={setUploaded} /> */}
            <PairingFileUploader setUploaded={setUploaded} />
          </div>
        </div>
      </div>
      {/* SEARCH PANEL */}
      <SearchPairings uploaded={uploaded} />
    </div>
  );
}

export default Accordian;
