/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import ExplanationInternationalArrival from './ExplanationInternationalArrival';
import ExplanationDomesticArrival from './ExplanationDomesticArrivals';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import ExplanationDomesticArrivals from './ExplanationDomesticArrivals';

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(customParseFormat);
const timeFormat = 'HH:mm';

function InternationalToDomestic() {
  const [dutyEnd, setDutyEnd] = useState(dayjs('05:15', timeFormat));
  const [domesticArrival, setDomesticArrival] = useState(
    dayjs('08:30', timeFormat)
  );
  const [internationalArrival, setInternationalArrival] = useState(
    dayjs('12:30', timeFormat)
  );

  const [cico, setCico] = useState(0);
  const [fullDays, setFullDays] = useState(0);

  // Amount of expenses earned for each type of meal
  const [expenses_ca, setExpensesCa] = useState({
    breakfast: 17.95,
    lunch: 20.33,
    dinner: 40.27,
    snack: 10.52,
  });

  // Number of each type of meal
  const [meals_ca, setMealsCa] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  });

  useEffect(() => {
    calculateExpenses();
  }, [dutyEnd, domesticArrival, internationalArrival]);

  const handleExpensesChange = (e) => {
    // handle changes to expenses amount ($)
    const { name, value } = e.target;

    setExpensesCa((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleStepper = (e) => {
    if (e.target.id === 'plus') {
      setFullDays(fullDays + 1);
      setMealsCa((prev) => ({
        breakfast: prev.breakfast + 1,
        lunch: prev.lunch + 1,
        dinner: prev.dinner + 1,
        snack: prev.snack + 1,
      }));
      // setCico((prev) => prev + 1);
    } else if (fullDays > 0 && e.target.id === 'minus') {
      setFullDays(fullDays - 1);
      setMealsCa((prev) => ({
        breakfast: prev.breakfast - 1,
        lunch: prev.lunch - 1,
        dinner: prev.dinner - 1,
        snack: prev.snack - 1,
      }));
      // setCico((prev) => prev - 1);
    }
  };

  const calculateExpenses = () => {
    setCico(1);
    setFullDays(0);
    const first = calculateFirstDayExpenses();
    const last = calculateLastExpenseOfDay();
    // const string = 'BLDS';
    const new_expenses = first + last;
    console.log(`!Expenses: ${new_expenses}`);

    setMealsCa({
      breakfast: (new_expenses.match(/B/g) || []).length,
      lunch: (new_expenses.match(/L/g) || []).length,
      dinner: (new_expenses.match(/D/g) || []).length,
      snack: (new_expenses.match(/S/g) || []).length,
    });
  };

  //

  const calculateFirstDayExpenses = () => {
    const time = internationalArrival;
    if (dayjs(time).isBefore(dayjs('12:30', timeFormat), 'minute')) {
      console.log('!Start: BLDS');
      return 'BLDS';
    } else if (
      time.isBetween(
        dayjs('12:30', timeFormat),
        dayjs('13:30', timeFormat),
        'minute',
        '[]'
      )
    ) {
      console.log('!Start: LDS');
      return 'LDS';
    } else {
      console.log('!Start: DS');
      return 'DS';
    }
  };

  const calculateLastExpenseOfDay = () => {
    const time = domesticArrival;
    const duty = { start: dayjs('00:00', timeFormat), end: dutyEnd };
    if (
      dayjs(time).isAfter(
        (dayjs('01:00', timeFormat).add(1, 'day'), 'minute')
      ) &&
      duty.start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
      duty.end.isAfter((dayjs('01:00', timeFormat).add(1, 'day'), 'minutes'))
    ) {
      console.log(`!End: BLDS`);
      return 'BLDS';
    } else if (
      dayjs(time).isAfter(dayjs('18:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('17:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('18:30', timeFormat), 'minutes')
    ) {
      console.log(`!End: BLD`);
      return 'BLD';
    } else if (
      dayjs(time).isAfter(dayjs('13:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('13:30', timeFormat), 'minutes')
    ) {
      console.log(`!End: BL`);
      return 'BL';
    } else if (
      dayjs(time).isAfter(dayjs('09:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('09:30', timeFormat), 'minutes')
    ) {
      console.log(`!End: B`);
      return 'B';
    }
  };

  const calcCaBreakfastTotal = () => {
    return meals_ca.breakfast * expenses_ca.breakfast;
  };

  const calcCaLunchTotal = () => {
    return meals_ca.lunch * expenses_ca.lunch;
  };

  const calcCaDinnerTotal = () => {
    return meals_ca.dinner * expenses_ca.dinner;
  };

  const calcCaSnackTotal = () => {
    return meals_ca.snack * expenses_ca.snack;
  };

  const calculateDisplayTotal = () => {
    return (
      calcCaBreakfastTotal() +
      calcCaLunchTotal() +
      calcCaDinnerTotal() +
      calcCaSnackTotal() +
      cico * 5.05
    ).toFixed(2);
  };

  return (
    <>
      <div className="mx-auto col-8 justify-content-center my-5 border border-2 border-dark rounded-3 m-1 p-3">
        <form>
          <table className="mx-auto table table-striped table-bordered text-center">
            <tbody>
              <tr>
                <td></td>
                <td>
                  <h5>End</h5>
                </td>
              </tr>
              <tr>
                <td className="align-middle">
                  <h5>International Flight</h5>
                </td>
                <td>
                  <TimePicker
                    id="duty_end"
                    ampm={false}
                    format="HH:mm"
                    timeSteps={{ hours: 1, minutes: 1 }}
                    value={internationalArrival}
                    onAccept={(val) => setInternationalArrival(val)}
                  />
                </td>
              </tr>
              <tr>
                <td className="align-middle">
                  <h5>Domestic Flight</h5>
                </td>
                <td>
                  <TimePicker
                    key="turn_start"
                    ampm={false}
                    format="HH:mm"
                    timeSteps={{ hours: 1, minutes: 1 }}
                    value={domesticArrival}
                    onAccept={(val) => setDomesticArrival(val)}
                  />
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
                    value={dutyEnd}
                    onAccept={(val) => setDutyEnd(val)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
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
            <span id="days-stepper align-middle">{cico}</span>
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
              <td>🇨🇦</td>
              <td>{meals_ca.breakfast}</td>
              <td>{meals_ca.lunch}</td>
              <td>{meals_ca.dinner}</td>
              <td>{meals_ca.snack}</td>
              <td>{cico}</td>
            </tr>
            <tr>
              <td>x</td>
              <td>
                <input
                  type="text"
                  className="form-control text-center"
                  id="inputExpenseB"
                  value={expenses_ca.breakfast}
                  name="breakfast"
                  onChange={handleExpensesChange}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control text-center"
                  id="inputExpenseB"
                  value={expenses_ca.lunch}
                  name="lunch"
                  onChange={handleExpensesChange}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control text-center"
                  id="inputExpenseB"
                  value={expenses_ca.dinner}
                  name="dinner"
                  onChange={handleExpensesChange}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control text-center"
                  id="inputExpenseB"
                  value={expenses_ca.snack}
                  name="snack"
                  onChange={handleExpensesChange}
                />
              </td>
              <td className="align-middle">$5.05</td>
            </tr>
            <tr>
              <td>=</td>
              <td>${calcCaBreakfastTotal().toFixed(2)}</td>
              <td>${calcCaLunchTotal().toFixed(2)}</td>
              <td>${calcCaDinnerTotal().toFixed(2)}</td>
              <td>${calcCaSnackTotal().toFixed(2)}</td>
              <td>${(cico * 5.05).toFixed(2)}</td>
            </tr>
            <tr className="table-success">
              <td>Total:</td>
              <td colSpan={5}>${calculateDisplayTotal()}</td>
            </tr>
          </tbody>
        </table>
        <div>
          <h4 className="text-center">Explanation</h4>
          <ExplanationInternationalArrival />
          <ExplanationDomesticArrivals />
          <p>
            <strong>Every full calendar day at layover (00:00-24:00): </strong>
            BLDS
          </p>
          <p>
            For more information, consult the Mystery of Meals document on the
            ACComponent website.
          </p>
        </div>
      </div>
    </>
  );
}

export default InternationalToDomestic;
