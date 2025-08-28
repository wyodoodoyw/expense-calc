import { useState } from 'react';
import extractTextFromPDF from '../modules/pdf-parser-client-side';
// import splitStringBefore from '../splitStringBefore';
// import cutStringAfterExclusive from '../modules/cutStringAfterExclusive';
import american_airport_codes from '../data/american_airport_codes';
import canadian_airport_codes from '../data/canadian_airport_codes';
import cutStringAfterInclusive from '../modules/cutStringAfterInclusive';

const ExpenseFileUploader = ({ setExpensesUploaded }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const addExpensetoDB = (newExpense) => {
    const request = window.indexedDB.open('ExpensesDB', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction(['expenses'], 'readwrite');
      const expensesStore = tx.objectStore('expenses');
      // const destinationIndex = expensesStore.index('destination');
      const airportCodesIndex = expensesStore.index('airport_codes');
      const countryIndex = expensesStore.index('country_code');

      expensesStore.put(newExpense);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const expensesStore = db.createObjectStore('expenses', {
        keyPath: 'id',
        autoIncrement: true,
      });
      expensesStore.createIndex('airport_codes', 'airport_codes', {
        multiEntry: true,
      });
      expensesStore.createIndex('country_code', 'country_code');
    };

    request.onerror = (event) => {
      console.log(`!DB Error: ${event.target.error}`);
    };
  };

  //----- PARSER -----//

  const parseAirportCodes = (line) => {
    try {
      let airport_codes = [];
      if (line.match(/\([A-Z]{3}, [A-Z]{3}, [A-Z]{3}\)/)) {
        // capture (XXX, XXX, XXX)
        airport_codes = line
          // .match(/\([A-Z]{3}, [A-Z]{3}, [A-Z]{3}\)/)[0]
          .match(/[A-Z]{3}/g);
      } else if (line.match(/[A-Z]{3}\/[A-Z]{3}/)) {
        airport_codes = line
          // .match(/[A-Z]{3}\/[A-Z]{3}/)[0]
          .match(/[A-Z]{3}/g);
      } else if (line.match('Canada')) {
        airport_codes = canadian_airport_codes;
      } else if (line.match('U.S.')) {
        airport_codes = american_airport_codes;
      } else if (line.match('BRACELET')) {
        //console.log(`!Bracelet: ${airport_codes.length}`);
      } else if (line.match('Jamaica - Other')) {
        airport_codes = ['KIN', 'MBJ'];
      } else if (line.match('Mexico - Other')) {
        airport_codes = ['MTY', 'TQO', 'OAX', 'GDL', 'MID'];
      } else {
        // capture (XXX), (XXX )
        airport_codes = line.match(/\([A-Z]{3} {0,1}\)/g);
      }
      if (airport_codes) {
        for (let i = 0; i < airport_codes.length || 0; i++) {
          airport_codes[i] = airport_codes[i]
            .replace('(', '')
            .replace(')', '')
            .replace(' ', '');
        }
      }
      return airport_codes;
    } catch (err) {
      console.log(`!Error in parseAirportCodes: ${err}`);
    }
  };

  const parseLineAsBracelet = (line) => {
    try {
      // New object
      let newExpense = {
        destination: '',
        airport_codes: [],
        country_code: '',
        bracelet_provided: true,
      };
      const preDest = line.indexOf(')');
      newExpense.destination = line.substring(0, preDest + 1);
      newExpense.airport_codes = parseAirportCodes(line);

      newExpense.country_code = line.match(/ [A-Z]{2} /g)[0].trim();
      addExpensetoDB(newExpense);
    } catch (err) {
      console.log(`!Error in parseLineAsBracelet: ${err} ${line}`);
      return;
    }
  };

  const parseLine = (line) => {
    try {
      // New object
      let newExpense = {
        destination: '',
        airport_codes: [],
        country_code: '',
        expenses: {
          breakfast: null,
          lunch: null,
          dinner: null,
          snack: null,
          day: null,
        },
        bracelet_provided: false,
        previous_allowance: null,
        adjustment: null,
        percent_change: null,
      };

      // catch special cases for destination (no airport code in brackets to detect)
      const preDest = line.lastIndexOf(')');
      if (preDest != -1) {
        newExpense.destination = line
          .substring(0, preDest + 1)
          .replace(' )', ')');
      } else if (line.includes('Canada')) {
        newExpense.destination = 'Canada';
      } else if (line.includes('Mexico')) {
        newExpense.destination = 'Mexico - Other';
      } else if (line.includes('U.S.')) {
        newExpense.destination = 'U.S.';
      } else if (line.includes('Jamaica')) {
        newExpense.destination = 'Jamaica - Other';
      }

      newExpense.airport_codes = parseAirportCodes(line);
      newExpense.country_code = line.match(/[A-Z]{2}/gm)[0].trim();

      const amounts = line.match(/-?\d{1,3}.\d{2}[^%]/gm);
      for (let i = 0; i < amounts.length || 0; i++) {
        amounts[i] = amounts[i].replace(/ /g, '');
      }

      // Calculate expense amount for a full day 00:00-23:59
      amounts.push(
        (
          Number(amounts[2]) +
          Number(amounts[3]) +
          Number(amounts[4]) +
          Number(amounts[5])
        )
          .toFixed(2)
          .toString()
      );

      newExpense.previous_allowance = amounts[0];
      newExpense.adjustment = amounts[1];
      newExpense.expenses.breakfast = amounts[2];
      newExpense.expenses.lunch = amounts[3];
      newExpense.expenses.dinner = amounts[4];
      newExpense.expenses.snack = amounts[5];
      newExpense.expenses.day = amounts[6];
      newExpense.percent_change = line.match(/-?\d{1,3}.\d{2}%/)[0];

      addExpensetoDB(newExpense);
    } catch (err) {
      console.log(`!Error in parseLine: ${err}`);
    }
  };

  const handleUpload = async () => {
    // delete existing DB
    const request = window.indexedDB.deleteDatabase('ExpensesDB');
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
        // Read pdf file
        let text = await extractTextFromPDF(file, 'custom');
        // console.log(text);

        // Remove header
        text = cutStringAfterInclusive(text, 'Algiers');
        text && setExpensesUploaded(true);
        // console.log(text);

        // Split destinations by *!* delimeter
        let destinations = text.split(/\*!\*\s{2}/g);

        // Find first index of ***BRACELET PROVIDED*** and slice following indices out
        let endIndex;
        for (let i = 0; i < destinations.length - 1; i++) {
          const destination = destinations[i];

          if (destination.includes('AIR CANADA FLIGHT ATTENDANT')) {
            endIndex = i;
            break;
          }
          if (destination.includes('***BRACELET PROVIDED***')) {
            endIndex = i;
            break;
          }
        }
        destinations = destinations.slice(0, endIndex);

        // Parse each destination depending on expenses or bracelet
        for (let i = 0; i < destinations.length; i++) {
          const destination = destinations[i];

          if (!destination.includes('$') && !destination.includes('BRACELET')) {
            // console.log(destination);
            parseLineAsBracelet(destination);
          } else {
            parseLine(destination);
          }
        }
        setExpensesUploaded(true);
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
          Upload Expense File
        </button>
      )}
    </>
  );
};

export default ExpenseFileUploader;
