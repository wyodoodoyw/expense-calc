import { useState } from 'react';
import extractTextFromPDF from 'pdf-parser-client-side';
import { openDB } from 'idb';

//----- COMPONENT -----//

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [expensesList, setExpensesList] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  async function addExpensetoDB(expense) {
    const db = await openDB('expenses', 1, {
      upgrade(db) {
        //Create a store of objects
        const store = db.createObjectStore('expenses', {
          // The 'id' property of the object will be the key.
          keyPath: 'id',
          // If it isn't explicitly set, create a value by auto incrementing.
          autoIncrement: true,
        });
        // Create an index on the 'destination' property of the objects
        store.createIndex('destination', 'destination');
      },
    });

    // Add an object to the store
    await db.add('expenses', expense);

    // Add multiple articles in one transaction:
    // console.log(`!typeof: ${JSON.stringify(expensesList)}`);
  }

  //----- PARSER -----//

  const parseLineAsBracelet = (line) => {
    // New object
    let newExpense = {
      destination: '',
      airport_codes: [],
      country_code: '',
      // expenses: {
      //   breakfast: null,
      //   lunch: null,
      //   dinner: null,
      //   snack: null,
      //   day: null,
      // },
      bracelet_provided: true,
      // previous_allowance: null,
      // adjustment: null,
      // percent_change: null,
    };

    // below is reused code
    const preDest = line.indexOf(')');
    newExpense.destination = line.substring(0, preDest + 1);
    newExpense.airport_codes = line.match(/\([A-Z]{3}\)/);
    for (let i = 0; i < newExpense.airport_codes.length; i++) {
      newExpense.airport_codes[i] = newExpense.airport_codes[i]
        .replace('(', '')
        .replace(')', '');
    }

    newExpense.country_code = line.match(/ [A-Z]{2} /gm)[0].replace(' ', '');
    // reused to here

    addExpensetoDB(newExpense);
  };

  const parseLine = (line) => {
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
    const preDest = line.indexOf(')');
    if (preDest != -1) {
      newExpense.destination = line.substring(0, preDest + 1);
    } else if (line.includes('Canada')) {
      newExpense.destination = 'Canada';
    } else if (line.includes('Mexico')) {
      newExpense.destination = 'Mexico - Other';
    } else if (line.includes('U.S.')) {
      newExpense.destination = 'U.S.';
    }

    newExpense.airport_codes = line.match(/\([A-Z]{3}\)/);
    if (newExpense.airport_codes) {
      for (let i = 0; i < newExpense.airport_codes.length; i++) {
        newExpense.airport_codes[i] = newExpense.airport_codes[i]
          .replace('(', '')
          .replace(')', '');
      }
    }

    newExpense.country_code = line.match(/ [A-Z]{2} /gm)[0].replace(' ', '');

    const amounts = line.match(/-?\d{1,3}.\d{2}[^%]/gm);
    for (let i = 0; i < amounts.length; i++) {
      amounts[i] = amounts[i].replace(/ /g, '');
    }

    // Calculate expense amount for a full day 00:00-23:59
    amounts.push(
      (
        Number(amounts[2]) +
        Number(amounts[3]) +
        Number(amounts[4]) +
        Number(amounts[5])
      ).toString()
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
  };

  const handleUpload = async () => {
    if (file) {
      try {
        // Read pdf file
        let text = await extractTextFromPDF(file, 'custom');
        let lines = text.split(/\s{1}\$(\s)(?<!(?=\1)..)\1(?!\1)/gm); // .$.., but not .$... as line separator
        let preProcessedText = [];
        let processedText = [];

        // Remove empty lines
        for (let i = 0; i < lines.length; i++) {
          lines[i] !== ' ' && preProcessedText.push(lines[i]);
        }
        console.log(`!preprocessedText.length: ${preProcessedText.length}`);

        // Find and process Bracelet Only destinations
        for (let i = 0; i < preProcessedText.length; i++) {
          const test1 = 'Barbados (BGI)   BB   BGI  ';
          const test2 = 'Cayo Coco (CCC)   CU   CCC  ';
          const test3 = 'Curaçao (CUR)   CW   CUR  ';
          const test4 = 'Huatulco (HUX)   MX   HUX  '; //#
          const test5 = 'Ixtapa (ZIH)   MX   ZIH  '; //#
          const test6 = 'Liberia (LIR)   CR   ';
          const test7 =
            'Puerto Plata (POP)   DO   POP  Puerto Vallarta (PVR)   MX  PVR'; //#
          const test8 = 'St. Lucia (UVF)   LC   UVF  ';
          const test9 = 'Santa Clara (SNU)   CU   SNU  ';
          const test10 = 'Varadero (VRA)   CU   VRA  '; //manually create entry for Cuba with all airport codes?
          if (preProcessedText[i].includes(test1)) {
            processedText.push(test1);
            processedText.push(preProcessedText[i].replace(test1, ''));
          } else if (preProcessedText[i].includes(test2)) {
            // Cayo Coco
            processedText.push(preProcessedText[i].replace(test2, ''));
          } else if (preProcessedText[i].includes(test3)) {
            processedText.push(test3);
            processedText.push(preProcessedText[i].replace(test3, ''));
          } else if (preProcessedText[i].includes(test4)) {
            processedText.push(test4);
            processedText.push(preProcessedText[i].replace(test4, ''));
          } else if (preProcessedText[i].includes(test5)) {
            processedText.push(test5);
            processedText.push(preProcessedText[i].replace(test5, ''));
          } else if (preProcessedText[i].includes(test6)) {
            processedText.push(test6);
            processedText.push(preProcessedText[i].replace(test6, ''));
          } else if (preProcessedText[i].includes(test7)) {
            processedText.push(test7);
            processedText.push(preProcessedText[i].replace(test7, ''));
          } else if (preProcessedText[i].includes(test8)) {
            processedText.push(test8);
            processedText.push(preProcessedText[i].replace(test8, ''));
          } else if (preProcessedText[i].includes(test9)) {
            // Santa Clara
            processedText.push(preProcessedText[i].replace(test9, ''));
          } else if (preProcessedText[i].includes(test10)) {
            // Varadero
            processedText.push(preProcessedText[i].replace(test10, ''));
          } else {
            processedText.push(preProcessedText[i]);
          }
        }

        console.log(`!processedText.length: ${processedText.length}`);

        // Go through each line of processedText and parse according to conditions
        for (let i = 0; i < processedText.length; i++) {
          if (i === 0) {
            // remove the headers
            processedText[i] = processedText[i].replace(
              'AIR CANADA PILOT / FLIGHT ATTENDANT  Location   Country   Station   Previous  Allowance   Adjustment *   Status   % Change   Breakfast   Lunch   Dinner   Snack   Total  ',
              ''
            );
            parseLine(processedText[i]);
          } else if (!processedText[i].includes('$')) {
            parseLineAsBracelet(processedText[i]);
          } else if (processedText[i].includes('BRACELET')) {
            // pass
          } else {
            parseLine(processedText[i]);
          }
        }
        // Add Cuba, Mexico, POP and other bracelet destinations to DB here
      } catch (err) {
        console.error(`!Error: ${err}`);
      }
    }
  };

  // .then((db) => {
  //   const tx = db.transaction('expenses', 'readwrite');
  //   expensesList.map((exp) => {
  //     tx.store.add(exp);
  //   }),
  //     tx.done;
  // });

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
