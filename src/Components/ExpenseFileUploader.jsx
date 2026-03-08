import { useState } from 'react';
import extractExpensesFromPDF from '../modules/pdfExpensesParser';
import american_airport_codes from '../data/american_airport_codes';
import canadian_airport_codes from '../data/canadian_airport_codes';

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
        airport_codes = line.match(/[A-Z]{3}/g);
      } else if (line.match(/[A-Z]{3}\/[A-Z]{3}/)) {
        // capture XXX/XXX
        airport_codes = line.match(/[A-Z]{3}/g);
      } else if (line.match('Canada')) {
        airport_codes = canadian_airport_codes;
      } else if (line.match('U.S.')) {
        airport_codes = american_airport_codes;
      } else if (line.match('Jamaica - Other')) {
        airport_codes = ['KIN', 'MBJ'];
      } else if (line.match('Mexico - Other')) {
        airport_codes = ['MTY', 'TQO', 'OAX', 'GDL', 'MID'];
      } else {
        // capture (XXX), (XXX)
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
        destination: line[0],
        airport_codes: [line[2]],
        country_code: line[1],
        bracelet_provided: true,
      };
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
        destination: line[0],
        airport_codes: [],
        country_code: line[1],
        expenses: {
          breakfast: line[line.length - 5].replace('$', ''),
          lunch: line[line.length - 4].replace('$', ''),
          dinner: line[line.length - 3].replace('$', ''),
          snack: line[line.length - 2].replace('$', ''),
          day: line[line.length - 1].replace('$', ''),
        },
        bracelet_provided: false,
        previous_allowance: line[3],
        adjustment: line[4],
        percent_change: line[line.length - 6],
      };

      newExpense.airport_codes = parseAirportCodes(line[0]);

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
        let array = await extractExpensesFromPDF(file, 'custom');
        array && setExpensesUploaded(true);
        // console.log(array);

        // Parse each destination depending on expenses or bracelet
        for (let i = 0; i < array.length; i++) {
          const destination = array[i];

          if (destination.length === 3) {
            parseLineAsBracelet(destination);
          } else {
            parseLine(destination);
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
          Upload Expense File
        </button>
      )}
    </>
  );
};

export default ExpenseFileUploader;
