import { useState } from 'react';
// import extractTextFromPDF from 'pdf-parser-client-side';
import extractTextFromPDF from '../modules/pdf-parser-client-side';
import cutStringAfterInclusive from '../cutStringAfterInclusive';
import cutStringAfterExclusive from '../cutStringAfterExclusive';
import cutStringBeforeExclusive from '../cutStringBeforeExclusive';
// import cutStringBeforeExclusive from '../cutStringBeforeExclusive';
// import american_airport_codes from '../data/american_airport_codes';
// import canadian_airport_codes from '../data/canadian_airport_codes';
import all_airports from '../data/all_airports';

const PairingFileUploader = () => {
  const [file, setFile] = useState(null);
  // const [expensesList, setExpensesList] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // const addExpensetoDB = (newExpense) => {
  //   const request = window.indexedDB.open('ExpensesDB', 1);

  //   request.onsuccess = (event) => {
  //     const db = event.target.result;
  //     const tx = db.transaction(['expenses'], 'readwrite');
  //     const expensesStore = tx.objectStore('expenses');
  //     // const destinationIndex = expensesStore.index('destination');
  //     const airportCodesIndex = expensesStore.index('airport_codes');
  //     const countryIndex = expensesStore.index('country_code');

  //     expensesStore.put(newExpense);
  //   };

  //   request.onupgradeneeded = (event) => {
  //     const db = event.target.result;
  //     const expensesStore = db.createObjectStore('expenses', {
  //       keyPath: 'id',
  //       autoIncrement: true,
  //     });
  //     expensesStore.createIndex('airport_codes', 'airport_codes', {
  //       multiEntry: true,
  //     });
  //     expensesStore.createIndex('country_code', 'country_code');
  //   };

  //   request.onerror = (event) => {
  //     console.log(`!DB Error: ${event.target.error}`);
  //   };
  // };

  // //----- PARSER -----//
  const parse = (pairing) => {
    try {
      if (!pairing) {
        throw new Error('Pairing is empty');
      }

      // New object
      let newPairing = {};

      // Pairing Number
      if (pairing.match(/T[0-9]{4}/)) {
        newPairing.pairingNumber = pairing.match(/T[0-9]{4}/)[0];
        console.log(newPairing.pairingNumber);
      } else {
        throw new Error('Error parsing pairing number');
      }

      // Date on which pairing operates
      if (pairing.match(/[0-9]{2}[A-Z]{3} {1,3}- {1,3}[0-9]{2}[A-Z]{3}/)) {
        newPairing.pairingOperates = pairing
          .match(/[0-9]{2}[A-Z]{3} {1,3}- {1,3}[0-9]{2}[A-Z]{3}/)[0]
          .replace('   -   ', '-');
      } else {
        throw new Error('Error parsing date on which pairing operates');
      }
      // Remove substring that has been parsed above
      pairing = cutStringAfterExclusive(pairing, '*!*');

      // Number of Pursers/Flight Attendants/Galley Attendants/Language Positions
      let crew = cutStringBeforeExclusive(pairing, '*!*');
      crew = crew.match(/[A-Z]{1,2} ?[0-9]{2}/g);

      if (crew) {
        newPairing.pairingCrew = crew;
        const languages = [];
        for (let i = 0; i < newPairing.pairingCrew.length; i++) {
          const position = newPairing.pairingCrew[i];
          if (position.includes('P')) {
            newPairing.pairingPurser = position.replace('P', '');
            // console.log(`P: ${newPairing.pairingPurser}`);
          } else if (position.includes('FA')) {
            newPairing.pairingFA = position.replace('FA', '');
            // console.log(`FA: ${newPairing.pairingFA}`);
          } else if (position.includes('BL')) {
            newPairing.pairingBL = position.replace('BL', '');
            // console.log(`BL: ${newPairing.pairingBL}`);
          } else if (position.includes('GJ')) {
            newPairing.pairingGP = position.replace('GJ', '');
            // console.log(`GJ: ${newPairing.pairingGP}`);
          } else if (position.includes('GY')) {
            newPairing.pairingGY = position.replace('GY', '');
            // console.log(`GY: ${newPairing.pairingGY}`);
          } else {
            languages.push(position);
          }
        }
        if (languages.length > 0) {
          newPairing.pairingLanguages = languages;
        }
      } else {
        throw new Error('Error parsing crew');
      }

      // Remove substring that has been parsed above
      pairing = cutStringAfterExclusive(pairing, '*!*');

      // Parse calendar and dates the pairing operates on
      newPairing.calendar = cutStringAfterInclusive(pairing, 'Su   Mo');
      newPairing.pairingDates = newPairing.calendar.match(/[0-9]{1,2}/g);

      // Parse last line of pairing (TAFB etc.)
      let lastLine = cutStringAfterInclusive(pairing, 'TAFB');
      lastLine = cutStringBeforeExclusive(lastLine, 'Su   Mo'); // TAFB/PTEB   4405   TOTAL -   1525 *!*

      newPairing.tafb = lastLine.match(/[0-9]{3,5}/g)[0];
      newPairing.totalCredit = lastLine.match(/[0-9]{3,4}/g)[1];

      // Remove substring that has been parsed above
      pairing = cutStringBeforeExclusive(pairing, 'TAFB');

      // parse second last line of pairing (Block etc.)
      let penultimateLine = cutStringAfterInclusive(pairing, 'BLOCK'); // BLOCK/H-VOL   1525   1810   (INC-$5.05   CICO)   TOTAL   ALLOWANCE   -$   305.68 *!*

      newPairing.blockCredit = penultimateLine.match(/[0-9]{3,4}/g)[0];
      penultimateLine = cutStringAfterExclusive(
        penultimateLine,
        newPairing.blockCredit
      );
      if (penultimateLine.includes('DPG')) {
        newPairing.dpg = penultimateLine.match(/[0-9]{2,3}/g)[0];
        penultimateLine = cutStringAfterExclusive(
          penultimateLine,
          newPairing.dpg
        );
      }
      newPairing.totalDuty = penultimateLine.match(/[0-9]{3,4}/g)[0];
      if (penultimateLine.includes('CICO')) {
        newPairing.cicoAmount = penultimateLine
          .match(/\$[0-9]{1,2}.[0-9]{2}/g)[0]
          .replace('$', '');
      }
      penultimateLine = cutStringAfterExclusive(penultimateLine, 'ALLOWANCE');
      newPairing.totalAllowance =
        penultimateLine.match(/[0-9]{1,3}.[0-9]{2}/g)[0];
      pairing = cutStringBeforeExclusive(pairing, '----------');

      // Split remainder of pairing into lines, either flight or layover
      const sequence = pairing.split('*!*');
      console.log(sequence);
    } catch (err) {
      console.log(`Error: ${err}`);
    }
  };

  const handleUpload = async () => {
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
      try {
        //     // Read pdf file
        let text = await extractTextFromPDF(file, 'custom');
        // text && setUploaded(true);
        // Remove header
        text = cutStringAfterInclusive(text, 'T5001');
        const pairings = text.split(/(T[0-9]{4}[a-zA-Z0-9 .,!?/()\-$*]*)/g);
        for (const pairing of pairings) {
          if (pairing === '') {
            //pass
          } else if (pairing.includes('==')) {
            //pass
          } else {
            parse(pairing);
          }
        }
      } catch (err) {
        console.error(`!Error: ${err}`);
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
