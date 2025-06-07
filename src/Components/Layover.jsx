/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ExpensesTable from './ExpensesTable';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
// import toTimeFormat from '../modules/to-time-format';
// import canadian_airport_codes from '../data/canadian_airport_codes';
// import american_airport_codes from '../data/american_airport_codes';
// import international_airport_codes from '../data/international_airport_codes';
// import sun_domestic_aiport_codes from '../data/sun_domestic_airport_codes';

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);
const timeFormat = 'HH:mm';

function Layover(props) {
  const { index } = props;

  const l = useSelector((state) => state.pairing.sequence[index]);
  const prevFlight = useSelector((state) => state.pairing.sequence[index - 1]);
  const layoverStart = dayjs()
    .set('hour', prevFlight.arrivalTime.slice(0, -2))
    .set('minute', prevFlight.arrivalTime.slice(-2));
  const nextFlight = useSelector((state) => state.pairing.sequence[index + 1]);
  const layoverEnd = dayjs()
    .set('hour', nextFlight.departureTime.slice(0, -2))
    .set('minute', nextFlight.departureTime.slice(-2));

  const calculateFullDays = () => {
    let hours =
      Number(l.layoverLength.slice(0, -2)) +
      Number(layoverStart.format('HH')) -
      Number(layoverEnd.format('HH')) -
      23; // layoverLength reflects 1h 15m duty
    let minutes =
      Number(l.layoverLength.slice(-2)) +
      Number(layoverStart.format('mm')) -
      Number(layoverEnd.format('mm')) +
      15; // layoverLength reflects 1h 15m duty
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
    }
    return hours / 24;
  };

  // Amount of expenses earned for each type of meal
  const [expenses, setExpenses] = useState({
    breakfast: 42.06,
    lunch: 48.39,
    dinner: 94.46,
    snack: 25.27,
  });

  // Number of each type of meal
  const [meals, setMeals] = useState({
    breakfast: (l.layoverMeals.match(/B/g) || []).length,
    lunch: (l.layoverMeals.match(/L/g) || []).length,
    dinner: (l.layoverMeals.match(/D/g) || []).length,
    snack: (l.layoverMeals.match(/S/g) || []).length,
  });

  useEffect(() => {
    getExpenseAmounts(l.layoverStation);
    let new_expenses = calculateFirstDayExpenses();
    new_expenses += calculateLastDayExpenses();

    setMeals({
      breakfast: (new_expenses.match(/B/g) || []).length,
      lunch: (new_expenses.match(/L/g) || []).length,
      dinner: (new_expenses.match(/D/g) || []).length,
      snack: (new_expenses.match(/S/g) || []).length,
    });
  }, [prevFlight.arrivalTime, nextFlight.departureTime]);

  // const handleStepper = (e) => {
  //   if (e.target.id === 'plus') {
  //     setFullDays(fullDays + 1);
  //     setMeals((prev) => ({
  //       breakfast: prev.breakfast + 1,
  //       lunch: prev.lunch + 1,
  //       dinner: prev.dinner + 1,
  //       snack: prev.snack + 1,
  //     }));
  //     // setCico((prev) => prev + 1);
  //   } else if (fullDays > 0 && e.target.id === 'minus') {
  //     setFullDays(fullDays - 1);
  //     setMeals((prev) => ({
  //       breakfast: prev.breakfast - 1,
  //       lunch: prev.lunch - 1,
  //       dinner: prev.dinner - 1,
  //       snack: prev.snack - 1,
  //     }));
  //     // setCico((prev) => prev - 1);
  //   }
  // };

  const calculateFirstDayExpenses = () => {
    const time = layoverStart;
    if (dayjs(time).isBefore(dayjs('12:30', timeFormat), 'minute')) {
      // console.log('first: BLDS');
      return 'BLDS';
    } else if (
      time.isBetween(
        dayjs('12:30', timeFormat),
        dayjs('13:30', timeFormat),
        'minute',
        '[]'
      )
    ) {
      // console.log('first: LDS');
      return 'LDS';
    } else {
      // console.log('first: DS');
      return 'DS';
    }
  };

  const calculateLastDayExpenses = () => {
    const time = layoverEnd;
    if (
      time.isBetween(
        dayjs('7:00', timeFormat),
        dayjs('11:29', timeFormat),
        'minute',
        '[]'
      )
    ) {
      // console.log('last: B');
      return 'B';
    } else if (
      time.isBetween(
        dayjs('11:30', timeFormat),
        dayjs('16:59', timeFormat),
        'minute',
        '[]'
      )
    ) {
      // console.log('last: BL');
      return 'BL';
    } else if (
      time.isBetween(
        dayjs('17:00', timeFormat),
        dayjs('21:59', timeFormat),
        'minute',
        '[]'
      )
    ) {
      // console.log('last: BLD');
      return 'BLD';
    } else if (
      time.isBetween(
        dayjs.utc('22:00', timeFormat),
        dayjs.utc('01:00', timeFormat).add(1, 'day'),
        'minute',
        '[]'
      )
    ) {
      return 'BLDS';
    } else {
      // console.log('!triggered else');
      return '';
    }
  };

  // const getCategory = (station) => {
  //   if (
  //     canadian_airport_codes.includes(station) ||
  //     sun_domestic_aiport_codes.includes(station)
  //   ) {
  //     return 'Domestic';
  //   } else if (american_airport_codes.includes(station)) {
  //     return 'Transborder';
  //   } else if (international_airport_codes.includes(station)) {
  //     return 'International';
  //   }
  // };

  const getExpenseAmounts = (station) => {
    const request = window.indexedDB.open('ExpensesDB', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction(['expenses'], 'readonly');
      const expensesStore = tx.objectStore('expenses');
      const airportCodesIndex = expensesStore.index('airport_codes');
      const request = airportCodesIndex.get(station);
      request.onsuccess = () => {
        setExpenses({
          breakfast: request.result.expenses.breakfast,
          lunch: request.result.expenses.lunch,
          dinner: request.result.expenses.dinner,
          snack: request.result.expenses.snack,
        });
      };
      request.onerror = (event) => {
        console.log(`!DB Error: ${event.target.error}`);
      };
      tx.oncomplete = () => {
        db.close();
      };
    };
  };

  return (
    <div>
      <div className="row align-middle my-1">
        <div className="col-2"></div>
        <div className="col-5">Hotel: {l.hotelInfo}</div>
        <div className="col-3">Layover Length: {l.layoverLength}</div>
        <div className="col-2">Meals: {l.layoverMeals}</div>
      </div>
      {/* <p>Previous Flight Arrival: {layoverStart.format(timeFormat)}</p>
      <p>~ Full Days: {calculateFullDays()}</p>
      <p>Next Flight Departure: {layoverEnd.format(timeFormat)}</p> */}
      <ExpensesTable
        station={l.layoverStation}
        meals={meals}
        expenses={expenses}
        isLayover={true}
        fullDays={calculateFullDays()}
      />
    </div>
  );
}

export default Layover;
