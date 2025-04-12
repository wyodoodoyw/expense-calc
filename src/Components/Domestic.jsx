/* eslint-disable react/prop-types */
import { useState } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(customParseFormat);
const timeFormat = 'HH:mm';

function Domestic({ turn, location_exp }) {
  const [station, setStation] = useState(turn.turn_stn);
  const [duty, setDuty] = useState({
    start: dayjs(`${turn.turn_start}`, timeFormat).subtract(1, 'hour'),
    end: dayjs(`${turn.turn_end}`, timeFormat).add(15, 'minutes'),
  });
  const [turnTimes, setTurnTimes] = useState({
    start: dayjs(`${turn.turn_start}`, timeFormat),
    end: dayjs(`${turn.turn_end}`, timeFormat),
  });

  // Amount of expenses earned for each type of meal
  const [expenses, setExpenses] = useState({
    breakfast: location_exp.breakfast,
    lunch: location_exp.lunch,
    dinner: location_exp.dinner,
    snack: location_exp.snack,
  });

  // Number of each type of meal
  const [meals, setMeals] = useState({
    breakfast: (turn.turn_expenses.match(/B/g) || []).length,
    lunch: (turn.turn_expenses.match(/L/g) || []).length,
    dinner: (turn.turn_expenses.match(/D/g) || []).length,
    snack: (turn.turn_expenses.match(/S/g) || []).length,
  });

  const [turnLength, setTurnLength] = useState(turn.turn_length);
  // console.log(
  //   `!Turn Length: ${JSON.stringify(
  //     dayjs
  //       .duration(dayjs('18:46', 'HH:mm').diff(dayjs('05:30', 'HH:mm')))
  //       .format('HH:mm')
  //   )}`
  // );

  // Number of CICO paid
  // const [cico, setCico] = useState(turn.turn_cico);

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

  const handleTurnTimeChange = ({ target }) => {
    // handle changes to turn times
    const { name, value } = target;
    setTurnTimes((prev) => ({
      ...prev,
      [name]: dayjs(value, timeFormat),
    }));
    calculateExpenses();
  };

  const handleDutyTimeChange = ({ target }) => {
    // handle changes to duty times
    const { name, value } = target;
    setDuty((prev) => ({
      ...prev,
      [name]: dayjs(value, timeFormat),
    }));
    calculateExpenses();
  };

  const calculateExpenses = () => {
    let new_expenses = calculateFirstExpenseOfDay();
    new_expenses += calculateLastExpenseOfDay();

    setMeals({
      breakfast: (new_expenses.match(/B/g) || []).length,
      lunch: (new_expenses.match(/L/g) || []).length,
      dinner: (new_expenses.match(/D/g) || []).length,
      snack: (new_expenses.match(/S/g) || []).length,
    });
  };

  const canadaOrUsa = (meal, departureTime) => {
    if (meal === 'L') {
      if (dayjs(departureTime).isBefore(dayjs('12:00', timeFormat), 'minute')) {
        return 'destination';
      } else {
        return 'departure';
      }
    } else if (meal === 'D') {
      if (dayjs(departureTime).isBefore(dayjs('17:30', timeFormat), 'minute')) {
        return 'destination';
      } else {
        return 'departure';
      }
    } else if (meal === 'S') {
      if (dayjs(departureTime).isBefore(dayjs('22:30', timeFormat), 'minute')) {
        return 'destination';
      } else if (
        dayjs(departureTime).isAfter(dayjs('22:30', timeFormat), 'minute') &&
        dayjs(departureTime).isBefore(dayjs('00:59', timeFormat), 'minute')
      ) {
        return 'departure';
      }
    } else {
      console.log('! Error at canadaOrUsa. else condition.');
    }
  };

  const calculateFirstExpenseOfDay = () => {
    const time = turnTimes.start;
    // console.log(`!start time: ${time}`);
    if (
      dayjs(time).isBefore(dayjs('08:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('09:30', timeFormat), 'minutes')
    ) {
      console.log(`!Begin: B`);
      return 'B';
    } else if (
      dayjs(time).isBefore(dayjs('12:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('13:30', timeFormat), 'minutes')
    ) {
      console.log(`!Begin: L`);
      return 'L';
    } else if (
      dayjs(time).isBefore(dayjs('18:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('18:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('19:30', timeFormat), 'minutes')
    ) {
      console.log(`!Begin: D`);
      return 'D';
    } else if (
      dayjs(time).isBefore(dayjs('23:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
      duty.end.isAfter((dayjs('01:00', timeFormat), 'minutes'.add(1, 'day')))
    ) {
      console.log(`!Begin: S`);
      return 'S';
    }
  };

  const calculateLastExpenseOfDay = () => {
    const time = turnTimes.end;
    if (
      dayjs(time).isAfter(
        (dayjs('01:00', timeFormat).add(1, 'day'), 'minute')
      ) &&
      duty.start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
      duty.end.isAfter((dayjs('01:00', timeFormat).add(1, 'day'), 'minutes'))
    ) {
      console.log(`!End: S`);
      return 'S';
    } else if (
      dayjs(time).isAfter(dayjs('18:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('17:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('18:30', timeFormat), 'minutes')
    ) {
      console.log(`!End: D`);
      return 'D';
    } else if (
      dayjs(time).isAfter(dayjs('13:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('13:30', timeFormat), 'minutes')
    ) {
      console.log(`!End: L`);
      return 'L';
    } else if (
      dayjs(time).isAfter(dayjs('09:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('09:30', timeFormat), 'minutes')
    ) {
      console.log(`!End: B`);
      return 'B';
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
      (
        calculateDisplayBreakfastTotal() +
        calculateDisplayLunchTotal() +
        calculateDisplayDinnerTotal() +
        calculateDisplaySnackTotal()
      )
        // + cico * 5.05
        .toFixed(2)
    );
  };

  console.log(meals);
  return (
    <>
      <div className="mx-auto col-8 justify-content-center my-5 border border-2 border-dark rounded-3 m-1 p-3">
        <p>North America/Sun Turn</p>
        <form>
          <div className="mb-3">
            <div className="input-group mb-3" id="flight_info">
              <span className="input-group-text">Turn to: </span>
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
          <table className="mx-auto table table-striped table-bordered text-center">
            <tbody>
              <tr>
                <td></td>
                <td>
                  <h5>Start</h5>
                </td>
                <td>
                  <h5>End</h5>
                </td>
              </tr>
              <tr>
                <td className="align-middle">
                  <h5>Duty</h5>
                </td>
                <td>
                  <TimePicker
                    key="duty_start"
                    ampm={false}
                    format="HH:mm"
                    timeSteps={{ hours: 1, minutes: 1 }}
                    value={duty.start}
                    onAccept={(val) =>
                      handleDutyTimeChange({
                        target: { name: 'start', value: val },
                      })
                    }
                  />
                </td>
                <td></td>
              </tr>
              <tr>
                <td className="align-middle">
                  <h5>Turn/Flights</h5>
                </td>
                <td>
                  <TimePicker
                    key="turn_start"
                    ampm={false}
                    format="HH:mm"
                    timeSteps={{ hours: 1, minutes: 1 }}
                    value={turnTimes.start}
                    onAccept={(val) =>
                      handleTurnTimeChange({
                        target: { name: 'start', value: val },
                      })
                    }
                  />
                </td>
                <td>
                  <TimePicker
                    id="turn_end"
                    ampm={false}
                    format="HH:mm"
                    timeSteps={{ hours: 1, minutes: 1 }}
                    value={turnTimes.end}
                    onAccept={(val) =>
                      handleTurnTimeChange({
                        target: { name: 'end', value: val },
                      })
                    }
                  />
                </td>
              </tr>
              <tr>
                <td className="align-middle">
                  <h5>Duty</h5>
                </td>
                <td></td>
                <td>
                  <TimePicker
                    id="duty_end"
                    ampm={false}
                    format="HH:mm"
                    timeSteps={{ hours: 1, minutes: 1 }}
                    value={duty.end}
                    onAccept={(val) =>
                      handleDutyTimeChange({
                        target: { name: 'end', value: val },
                      })
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
          {/* <div
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
            <span id="days-stepper align-middle">{fullDays}</span>
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
          </div> */}
        </form>
        <table className="table table-striped table-bordered mt-3 text-center">
          <tbody>
            <tr>
              <th></th>
              <th>Breakfast</th>
              <th>Lunch</th>
              <th>Dinner</th>
              <th>Snack</th>
              {/* <th>CI/CO</th> */}
            </tr>
            <tr>
              <td></td>
              <td>{meals.breakfast}</td>
              <td>{meals.lunch}</td>
              <td>{meals.dinner}</td>
              <td>{meals.snack}</td>
              {/* <td>{cico}</td> */}
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
              {/* <td className="align-middle">$5.05</td> */}
            </tr>
            <tr>
              <td>=</td>
              <td>${calculateDisplayBreakfastTotal().toFixed(2)}</td>
              <td>${calculateDisplayLunchTotal().toFixed(2)}</td>
              <td>${calculateDisplayDinnerTotal().toFixed(2)}</td>
              <td>${calculateDisplaySnackTotal().toFixed(2)}</td>
              {/* <td>${(turn.turn_cico * 5.05).toFixed(2)}</td> */}
            </tr>
            <tr className="table-success">
              <td>Total:</td>
              <td colSpan={4}>${calculateDisplayTotal()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Domestic;
