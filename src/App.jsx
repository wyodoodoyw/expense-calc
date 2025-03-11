import './App.css';
import pairing from './api/pairing';
import Flight from './Components/Flight';
import Layover from './Components/Layover';

function App() {
  const display = [];

  for (let i = 0; i < pairing.sequence.length; i++) {
    if (pairing.sequence[i].type === 'flight') {
      display.push(
        <Flight
          index={pairing.sequence[i].index}
          flight_no={pairing.sequence[i].flight_no}
          dept_stn={pairing.sequence[i].dept_stn}
          arrival_stn={pairing.sequence[i].arrival_stn}
          dept_time={pairing.sequence[i].dept_time}
          arrival_time={pairing.sequence[i].arrival_time}
        />
      );
    } else if (pairing.sequence[i].type === 'layover') {
      display.push(
        <Layover
          index={pairing.sequence[i].index}
          layover={pairing.sequence[i]}
        />
      );
    }
  }

  return (
    <>
      <div className="container">
        <div className="text-center pb-4">
          <h1 className="heading">Expense Calculator</h1>
          <h3>Pairing Number: {pairing.pairing_no}</h3>
          {display}
        </div>
      </div>
    </>
  );
}

export default App;
