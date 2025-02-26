import './App.css';
import pairing from './api/pairing';
import Flight from './Components/Flight';
import Layover from './Components/Layover';

function App() {
  return (
    <>
      <div className="py-3">
        <div className="d-flex flex-column content m-5">
          <h1 className="heading mx-auto text-center pb-3">
            Expense Calculator
          </h1>
          <h3 className="mx-auto text-center pb-1">
            Pairing Number: {pairing.pairing_no}
          </h3>
          <div className="mx-auto bg-light p-3">
            <div className="card flex">
              <div className="row card-header">
                <div className="col-9">
                  <Flight
                    index={1}
                    flight_no="1"
                    dept_stn="YYZ"
                    arrival_stn="HND"
                    dept_time="13:15"
                    arrival_time="15:40"
                  />
                  <Layover
                    index={2}
                    layover_stn="HND"
                    layover_expenses="$127.89"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
