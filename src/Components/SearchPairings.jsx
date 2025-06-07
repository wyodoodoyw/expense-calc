/* eslint-disable react/prop-types */
import { useState } from 'react';
// import { TimePicker } from '@mui/x-date-pickers';
import { useDispatch } from 'react-redux';
import {
  initializePairing,
  processSequence,
} from '../features/pairing/pairingSlice';
import Pairing from './Pairing';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
// const timeFormat = 'HH:mm';

function SearchPairings(props) {
  const { expensesUploaded, pairingsUploaded } = props;

  const [pairingNumber, setPairingNumber] = useState('T5001');
  const [pairingSearchResult, setPairingSearchResult] = useState(false);

  const dispatch = useDispatch();

  const handlePairingNumberChange = (e) => {
    const value = e.target.value;
    setPairingNumber(value);
    const valid = value.match(/(C|M|T|V)[0-9]{4}/g);
    if (valid && valid.length === 1) {
      // console.log('Valid, one result');
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
        setPairingSearchResult(true);
        if (request.result) {
          dispatch(
            initializePairing({
              id: request.result.id,
              pairingNumber: request.result.pairingNumber,
              pairingOperates: request.result.pairingOperates,
              pairingPurser: request.result.pairingPurser,
              pairingFA: request.result.pairingFA,
              pairingBL: request.result.pairingBL,
              pairingGP: request.result.pairingGP,
              pairingGY: request.result.pairingGY,
              pairingDates: request.result.pairingDates,
              pairingLanguages: request.result.pairingLanguages,
              blockCredit: request.result.blockCredit,
              cicoAmount: request.result.cicoAmount,
              tafb: request.result.tafb,
              totalAllowance: request.result.totalAllowance,
              totalCredit: request.result.totalCredit,
              totalDuty: request.result.totalDuty,
            })
          );

          dispatch(processSequence(request.result.sequence));
          // for (let i = 0; i < request.result.sequence; i++) {
          //   console.log(request.result.sequence[i]);
          //   if (request.result.sequence[i][0].aircraft) {
          //     dispatch(
          //       addFlightToPairing({
          //         index: request.result.sequence[0][0].index,
          //         aircraft: request.result.sequence[0][0].aircraft,
          //         arrivalAirport: request.result.sequence[0][0].arrivalAirport,
          //         arrivalTime: dayjs(
          //           `${request.result.sequence[0][0].arrivalTime.slice(
          //             0,
          //             -2
          //           )}:${request.result.sequence[0][0].arrivalTime.slice(-2)}`,
          //           'HH:mm'
          //         ),
          //         daysOfWeek: request.result.sequence[0][0].daysOfWeek,
          //         departureAirport:
          //           request.result.sequence[0][0].departureAirport,
          //         departureTime: dayjs(
          //           `${request.result.sequence[0][0].departureTime.slice(
          //             0,
          //             -2
          //           )}:${request.result.sequence[0][0].departureTime.slice(
          //             -2
          //           )}`,
          //           'HH:mm'
          //         ),
          //         dutyEnd: dayjs(
          //           `${request.result.sequence[0][0].dutyEnd.slice(
          //             0,
          //             -2
          //           )}:${request.result.sequence[0][0].dutyEnd.slice(-2)}`,
          //           'HH:mm'
          //         ),
          //         dutyStart: dayjs(
          //           `${request.result.sequence[0][0].dutyStart.slice(
          //             0,
          //             -2
          //           )}:${request.result.sequence[0][0].dutyStart.slice(-2)}`,
          //           'HH:mm'
          //         ),
          //         dutyTime: request.result.sequence[0][0].dutyTime,
          //         flightNumber: request.result.sequence[0][0].flightNumber,
          //         flightTime: request.result.sequence[0][0].flightTime,
          //         isDeadhead: request.result.sequence[0][0].isDeadhead || false,
          //         layoverLength:
          //           request.result.sequence[0][0].layoverLength || null,
          //         mealsOnboard:
          //           request.result.sequence[0][0].mealsOnboard || [],
          //       })
          //     );
          // }
        }
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
          <h2 className="">Step 3:</h2>
          <strong className="ms-3">Search for an existing pairing.</strong>
        </button>
      </h2>
      <form className="mx-3">
        <div
          className={
            'mb-3 accordion-collapse ' +
            (pairingsUploaded && expensesUploaded ? 'show' : 'collapse')
          }
        >
          <div className="input-group mb-3" id="airport_code">
            <span className="input-group-text">Pairing Number: </span>
            <input
              list="pairings"
              id="pairing"
              name="pairing"
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
      {pairingSearchResult && <Pairing pairingNumber={pairingNumber} />}
    </div>
  );
}

export default SearchPairings;
