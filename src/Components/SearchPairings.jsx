import { useState } from 'react';
// import { TimePicker } from '@mui/x-date-pickers';
import Pairing from './Pairing';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
// const timeFormat = 'HH:mm';

function SearchPairings({ uploaded }) {
  const [pairingNumber, setPairingNumber] = useState('T5001');
  const [pairingSearchResult, setPairingSearchResult] = useState();

  const handlePairingNumberChange = (e) => {
    const value = e.target.value;
    console.log(value);
    setPairingNumber(value);
    const valid = value.match(/(C|M|T|V)[0-9]{4}/g);
    if (valid && valid.length === 1) {
      console.log('Valid, one result');
    }
  };

  const handleSearchClick = () => {
    const request = window.indexedDB.open('PairingsDB', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction(['pairings'], 'readonly');
      const pairingsStore = tx.objectStore('pairings');
      const pairingNumberIndex = pairingsStore.index('pairingNumber');
      const request = pairingNumberIndex.get(pairingNumber);

      request.onsuccess = () => {
        setPairingSearchResult(request.result);
      };

      request.onerror = (event) => {
        console.log(`!DB Error: ${event.target.error}`);
      };

      tx.oncomplete = () => {
        db.close();
      };
    };
  };

  return (
    <div className="accordion-item">
      <h2 className="accordion-header">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapseTwo"
          aria-expanded="false"
          aria-controls="collapseTwo"
        >
          <strong>Search for an existing pairing or create a new one.</strong>
        </button>
      </h2>
      <form className="mx-3">
        <div
          className={
            'mb-3 accordion-collapse ' + (uploaded ? 'show' : 'collapse')
          }
        >
          <div className="input-group mb-3" id="airport_code">
            <span className="input-group-text">Pairing Number: </span>
            <input
              list="pairings"
              id="pairing"
              name="pairing"
              // type="text"
              className="col-11 form-control flex"
              placeholder=""
              value={pairingNumber}
              onChange={(e) => handlePairingNumberChange(e)}
            />
            <div className="btn btn-primary" onClick={handleSearchClick}>
              Search
            </div>
          </div>
        </div>
      </form>
      {pairingSearchResult && <Pairing originalPairing={pairingSearchResult} />}
    </div>
  );
}

export default SearchPairings;
