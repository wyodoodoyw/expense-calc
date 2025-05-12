import './App.css';
import Disclaimer from './Components/Disclaimer';
// import Alert from './Components/Alert';
import Accordion from './Components/Accordion';
// import Layover from './Components/Layover';
// import Domestic from './Components/Domestic';
import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  const [clicked, setClicked] = useState(false);

  return (
    <>
      <div className="container mb-0">
        <div className="text-center pb-4">
          {/* <img
            src="src/images/rondollaelle.png"
            className="img-thumbnail"
            alt="logo"
            height={150}
            width={150}
          ></img> */}
          <h1 className="heading mt-3 mb-3">Expense Calculator</h1>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {!clicked && (
              <Disclaimer clicked={clicked} setClicked={setClicked} />
            )}
            {clicked && <Accordion />}
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
