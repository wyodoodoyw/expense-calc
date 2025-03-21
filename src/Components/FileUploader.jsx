import { useState } from 'react';
import extractTextFromPDF from 'pdf-parser-client-side';

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
          // console.log(`!${index}${textAsLines[index]}`);
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

        // let expenseData = [];
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

        for (let i = 0; i < processedText.length; i++) {
          if (i === 0) {
            // remove the headers
            processedText[i] = processedText[i].replace(
              'AIR CANADA PILOT / FLIGHT ATTENDANT  Location   Country   Station   Previous  Allowance   Adjustment *   Status   % Change   Breakfast   Lunch   Dinner   Snack   Total  ',
              ''
            );
            // expenseData.push(processedText[i]);
            console.log(`! ${processedText[i]}`);
            const preDest = processedText[i].indexOf(')');
            newExpense.destination = processedText[i].substring(0, preDest + 1);
            console.log(`!Destination ${newExpense.destination}`);
            newExpense.airport_codes = processedText[i]
              .match(/\([A-Z]{3}\)/)[0]
              .replace('(', '')
              .replace(')', '');
            console.log(`!Airport Code: ${newExpense.airport_codes}`);

            newExpense.country_code = processedText[i].match(
              /([A-Z])(?<!(?=\1)..)\1(?!\1)/gm
            );
            console.log(`!Country Code: ${newExpense.country_code}`);

            const amounts = processedText[i].match(/-?\d{1,3}.\d{2}[^%]/gm);
            console.log(`!amounts: ${amounts}`);
            newExpense.previous_allowance = amounts[0];
            newExpense.adjustmnent = amounts[1];
            newExpense.expenses.breakfast = amounts[2];
            newExpense.expenses.lunch = amounts[3];
            newExpense.expenses.dinner = amounts[4];
            newExpense.expenses.snack = amounts[5];
            newExpense.expenses.day = amounts[6];
            newExpense.percent_change =
              processedText[i].match(/-?\d{1,3}.\d{2}%/)[0];

            console.log(newExpense);
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
