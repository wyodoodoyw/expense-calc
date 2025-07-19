import './App.css';
import Disclaimer from './Components/Disclaimer';
import Accordion from './Components/Accordion';
import { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  const [clicked, setClicked] = useState(false);
  const [expensesUploaded, setExpensesUploaded] = useState(false);
  const [pairingsUploaded, setPairingsUploaded] = useState(false);

  useEffect(() => {
    checkDBExists();
  }, []);

  const checkDBExists = () => {
    // check if ExpensesDB exists and skip uploading if so
    const exRequest = window.indexedDB.open('ExpensesDB');
    exRequest.onsuccess = (e) => {
      if (e.target.result.oldVersion > 0) {
        console.log('Exists!');
        setPairingsUploaded(true);
      }
    };
    // check if PairingsDB exists and skip uploading if so
    const paRequest = window.indexedDB.open('PairingsDB');
    paRequest.onsuccess = (e) => {
      if (e.target.result.oldVersion > 0) {
        console.log('Exists!');
        setExpensesUploaded(true);
      }
    };
  };

  return (
    <>
      <div className="container mb-0">
        <div className="text-center pb-4">
          <h1 className="heading mt-3 mb-3">Expense Calculator</h1>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {!clicked && (
              <Disclaimer clicked={clicked} setClicked={setClicked} />
            )}
            {clicked && (
              <Accordion
                pairingsUploaded={pairingsUploaded}
                setPairingsUploaded={setPairingsUploaded}
                expensesUploaded={expensesUploaded}
                setExpensesUploaded={setExpensesUploaded}
              />
            )}
          </LocalizationProvider>
        </div>
      </div>
      <footer className="text-center mt-auto mb-0">
        Copyright {'\u00A9'} Wu Mai {new Date().getFullYear()}
      </footer>
    </>
  );
}

export default App;
