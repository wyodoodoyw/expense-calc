/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
const timeFormat = 'HH:mm';

function Layover({ layover, location_exp }) {
  const [station, setStation] = useState(layover.layover_stn);
  const [layoverTimes, setLayoverTimes] = useState({
    layover_start: dayjs(`${layover.layover_start}`, timeFormat),
    layover_end: dayjs(`${layover.layover_end}`, timeFormat),
  });
  console.log(`!layover_times: ${JSON.stringify(layoverTimes)}`);
  const [fullDays, setFullDays] = useState(0);
  // const [layoverLength, setLayoverLength] = useState(0);

  // Amount of expenses earned for each type of meal
  const [expenses, setExpenses] = useState({
    breakfast: location_exp.breakfast,
    lunch: location_exp.lunch,
    dinner: location_exp.dinner,
    snack: location_exp.snack,
  });

  // Number of each type of meal
  const [meals, setMeals] = useState({
    breakfast: (layover.layover_expenses.match(/B/g) || []).length,
    lunch: (layover.layover_expenses.match(/L/g) || []).length,
    dinner: (layover.layover_expenses.match(/D/g) || []).length,
    snack: (layover.layover_expenses.match(/S/g) || []).length,
  });

  // Number of CICO paid
  const [cico, setCico] = useState(layover.layover_cico);

  const handleStationChange = (e) => {
    const new_station = e.target.value;
    setStation(new_station);
  };

  const handleExpensesChange = (e) => {
    // handle changes to expenses amount ($)
    const { name, value } = e.target;

    setExpenses((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleTimeChange = ({ target }) => {
    // handle changes to times, and recalculate number of meals/expenses
    const { name, value } = target;
    setLayoverTimes((prev) => ({
      ...prev,
      [name]: dayjs(value, timeFormat),
    }));
  };

  useEffect(() => {
    let new_expenses = calculateFirstDayExpenses();
    new_expenses += calculateLastDayExpenses();

    setMeals({
      breakfast: (new_expenses.match(/B/g) || []).length,
      lunch: (new_expenses.match(/L/g) || []).length,
      dinner: (new_expenses.match(/D/g) || []).length,
      snack: (new_expenses.match(/S/g) || []).length,
    });
  }, [layoverTimes]);

  const handleStepper = (e) => {
    if (e.target.id === 'plus') {
      setFullDays(fullDays + 1);
      setMeals((prev) => ({
        breakfast: prev.breakfast + 1,
        lunch: prev.lunch + 1,
        dinner: prev.dinner + 1,
        snack: prev.snack + 1,
      }));
      // layover.layover_expenses += 'BLDS';
      setCico((prev) => prev + 1);
    } else if (fullDays > 0 && e.target.id === 'minus') {
      setFullDays(fullDays - 1);
      setMeals((prev) => ({
        breakfast: prev.breakfast - 1,
        lunch: prev.lunch - 1,
        dinner: prev.dinner - 1,
        snack: prev.snack - 1,
      }));
      // layover.layover_expenses = layover.layover_expenses.replace('BLDS', '');
      setCico((prev) => prev - 1);
    }
  };

  const calculateFirstDayExpenses = () => {
    const time = layoverTimes.layover_start;
    // console.log(`!start time: ${time}`);
    if (dayjs(time).isBefore(dayjs('12:30', timeFormat), 'minute')) {
      return 'BLDS';
    } else if (
      time.isBetween(
        dayjs('12:30', timeFormat),
        dayjs('13:30', timeFormat),
        'minute',
        '[]'
      )
    ) {
      return 'LDS';
    } else {
      return 'DS';
    }
  };

  const calculateLastDayExpenses = () => {
    const time = layoverTimes.layover_end;
    // console.log(`!end time: ${time}`);
    if (
      time.isBetween(
        dayjs('7:00', timeFormat),
        dayjs('11:29', timeFormat),
        'minute',
        '[]'
      )
    ) {
      return 'B';
    } else if (
      time.isBetween(
        dayjs('11:30', timeFormat),
        dayjs('16:59', timeFormat),
        'minute',
        '[]'
      )
    ) {
      return 'BL';
    } else if (
      time.isBetween(
        dayjs('17:00', timeFormat),
        dayjs('21:59', timeFormat),
        'minute',
        '[]'
      )
    ) {
      return 'BLD';
    } else if (
      time.isBetween(
        dayjs('22:00', timeFormat),
        dayjs('01:00', timeFormat).add(1, 'day'),
        'minute',
        '[]'
      )
    ) {
      return 'BLDS';
    } else {
      console.log('!triggered else');
      return '';
    }
  };

  const calculateDisplayBreakfastTotal = () => {
    return meals.breakfast * expenses.breakfast;
  };

  const calculateDisplayLunchTotal = () => {
    return meals.lunch * expenses.lunch;
  };

  const calculateDisplayDinnerTotal = () => {
    return meals.dinner * expenses.dinner;
  };

  const calculateDisplaySnackTotal = () => {
    return meals.snack * expenses.snack;
  };

  const calculateDisplayTotal = () => {
    return (
      calculateDisplayBreakfastTotal() +
      calculateDisplayLunchTotal() +
      calculateDisplayDinnerTotal() +
      calculateDisplaySnackTotal() +
      cico * 5.05
    ).toFixed(2);
  };

  return (
    <>
      <div className="mx-auto col-8 justify-content-center my-5 border border-2 border-dark rounded-3 m-1 p-3">
        <p>International</p>
        <form>
          <div className="mb-3">
            <div className="input-group mb-3" id="flight_info">
              <span className="input-group-text">Layover in: </span>
              <input
                id="flight_no"
                type="text"
                className="col-11 form-control"
                placeholder="YUL"
                value={station}
                onChange={(val) => handleStationChange(val)}
              />
            </div>
          </div>
          <div className="input-group">
            <div className="input-group mb-3">
              <span className="input-group-text">Start Time: </span>

              <TimePicker
                key="layover_start"
                name="layover_start"
                ampm={false}
                format="HH:mm"
                timeSteps={{ hours: 1, minutes: 1 }}
                value={layoverTimes.layover_start}
                onAccept={(val) =>
                  handleTimeChange({
                    target: { name: 'layover_start', value: val },
                  })
                }
              />
              <div className="form-text ms-3" id="basic-addon1">
                Actual arrival time.
              </div>
            </div>

            <div className="input-group">
              <span className="input-group-text">End Time: </span>
              <TimePicker
                id="layover_end"
                name="layover_end"
                ampm={false}
                format="HH:mm"
                timeSteps={{ hours: 1, minutes: 1 }}
                value={layoverTimes.layover_end}
                onAccept={(val) =>
                  handleTimeChange({
                    target: { name: 'layover_end', value: val },
                  })
                }
              />
              <div className="form-text ms-3" id="basic-addon1">
                Actual departure time.
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
            {/* <div>Layover Length: {layoverLength}</div> */}
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
              <td>{meals.breakfast}</td>
              <td>{meals.lunch}</td>
              <td>{meals.dinner}</td>
              <td>{meals.snack}</td>
              <td>{cico}</td>
            </tr>
            <tr>
              <td>x</td>
              <td>
                <input
                  type="text"
                  className="form-control text-center"
                  id="inputExpenseB"
                  value={expenses.breakfast}
                  name="breakfast"
                  onChange={handleExpensesChange}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control text-center"
                  id="inputExpenseB"
                  value={expenses.lunch}
                  name="lunch"
                  onChange={handleExpensesChange}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control text-center"
                  id="inputExpenseB"
                  value={expenses.dinner}
                  name="dinner"
                  onChange={handleExpensesChange}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control text-center"
                  id="inputExpenseB"
                  value={expenses.snack}
                  name="snack"
                  onChange={handleExpensesChange}
                />
              </td>
              <td className="align-middle">$5.05</td>
            </tr>
            <tr>
              <td>=</td>
              <td>${(meals.breakfast * expenses.breakfast).toFixed(2)}</td>
              <td>${(meals.lunch * expenses.lunch).toFixed(2)}</td>
              <td>${(meals.dinner * expenses.dinner).toFixed(2)}</td>
              <td>${(meals.snack * expenses.snack).toFixed(2)}</td>
              <td>${(cico * 5.05).toFixed(2)}</td>
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
