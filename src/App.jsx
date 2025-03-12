import './App.css';
import pairing from './api/pairing';
import Flight from './Components/Flight';
import Layover from './Components/Layover';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  const display = [];

  for (let i = 0; i < pairing.sequence.length; i++) {
    if (pairing.sequence[i].type === 'flight') {
      // display.push(<Flight key={i} flight={pairing.sequence[i]} />);
    } else if (pairing.sequence[i].type === 'layover') {
      display.push(<Layover key={i} layover={pairing.sequence[i]} />);
    }
  }

  return (
    <>
      <div className="container">
        <div className="text-center pb-4">
          <h1 className="heading">Expense Calculator</h1>
          <h3>Pairing Number: {pairing.pairing_no}</h3>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {display}
          </LocalizationProvider>
        </div>
      </div>
    </>
  );
}

export default App;
