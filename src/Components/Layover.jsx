/* eslint-disable react/prop-types */
import expenses from '../api/expenses';
import { useState } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

function Layover(props) {
  let layover = props.layover;
  let new_layover = layover;
  new_layover.layover_start = dayjs(`2000-01-01 ${new_layover.layover_start}`);
  new_layover.layover_end = dayjs(`2000-01-01 ${new_layover.layover_end}`);
  let location_expenses = expenses.expenses; // { breakfast: 29.91, lunch: 49.96, dinner: 57.26, snack: 20.36, day: 157.49 }

  const [layoverStart, setLayoverStart] = useState(layover.layover_start);
  const [layoverEnd, setLayoverEnd] = useState(layover.layover_end);

  const [fullDays, setFullDays] = useState(0);

  const calculateFirstDayExpenses = () => {
    const time = new_layover.layover_start;
    if (time.isBefore('2000-01-01 12:30')) {
      return 'BLDS';
    } else if (time.isBetween('2000-01-01 12:30', dayjs('2000-01-01 13:30'))) {
      return 'LDS';
    } else {
      return 'DS';
    }
  };

  const calculateLastDayExpenses = () => {
    const time = new_layover.layover_end;
    if (time.isBetween('2000-01-01 7:00', dayjs('2000-01-01 11:29'))) {
      return 'B';
    } else if (time.isBetween('2000-01-01 11:30', dayjs('2000-01-01 16:59'))) {
      return 'BL';
    } else if (time.isBetween('2000-01-01 17:00', dayjs('2000-01-01 21:59'))) {
      return 'BLD';
    } else if (time.isBetween('2000-01-01 22:00', dayjs('2000-01-02 01:00'))) {
      return 'BLDS';
    } else {
      console.log('!triggered else');
    }
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

  const handleStartTimeChange = (val) => {
    new_layover.layover_start = dayjs(val);
    new_layover.layover_end = dayjs(layoverEnd);
    setLayoverStart(dayjs(val));
    new_layover.layover_expenses = '';
    new_layover.layover_expenses += calculateFirstDayExpenses();
    new_layover.layover_expenses += calculateLastDayExpenses();
  };

  const handleEndTimeChange = (val) => {
    new_layover.layover_start = dayjs(layoverStart);
    new_layover.layover_end = dayjs(val);
    setLayoverEnd(dayjs(val));
    new_layover.layover_expenses = '';
    new_layover.layover_expenses += calculateFirstDayExpenses();
    new_layover.layover_expenses += calculateLastDayExpenses();
  };

  const handleStepper = (e) => {
    if (e.target.id === 'plus') {
      setFullDays(fullDays + 1);
      new_layover.layover_expenses += 'BLDS';
    } else if (fullDays > 0 && e.target.id === 'minus') {
      setFullDays(fullDays - 1);

      new_layover.layover_expenses = new_layover.layover_expenses.replace(
        'BLDS',
        ''
      );
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
                key="layover_start"
                ampm={false}
                format="HH:mm"
                timeSteps={{ hours: 1, minutes: 1 }}
                value={layoverStart}
                onAccept={(val) => handleStartTimeChange(val)}
              />
              <div className="form-text ms-3" id="basic-addon1">
                Layover starts 15 minutes after actual arrival time.
              </div>
            </div>

            <div className="input-group">
              <span className="input-group-text">End Time: </span>
              <TimePicker
                id="layover_end"
                ampm={false}
                format="HH:mm"
                timeSteps={{ hours: 1, minutes: 1 }}
                value={layoverEnd}
                onAccept={(val) => handleEndTimeChange(val)}
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
