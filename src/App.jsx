import './App.css';
import Disclaimer from './Components/Disclaimer';
import Accordion from './Components/Accordion';
// import Layover from './Components/Layover';
// import Domestic from './Components/Domestic';
import { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  const [clicked, setClicked] = useState(true);
  const [uploaded, setUploaded] = useState(true);

  useEffect(() => {
    checkDBExists();
  }, []);

  const checkDBExists = () => {
    // check if PairingsDB exists and skip uploading if so
    const request = window.indexedDB.open('PairingsDB');
    request.onsuccess = (e) => {
      if (e.target.result.oldVersion > 0) {
        console.log('Exists!');
        setUploaded(true);
      }
    };
  };

  return (
    <>
      <div className="container mb-0">
        <div className="text-center pb-4">
          <h1 className="heading mt-3 mb-3">Expense Calculator</h1>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* {!clicked && (
              <Disclaimer clicked={clicked} setClicked={setClicked} />
            )} */}
            {clicked && (
              <Accordion uploaded={uploaded} setUploaded={setUploaded} />
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
