import { useState } from 'react';
import extractTextFromPDF from 'pdf-parser-client-side';
// import splitStringBefore from '../splitStringBefore';
import splitStringAfter from '../splitStringAfter';
import american_airport_codes from '../data/american_airport_codes';
import canadian_airport_codes from '../data/canadian_airport_codes';

const FileUploader = ({ setUploaded }) => {
  const [file, setFile] = useState(null);
  // const [expensesList, setExpensesList] = useState([]);

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

      newExpense.country_code = line.match(/ [A-Z]{2} /g)[0].replace(' ', '');
      addExpensetoDB(newExpense);
    } catch (err) {
      console.log(`!Error in parseLineAsBracelet: ${err}`);
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
      newExpense.country_code = line.match(/ [A-Z]{2} /gm)[0].replace(' ', '');

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
        text && setUploaded(true);

        // Split text into array of lines
        let lines = text.split(/\s{1}\$(\s)(?<!(?=\1)..)\1(?!\1)/gm); // .$.., but not .$... as line separator
        // console.log(lines);
        let preProcessedText = [];
        let processedText = [];

        // Remove header, empty lines, and unwanted lines

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('Algiers (ALG)')) {
            preProcessedText.push(splitStringAfter(lines[i], 'Algiers (ALG)'));
          } else if (lines[i].includes('***BRACELET PROVIDED***')) {
            // pass
          } else if (lines[i] === ' ') {
            // pass
          } else {
            preProcessedText.push(lines[i]);
          }
        }
        // for (const line of preProcessedText) {
        //   console.log(line);
        // }

        // Create line breaks for Bracelet destinations
        for (let i = 0; i < preProcessedText.length; i++) {
          const test1 = 'Barbados (BGI)   BB   BGI  ';
          const test2 = 'Cayo Coco (CCC)   CU   CCC  ';
          const test3 = 'Curaçao (CUR)   CW   CUR  ';
          const test4 = 'Huatulco (HUX)   MX   HUX  ';
          const test5 = 'Ixtapa (ZIH)   MX   ZIH  ';
          const test6 = 'Liberia (LIR)   CR   LIR  ';
          const test7 = 'Puerto Plata (POP)   DO   POP';
          const test8 = 'Puerto Vallarta (PVR)   MX  PVR '; // ##
          const test9 = 'St. Lucia (UVF)   LC   UVF  ';
          const test10 = 'Santa Clara (SNU)   CU   SNU  ';
          const test11 = 'Varadero (VRA)   CU   VRA  ';

          if (preProcessedText[i].includes(test1)) {
            // Barbados
            processedText.push(test1);
            processedText.push(preProcessedText[i].replace(test1, ''));
          } else if (preProcessedText[i].includes(test2)) {
            // Cayo Coco
            processedText.push(test2);
            processedText.push(preProcessedText[i].replace(test2, ''));
          } else if (preProcessedText[i].includes(test3)) {
            // Curaçao
            processedText.push(test3);
            processedText.push(preProcessedText[i].replace(test3, ''));
          } else if (preProcessedText[i].includes(test4)) {
            // Huatulco
            processedText.push(test4);
            processedText.push(preProcessedText[i].replace(test4, ''));
          } else if (preProcessedText[i].includes(test5)) {
            // Ixtapa
            processedText.push(test5);
            processedText.push(preProcessedText[i].replace(test5, ''));
          } else if (preProcessedText[i].includes(test6)) {
            //Liberia
            processedText.push(test6);
            processedText.push(preProcessedText[i].replace(test6, ''));
          } else if (preProcessedText[i].includes(test7)) {
            // Puerto Plata and Puerto Vallarta
            processedText.push(test7);
            processedText.push(test8);
            processedText.push(
              splitStringAfter(preProcessedText[i], 'Punta Cana')
            );
          } else if (preProcessedText[i].includes(test9)) {
            // St. Lucia
            processedText.push(test9);
            processedText.push(preProcessedText[i].replace(test9, ''));
          } else if (preProcessedText[i].includes(test10)) {
            // Santa Clara
            processedText.push(test10);
            processedText.push(preProcessedText[i].replace(test10, ''));
          } else if (preProcessedText[i].includes(test11)) {
            // Varadero
            processedText.push(test11);
            processedText.push(preProcessedText[i].replace(test11, ''));
          } else {
            processedText.push(preProcessedText[i]);
          }
        }

        // Go through each line of processedText and parse according to conditions
        for (let i = 0; i < processedText.length; i++) {
          //console.log(processedText[i]);
          if (!processedText[i].includes('$')) {
            parseLineAsBracelet(processedText[i]);
          } else {
            parseLine(processedText[i]);
          }
          setUploaded(true);
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

export default FileUploader;
