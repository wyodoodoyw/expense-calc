import './App.css';
import pairing from './api/pairing';
import Accordion from './Components/Accordion';
import Flight from './Components/Flight';
import Layover from './Components/Layover';
// import AddButton from './Components/AddButton';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function App() {
  const display = [];

  for (let i = 0; i < pairing.sequence.length; i++) {
    if (pairing.sequence[i].type === 'flight') {
      display.push(<Flight key={i} flight={pairing.sequence[i]} />);
    } else if (pairing.sequence[i].type === 'layover') {
      display.push(<Layover key={i} layover={pairing.sequence[i]} />);
    }
  }

  return (
    <>
      <div className="container">
        <div className="text-center pb-4">
          <h1 className="heading mt-3 mb-3">Expense Calculator</h1>
          {/* <h3>Pairing Number: {pairing.pairing_no}</h3> */}

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Accordion />
            {/* {display} */}
          </LocalizationProvider>
          {/* <AddButton /> */}
        </div>
      </div>
    </>
  );
}

export default App;
