import './App.css';
// import pairing from './api/pairing';
import Accordion from './Components/Accordion';
// import Flight from './Components/Flight';
import Layover from './Components/Layover';
// import AddButton from './Components/AddButton';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from 'react';

function App() {
  const display = [];

  // STATE
  const [expenseB, setExpenseB] = useState(17.95);

  //Complex State
  const [expense, setExpense] = useState({
    breakfast: 17.95,
    lunch: 20.33,
    dinner: 40.27,
    snack: 10.52,
  });

  // const handleChange(event) => {
  //   const {value, name} = event.target;

  //   setExpense(prev => {
  //     return {
  //       ...prev,
  //     [breakfast]: value
  //   };
  //   });
  // }

  // for (let i = 0; i < pairing.sequence.length; i++) {
  //   if (pairing.sequence[i].type === 'flight') {
  //     display.push(<Flight key={i} flight={pairing.sequence[i]} />);
  //   } else if (pairing.sequence[i].type === 'layover') {
  //     display.push(<Layover key={i} layover={pairing.sequence[i]} />);
  //   }
  // }

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
          {/* <h3>Pairing Number: {pairing.pairing_no}</h3> */}

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* <Accordion expenseB={expenseB} setExpenseB={setExpenseB} /> */}
            <Layover layover={layover} location_exp={location_exp} />
          </LocalizationProvider>
          {/* <AddButton /> */}
        </div>
      </div>
    </>
  );
}

export default App;
