/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(customParseFormat);
const timeFormat = 'HH:mm';

function DomesticToInternational() {
  const [dutyStart, setDutyStart] = useState(dayjs('05:15', timeFormat));
  const [domesticDept, setDomesticDept] = useState(dayjs('08:30', timeFormat));
  const [internationalDept, setInternationalDept] = useState(
    dayjs('12:30', timeFormat)
  );

  const [cico, setCico] = useState(1);
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
  }, [dutyStart, domesticDept, internationalDept]);

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
      setCico((prev) => prev + 1);
    } else if (fullDays > 0 && e.target.id === 'minus') {
      setFullDays(fullDays - 1);
      setMealsCa((prev) => ({
        breakfast: prev.breakfast - 1,
        lunch: prev.lunch - 1,
        dinner: prev.dinner - 1,
        snack: prev.snack - 1,
      }));
      setCico((prev) => prev - 1);
    }
  };

  const calculateExpenses = () => {
    setCico(1);
    setFullDays(0);
    const first = calculateFirstExpenseOfDay();
    const last = calculateLastDayExpenses();
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

  const calculateFirstExpenseOfDay = () => {
    const time = domesticDept;
    const duty = { start: dutyStart, end: dayjs('23:59', timeFormat) };
    // console.log(`!start time: ${time}`);
    if (
      dayjs(time).isBefore(dayjs('08:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('09:30', timeFormat), 'minutes')
    ) {
      console.log(`!Begin: B`);
      return 'BLDS';
    } else if (
      dayjs(time).isBefore(dayjs('12:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('13:30', timeFormat), 'minutes')
    ) {
      console.log(`!Begin: L`);
      return 'LDS';
    } else if (
      dayjs(time).isBefore(dayjs('18:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('18:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('19:30', timeFormat), 'minutes')
    ) {
      console.log(`!Begin: D`);
      return 'DS';
    } else if (
      dayjs(time).isBefore(dayjs('23:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
      duty.end.isAfter((dayjs('01:00', timeFormat), 'minutes'.add(1, 'day')))
    ) {
      console.log(`!Begin: S`);
      return 'S';
    }
  };

  const calculateLastDayExpenses = () => {
    const time = internationalDept;

    if (
      time.isBetween(
        dayjs('7:00', timeFormat),
        dayjs('11:29', timeFormat),
        'minute',
        '[]'
      )
    ) {
      console.log(`!End: B`);
      return 'B';
    } else if (
      time.isBetween(
        dayjs('11:30', timeFormat),
        dayjs('16:59', timeFormat),
        'minute',
        '[]'
      )
    ) {
      console.log(`!End: BL`);
      return 'BL';
    } else if (
      time.isBetween(
        dayjs('17:00', timeFormat),
        dayjs('21:59', timeFormat),
        'minute',
        '[]'
      )
    ) {
      console.log(`!End: BLD`);
      return 'BLD';
    } else if (
      time.isBetween(
        dayjs('22:00', timeFormat),
        dayjs('01:00', timeFormat).add(1, 'day'),
        'minute',
        '[]'
      )
    ) {
      console.log(`!End: BLDS`);
      return 'BLDS';
    } else {
      console.log('!triggered else');
      return '';
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
                  <h5>Start</h5>
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
                    value={dutyStart}
                    onAccept={(val) => setDutyStart(val)}
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
                    value={domesticDept}
                    onAccept={(val) => setDomesticDept(val)}
                  />
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
                    value={internationalDept}
                    onAccept={(val) => setInternationalDept(val)}
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
          <strong>Departures </strong>i.e. starting a duty period at home base
          <table className="table table-striped table-bordered text-start">
            <tbody>
              <tr>
                <td colSpan={2}>
                  Use the table below to determine the first meal to which you
                  are entitled.
                </td>
              </tr>
              <tr>
                <td>Depart before 08:00 and on duty from 08:00 to 09:30</td>
                <td>B</td>
              </tr>
              <tr>
                <td>Depart before 12:30 and on duty from 12:30 to 13:30</td>
                <td>L</td>
              </tr>
              <tr>
                <td>Depart before 18:00 and on duty from 18:00 to 19:30</td>
                <td>D</td>
              </tr>
              <tr>
                <td>Depart before 23:00 and on duty from 23:00 to 01:00</td>
                <td>S</td>
              </tr>
            </tbody>
          </table>
          <strong>
            Scheduled Departure at Layover - Meal Allowances on Day of Departure
          </strong>
          <table className="table table-striped table-bordered text-start">
            <tbody>
              <tr>
                <td>Departures between 07:00 and 11:29</td>
                <td>B</td>
              </tr>
              <tr>
                <td>Departures between 11:30 and 16:59</td>
                <td>BL</td>
              </tr>
              <tr>
                <td>Departures between 17:00 and 21:59</td>
                <td>BLD</td>
              </tr>
              <tr>
                <td>Departures between 22:00 and 01:00</td>
                <td>BLDS</td>
              </tr>
            </tbody>
          </table>
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

export default DomesticToInternational;
