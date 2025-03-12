/* eslint-disable react/prop-types */
import expenses from '../api/expenses';
import { useState, useEffect } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

function Layover(props) {
  let layover = props.layover;
  let new_layover = props.layover;
  let location_expenses = expenses.expenses; // { breakfast: 29.91, lunch: 49.96, dinner: 57.26, snack: 20.36, day: 157.49 }

  const [layoverStart, setLayoverStart] = useState(layover.layover_start);
  const [layoverEnd, setLayoverEnd] = useState(layover.layover_end);
  const [fullDays, setFullDays] = useState(0);

  // useEffect(() => {
  //   calculateFullDays();
  // }, []);

  // const calculateFullDays = () => {
  //   const fullLength = layover.layover_end.diff(layover.layover_start);
  //   console.log(`!${fullLength}`);
  //   setFullDays(fullLength);
  // };

  const calculateFirstDayExpenses = () => {
    console.log(`!${layover.layover_start}`);
    if (layover.layover_start < '12:30') {
      // B L D S
      return 'BLDS';
    } else if (
      layover.layover_start >= '12:30' &&
      layover.layover_start < '13:30'
    ) {
      // L D S
      return 'LDS';
    } else if (layover.layover_start >= '13:30') {
      // D S
      return 'DS';
    } else {
      // error
      console.log('!error');
    }
  };

  const calculateLastDayExpenses = () => {
    if (layover.layover_end >= '7:00' && layover.layover_end < '12:00') {
      // B
      return 'B';
    } else if (
      layover.layover_end >= '11:30' &&
      layover.layover_end < '17:00'
    ) {
      // B L
      return 'BL';
    } else if (
      layover.layover_end >= '17:00' &&
      layover.layover_end < '22:00'
    ) {
      // B L D
      return 'BLD';
    } else if (layover.layover_end >= '22:00' && layover.layover_end < '1:00') {
      // B L D S
      return 'BLDS';
    } else {
      //error, or no further allowance
    }
  };

  const calculateNewExpenses = () => {
    new_layover.layover_expenses = '';
    new_layover.layover_expenses += calculateFirstDayExpenses();
    new_layover.layover_expenses += calculateLastDayExpenses();
    console.log(`!${new_layover.layover_expenses}`);
  };

  const handleTimeChange = (e) => {
    if (e.target.id === 'layover_start') {
      setLayoverStart(dayjs(e.target.value));
    } else if (e.target.id === 'layover_end') {
      setLayoverEnd(e.target.value);
    }
    console.log(`!${layoverStart}`);
    calculateNewExpenses();
  };

  const calculateNumBreakfasts = () => {
    return (new_layover.layover_expenses.match(/B/g) || []).length;
  };

  const calculateNumLunches = () => {
    return (new_layover.layover_expenses.match(/L/g) || []).length;
  };

  const calculateNumDinners = () => {
    return (new_layover.layover_expenses.match(/D/g) || []).length;
  };

  const calculateNumSnacks = () => {
    return (new_layover.layover_expenses.match(/S/g) || []).length;
  };

  const calculateDisplayBreakfastTotal = () => {
    return calculateNumBreakfasts() * location_expenses.breakfast;
  };

  const calculateDisplayLunchTotal = () => {
    return calculateNumLunches() * location_expenses.lunch;
  };

  const calculateDisplayDinnerTotal = () => {
    return calculateNumDinners() * location_expenses.dinner;
  };

  const calculateDisplaySnackTotal = () => {
    return calculateNumSnacks() * location_expenses.snack;
  };

  const calculateDisplayTotal = () => {
    return (
      calculateDisplayBreakfastTotal() +
      calculateDisplayLunchTotal() +
      calculateDisplayDinnerTotal() +
      calculateDisplaySnackTotal() +
      new_layover.layover_cico * 5.05
    ).toFixed(2);
  };

  const handleStepper = (e) => {
    if (e.target.id === 'plus') {
      setFullDays(fullDays + 1);
      new_layover.layover_expenses += 'BLDS';
      // console.log(`!${new_layover.layover_expenses}`);
    } else if (fullDays > 0 && e.target.id === 'minus') {
      setFullDays(fullDays - 1);

      new_layover.layover_expenses = new_layover.layover_expenses.replace(
        'BLDS',
        ''
      );
      // console.log(`!${new_layover.layover_expenses}`);
    }
  };

  return (
    <>
      <div className="mx-auto col-8 justify-content-center my-5 border border-2 border-dark rounded-3 m-1 p-3">
        <form>
          <div className="mb-3">
            <div className="input-group mb-3" id="flight_info">
              <span className="input-group-text">Layover in: </span>
              <input
                id="flight_no"
                type="text"
                className="col-11 form-control"
                placeholder="YUL"
                value={new_layover.layover_stn}
                readOnly
              />
            </div>
          </div>
          <div className="input-group">
            <div className="input-group mb-3">
              <span className="input-group-text">Start Time: </span>

              <TimePicker
                id="layover_start"
                value={dayjs(layoverStart)}
                onChange={(e) => setLayoverStart(e.target.value)}
              />
              <div className="form-text ms-3" id="basic-addon1">
                Layover starts 15 minutes after actual arrival time.
              </div>
            </div>

            <div className="input-group">
              <span className="input-group-text">End Time: </span>
              {/* <input
                id="layover_end"
                type="time"
                className="form-control"
                placeholder="12:18"
                value={layoverEnd}
                onChange={handleStepper}
                //(e) => setLayoverEnd(e.target.value)
              /> */}
              <TimePicker
                id="layover_end"
                value={dayjs(layoverEnd)}
                onChange={(e) => setLayoverEnd(e.target.value)}
              />
              <div className="form-text ms-3" id="basic-addon1">
                Layover ends 1 hour before actual departure time.
              </div>
            </div>
          </div>
          <div
            className="btn-group align-middle mt-3"
            role="group"
            aria-label="Stepper"
          >
            <button
              id="minus"
              type="button"
              className="btn btn-outline-primary me-2"
              onClick={handleStepper}
            >
              -
            </button>
            <span id="days-stepper">{fullDays}</span>
            <button
              id="plus"
              type="button"
              className="btn btn-outline-primary ms-2"
              onClick={handleStepper}
            >
              +
            </button>
            <div className="form-text ms-3" id="basic-addon1">
              Number of full days (00:00-23:59) on layover. Do not include the
              first and last days.
            </div>
          </div>
        </form>
        <table className="table table-striped table-bordered mt-3 text-center">
          <tbody>
            <tr>
              <th></th>
              <th>Breakfast</th>
              <th>Lunch</th>
              <th>Dinner</th>
              <th>Snack</th>
              <th>CI/CO</th>
            </tr>
            <tr>
              <td></td>
              <td>{calculateNumBreakfasts()}</td>
              <td>{calculateNumLunches()}</td>
              <td>{calculateNumDinners()}</td>
              <td>{calculateNumSnacks()}</td>
              <td>{new_layover.layover_cico}</td>
            </tr>
            <tr>
              <td>x</td>
              <td>${location_expenses.breakfast}</td>
              <td>${location_expenses.lunch}</td>
              <td>${location_expenses.dinner}</td>
              <td>${location_expenses.snack}</td>
              <td>$5.05</td>
            </tr>
            <tr>
              <td>=</td>
              <td>${calculateDisplayBreakfastTotal()}</td>
              <td>${calculateDisplayLunchTotal()}</td>
              <td>${calculateDisplayDinnerTotal()}</td>
              <td>${calculateDisplaySnackTotal()}</td>
              <td>${new_layover.layover_cico * 5.05}</td>
            </tr>
            <tr className="table-success">
              <td>Total:</td>
              <td colSpan={5}>${calculateDisplayTotal()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Layover;
