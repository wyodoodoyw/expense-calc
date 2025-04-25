import './App.css';
// import Alert from './Components/Alert';
import Accordion from './Components/Accordion';
// import Layover from './Components/Layover';
// import Domestic from './Components/Domestic';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  return (
    <>
      <div className="container">
        <div className="text-center pb-4">
          <h1 className="heading mt-3 mb-3">Expense Calculator</h1>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Accordion />
          </LocalizationProvider>
        </div>
      </div>
      <footer className="text-center">
        Copyright {'\u00A9'} Wu Mai {new Date().getFullYear()}
      </footer>
    </>
  );
}

export default App;
