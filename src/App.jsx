import './App.css';
import pairing from './api/pairing';
import Flight from './Components/Flight';
import Layover from './Components/Layover';

function App() {
  return (
    <>
      <div className="container">
        <div className="text-center pb-4">
          <h1 className="heading">Expense Calculator</h1>
          <h3>Pairing Number: {pairing.pairing_no}</h3>
        </div>

        <Flight
          index={1}
          flight_no="1"
          dept_stn="YYZ"
          arrival_stn="HND"
          dept_time="13:15"
          arrival_time="15:40"
        />
        <Layover index={2} layover_stn="HND" layover_expenses="$127.89" />
      </div>
    </>
  );
}

export default App;
