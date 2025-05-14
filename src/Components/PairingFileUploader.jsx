import { useState } from 'react';
import extractTextFromPDF from 'pdf-parser-client-side';
import cutStringAfterInclusive from '../cutStringAfterInclusive';
import cutStringAfterExclusive from '../cutStringAfterExclusive';
import cutStringBeforeExclusive from '../cutStringBeforeExclusive';
// import cutStringBeforeExclusive from '../cutStringBeforeExclusive';
// import american_airport_codes from '../data/american_airport_codes';
// import canadian_airport_codes from '../data/canadian_airport_codes';

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
      // New object
      let newPairing = {
        pairingNumber: pairing.match(/T[0-9]{4}/)[0],
        pairingOperates: pairing
          .match(/[0-9]{2}[A-Z]{3} {1,3}- {1,3}[0-9]{2}[A-Z]{3}/)[0]
          .replace('   -   ', '-'),
        // pairingPurser: pairing.match(/P [0-9]{2}/)[0].replace('P ', '') || '0',
        // pairingFA: pairing.match(/FA[0-9]{2}/)[0].replace('FA', '') || '0',
        // pairingBL: pairing.match(/BL[0-9]{2}/)[0].replace('BL', '') || '0',
        // pairingLanguages: pairing.match(/[A-Z]{2}[0-9]{2}/) || [],
        pairingCrew:
          pairing.match(
            /(P [0-9]{2}|FA[0-9]{2}|BL[0-9]{2})|[A-Z]{2}[0-9]{2}/g
          ) || [],
      };
      if (newPairing.pairingCrew) {
        // Remove substring that has been parsed above
        pairing = cutStringAfterExclusive(
          pairing,
          newPairing.pairingCrew[newPairing.pairingCrew.length - 1]
        );
      }

      // ******* FIX THIS ******* //
      newPairing.daysOperating = pairing
        .substring(0, 7)
        .replace(' ', '')
        .match(/[1-7]/g);

      newPairing.calendar = cutStringAfterInclusive(pairing, 'Su   Mo');
      let lastLine = cutStringAfterInclusive(pairing, 'TAFB');
      lastLine = cutStringBeforeExclusive(lastLine, 'Su   Mo');

      newPairing.tafb = lastLine.match(/[0-9]{3,5}/g)[0];
      newPairing.totalCredit = lastLine.match(/[0-9]{3,4}/g)[1];
      // console.log(newPairing);

      // Remove substring that has been parsed above
      pairing = cutStringBeforeExclusive(pairing, 'TAFB');

      let penultimateLine = cutStringAfterInclusive(pairing, 'BLOCK');

      newPairing.blockCredit = penultimateLine.match(/[0-9]{3,4}/g)[0];
      penultimateLine = cutStringAfterExclusive(
        penultimateLine,
        newPairing.blockCredit
      );
      // console.log(penultimateLine);
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

      pairing.slice(/[A-Z][a-z]{2,9}/g);
      console.log(pairing);
      // if (pairing.includes('-DPG')) {
      //   const sequence = [];
      //   sequence.push(
      //     cutStringBeforeExclusive(pairing, `${newPairing.dpg} -DPG`)
      //   );
      //   sequence.push(
      //     cutStringAfterInclusive(pairing, `${newPairing.dpg} -DPG`)
      //   );
      //   // console.log(`${newPairing.dpg} -DPG`);
      //   // pairing.slice(`${newPairing.dpg} -DPG`);
      //   // console.log(sequence);
      // }
    } catch (err) {
      // console.log(`!Error in parse: ${err}`);
      return;
    }
  };

  const handleUpload = async () => {
    // delete existing DB
    // const request = window.indexedDB.deleteDatabase('ExpensesDB');
    // request.onsuccess = () => {
    //   console.log('Database deleted successfully');
    // };
    // request.onerror = () => {
    //   console.log('Error deleting database');
    // };
    // request.onblocked = () => {
    //   console.log('Database deletion blocked');
    // };

    if (file) {
      try {
        //     // Read pdf file
        let text = await extractTextFromPDF(file, 'custom');
        // text && setUploaded(true);
        // Remove header
        text = cutStringAfterInclusive(text, 'T5001');

        const pairings = text.split(/(T[0-9]{4}[a-zA-Z0-9 .,!?/()\-$]*)/g);
        for (const pairing of pairings) {
          if (!pairing) {
            //pass
          } else if (pairing.includes('==')) {
            //pass
          } else {
            parse(pairing);
          }
        }

        // console.log(processedPairings);
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
