/* eslint-disable react/prop-types */
import { useState } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import FlightExpenseTable from './FlightExpenseTable';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

function Flight(props) {
  let flight = props.flight;
  let new_flight = flight;
  new_flight.dept_time = dayjs(`2000-01-01 ${new_flight.dept_time}`);
  new_flight.arrival_time = dayjs(`2000-01-01 ${new_flight.arrival_time}`);

  const [departureTime, setDepartureTime] = useState(flight.dept_time);
  const [arrivalTime, setArrivalTime] = useState(flight.arrival_time);

  const handleDepartureTimeChange = (val) => {
    new_flight.dept_time = dayjs(val);
    new_flight.arrival_time = dayjs(arrivalTime);
    onboard_meals: ['HB', 'HD', 'SS'], setDepartureTime(dayjs(val));
    new_flight.flight_expenses = '';
    // new_flight.layover_expenses += calculateFirstDayExpenses();
    // new_flight.layover_expenses += calculateLastDayExpenses();
  };

  const handleArrivalTimeChange = (val) => {
    new_flight.arrival_time = dayjs(val);
    new_flight.dept_time = dayjs(departureTime);
    setArrivalTime(dayjs(val));
    new_flight.flight_expenses = '';
    // new_flight.layover_expenses += calculateFirstDayExpenses();
    // new_flight.layover_expenses += calculateLastDayExpenses();
  };

  return (
    <>
      <div className="mx-auto col-8 justify-content-center my-5 border border-2 border-dark rounded-3 m-1 p-3">
        <form>
          <div className="form-group mb-3">
            <span className="">Flight Number: </span>
            <div className="input-group mb-3" id="flight_info">
              <span className="input-group-text">AC </span>
              <input
                id="flight_no"
                type="text"
                className="col-11 form-control"
                placeholder="1234"
                value={flight.flight_no}
                readOnly
              />
            </div>
          </div>
          <div className="form-inline">
            {/* <label htmlFor="flight_no" className="form-no">
              Departure Station:
            </label> */}
            <div className="input-group">
              <span className="input-group-text">🛫</span>
              <input
                type="text"
                className="form-control"
                placeholder="AAA"
                defaultValue={flight.dept_stn}
                readOnly
              />
              <div className="ms-3">
                <div className="input-group">
                  <span className="input-group-text ">Departure Time: </span>

                  <TimePicker
                    key="departure_time"
                    ampm={false}
                    format="HH:mm"
                    timeSteps={{ hours: 1, minutes: 1 }}
                    value={departureTime}
                    onAccept={(val) => handleDepartureTimeChange(val)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="form-inline mt-3">
            {/* <label htmlFor="flight_no" className="form-no">
              Arrival Station:
            </label> */}
            <div className="input-group">
              <span className="input-group-text">🛬</span>
              <input
                type="text"
                className="form-control"
                placeholder="YYY"
                defaultValue={flight.arrival_stn}
                readOnly
              />
              <div className="ms-3">
                <div className="input-group">
                  <span className="input-group-text">Arrival Time: </span>

                  <TimePicker
                    key="arrival_time"
                    ampm={false}
                    format="HH:mm"
                    timeSteps={{ hours: 1, minutes: 1 }}
                    value={arrivalTime}
                    onAccept={(val) => handleArrivalTimeChange(val)}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
        {!new_flight.onboard_meals ? <FlightExpenseTable /> : ''}
      </div>
    </>
  );
}
export default Flight;
