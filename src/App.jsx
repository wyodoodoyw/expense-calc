import './App.css';
import Layover from './Components/Layover';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  const layover = {
    layover_stn: 'HND',
    layover_start: '15:55',
    layover_end: '17:40',
    layover_expenses: 'DSBLD',
    layover_cico: 1,
    layover_expenses_total: 127.89,
    layover_length: '24:45',
  };

  const location_exp = {
    breakfast: 29.91,
    lunch: 49.96,
    dinner: 57.26,
    snack: 20.36,
    day: 157.49,
  };

  return (
    <>
      <div className="container">
        <div className="text-center pb-4">
          <h1 className="heading mt-3 mb-3">Expense Calculator</h1>
          <h4>
            To be used for calculating expenses on a layover. More functionality
            to come.
          </h4>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Layover layover={layover} location_exp={location_exp} />
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
