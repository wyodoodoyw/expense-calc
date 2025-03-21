import { useState } from 'react';
import extractTextFromPDF from 'pdf-parser-client-side';

const parse = (line) => {
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
    adjustmnent: null,
    percent_change: null,
  };

  const preDest = line.indexOf(')');
  newExpense.destination = line.substring(0, preDest + 1);
  newExpense.airport_codes = line.match(/\([A-Z]{3}\)/);
  for (let i = 0; i < newExpense.airport_codes.length; i++) {
    newExpense.airport_codes[i] = newExpense.airport_codes[i]
      .replace('(', '')
      .replace(')', '');
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
  newExpense.adjustmnent = amounts[1];
  newExpense.expenses.breakfast = amounts[2];
  newExpense.expenses.lunch = amounts[3];
  newExpense.expenses.dinner = amounts[4];
  newExpense.expenses.snack = amounts[5];
  newExpense.expenses.day = amounts[6];
  newExpense.percent_change = line.match(/-?\d{1,3}.\d{2}%/)[0];

  console.log(newExpense);
  return newExpense;
};

const FileUploader = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      try {
        let text = await extractTextFromPDF(file, 'custom');
        let lines = text.split(/\s{1}\$(\s)(?<!(?=\1)..)\1(?!\1)/gm); // .$.., but not .$... as line separator
        let processedText = [];
        for (let i = 0; i < lines.length; i++) {
          // console.log(`!${i}${lines[i]}`);
          lines[i] !== ' ' && processedText.push(lines[i]);
        }
        // console.log(processedText);

        // Prepare DB

        let db;
        const request = window.indexedDB.open('ExpensesDB');

        request.onerror = (event) => {
          console.error(`Database error: ${event.target.error?.message}`);
        };

        request.onsuccess = (event) => {
          db = event.target.result;
        };

        // Parse data
        // let newExpense = {
        //   destination: '',
        //   airport_codes: [],
        //   country_code: '',
        //   expenses: {
        //     breakfast: null,
        //     lunch: null,
        //     dinner: null,
        //     snack: null,
        //     day: null,
        //   },
        //   bracelet_provided: false,
        //   previous_allowance: null,
        //   adjustmnent: null,
        //   percent_change: null,
        // };

        for (let i = 0; i < processedText.length; i++) {
          if (i === 0) {
            // remove the headers
            processedText[i] = processedText[i].replace(
              'AIR CANADA PILOT / FLIGHT ATTENDANT  Location   Country   Station   Previous  Allowance   Adjustment *   Status   % Change   Breakfast   Lunch   Dinner   Snack   Total  ',
              ''
            );

            return parse(processedText[i]);
            //   const preDest = processedText[i].indexOf(')');
            //   newExpense.destination = processedText[i].substring(0, preDest + 1);
            //   newExpense.airport_codes = processedText[i].match(/\([A-Z]{3}\)/);
            //   for (let i = 0; i < newExpense.airport_codes.length; i++) {
            //     newExpense.airport_codes[i] = newExpense.airport_codes[i]
            //       .replace('(', '')
            //       .replace(')', '');
            //   }

            //   newExpense.country_code = processedText[i]
            //     .match(/ [A-Z]{2} /gm)[0]
            //     .replace(' ', '');

            //   const amounts = processedText[i].match(/-?\d{1,3}.\d{2}[^%]/gm);
            //   for (let i = 0; i < amounts.length; i++) {
            //     amounts[i] = amounts[i].replace(/ /g, '');
            //   }

            //   // Calculate expense amount for a full day 00:00-23:59
            //   amounts.push(
            //     (
            //       Number(amounts[2]) +
            //       Number(amounts[3]) +
            //       Number(amounts[4]) +
            //       Number(amounts[5])
            //     ).toString()
            //   );

            //   newExpense.previous_allowance = amounts[0];
            //   newExpense.adjustmnent = amounts[1];
            //   newExpense.expenses.breakfast = amounts[2];
            //   newExpense.expenses.lunch = amounts[3];
            //   newExpense.expenses.dinner = amounts[4];
            //   newExpense.expenses.snack = amounts[5];
            //   newExpense.expenses.day = amounts[6];
            //   newExpense.percent_change =
            //     processedText[i].match(/-?\d{1,3}.\d{2}%/)[0];

            //   console.log(newExpense);
            // } else if (i === 1) {
            //   const preDest = processedText[i].indexOf(')');
            //   newExpense.destination = processedText[i].substring(0, preDest + 1);
            //   newExpense.airport_codes = processedText[i].match(/\([A-Z]{3}\)/);
            //   for (let i = 0; i < newExpense.airport_codes.length; i++) {
            //     newExpense.airport_codes[i] = newExpense.airport_codes[i]
            //       .replace('(', '')
            //       .replace(')', '');
            //   }

            //   newExpense.country_code = processedText[i]
            //     .match(/ [A-Z]{2} /gm)[0]
            //     .replace(' ', '');

            //   const amounts = processedText[i].match(/-?\d{1,3}.\d{2}[^%]/gm);
            //   for (let i = 0; i < amounts.length; i++) {
            //     amounts[i] = amounts[i].replace(/ /g, '');
            //   }

            //   // Calculate expense amount for a full day 00:00-23:59
            //   amounts.push(
            //     (
            //       Number(amounts[2]) +
            //       Number(amounts[3]) +
            //       Number(amounts[4]) +
            //       Number(amounts[5])
            //     ).toString()
            //   );

            //   newExpense.previous_allowance = amounts[0];
            //   newExpense.adjustmnent = amounts[1];
            //   newExpense.expenses.breakfast = amounts[2];
            //   newExpense.expenses.lunch = amounts[3];
            //   newExpense.expenses.dinner = amounts[4];
            //   newExpense.expenses.snack = amounts[5];
            //   newExpense.expenses.day = amounts[6];
            //   newExpense.percent_change =
            //     processedText[i].match(/-?\d{1,3}.\d{2}%/)[0];

            //   console.log(newExpense);
          } else if (i === processedText.length - 1) {
            // ***BRACELET PROVIDED***
            return;
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

export default FileUploader;
