import './App.css';
import Alert from './Components/Alert';
import Accordion from './Components/Accordion';
// import Layover from './Components/Layover';
import Domestic from './Components/Domestic';
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

  // const location_exp = sessionStorage.getItem('AKL');
  const location_exp = {
    breakfast: Number(sessionStorage.getItem('ALG')),
    lunch: 49.96,
    dinner: 57.26,
    snack: 20.36,
    day: 157.49,
  };

  const turn = {
    turn_start: '06:30',
    turn_stn: 'YVR',
    turn_end: '18:31',
    turn_expenses: 'BLD',
    turn_cico: 0,
    turn_expenses_total: 78.55,
    turn_length: '13:16', //duty
  };

  const turn_expenses = {
    breakfast: 17.95,
    lunch: 20.33,
    dinner: 40.27,
    snack: 10.52,
    day: 89.07,
  };

  return (
    <>
      <div className="container">
        <div className="text-center pb-4">
          <h1 className="heading mt-3 mb-3">Expense Calculator</h1>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Accordion location_exp={location_exp} />
            {/* <Layover layover={layover} location_exp={location_exp} />
      /* <Domestic turn={turn} location_exp={turn_expenses} /> */}
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
