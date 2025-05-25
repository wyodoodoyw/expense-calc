/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import ExpensesTable from './ExpensesTable';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
// import duration from 'dayjs/plugin/duration';
// import toTimeFormat from '../modules/to-time-format';
// import canadian_airport_codes from '../data/canadian_airport_codes';
// import american_airport_codes from '../data/american_airport_codes';
// import international_airport_codes from '../data/international_airport_codes';
// import sun_domestic_aiport_codes from '../data/sun_domestic_airport_codes';

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);
const timeFormat = 'HH:mm';

function Layover({ layover }) {
  console.log(layover);

  const {
    hotelInfo,
    layoverStation,
    layoverStart,
    layoverEnd,
    layoverLength,
    index,
    layoverMeals,
  } = layover;

  const [times, setTimes] = useState({
    arrival: dayjs()
      .set('hour', layoverStart.slice(0, -2))
      .set('minute', layoverStart.slice(-2)),
    departure: dayjs()
      // .set('hour', layoverStart.slice(0, -2))
      // .set('minute', layoverStart.slice(-2))
      // .add(1, 'hour')
      // .add(15, 'minute')
      // .add(layoverLength.slice(0, -2), 'hour')
      // .add(layoverLength.slice(-2), 'minute'),
      .set('hour', layoverEnd.slice(0, -2))
      .set('minute', layoverEnd.slice(-2)),
  });

  const [layoverTimes, setLayoverTimes] = useState({
    start: dayjs(times.arrival).add(15, 'minute'),
    end: dayjs(times.departure).subtract(1, 'hour'),
  });

  const calculateFullDays = () => {
    let hours =
      Number(layoverLength.slice(0, -2)) +
      Number(layoverTimes.start.format('HH')) -
      Number(layoverTimes.end.format('HH')) -
      24;
    let minutes =
      Number(layoverLength.slice(-2)) +
      Number(layoverTimes.start.format('mm')) -
      Number(layoverTimes.end.format('mm'));
    if (minutes === 60) {
      hours++;
    }
    return hours / 24;
  };

  const [fullDays, setFullDays] = useState(calculateFullDays());

  // Amount of expenses earned for each type of meal
  const [expenses, setExpenses] = useState({
    breakfast: 42.06,
    lunch: 48.39,
    dinner: 94.46,
    snack: 25.27,
  });

  // Number of each type of meal
  const [meals, setMeals] = useState({
    breakfast: (layoverMeals.match(/B/g) || []).length,
    lunch: (layoverMeals.match(/L/g) || []).length,
    dinner: (layoverMeals.match(/D/g) || []).length,
    snack: (layoverMeals.match(/S/g) || []).length,
  });

  // const handleTimeChange = ({ target }) => {
  //   // handle changes to times, and recalculate number of meals/expenses
  //   const { name, value } = target;
  //   setLayoverTimes((prev) => ({
  //     ...prev,
  //     [name]: dayjs(value, timeFormat),
  //   }));
  // };

  useEffect(() => {
    getExpenseAmounts(layoverStation);
    let new_expenses = calculateFirstDayExpenses();
    new_expenses += calculateLastDayExpenses();

    setMeals({
      breakfast: (new_expenses.match(/B/g) || []).length,
      lunch: (new_expenses.match(/L/g) || []).length,
      dinner: (new_expenses.match(/D/g) || []).length,
      snack: (new_expenses.match(/S/g) || []).length,
    });
  }, [layoverTimes]);

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
    const time = times.arrival;
    if (dayjs(time).isBefore(dayjs('12:30', timeFormat), 'minute')) {
      console.log('first: BLDS');
      return 'BLDS';
    } else if (
      time.isBetween(
        dayjs('12:30', timeFormat),
        dayjs('13:30', timeFormat),
        'minute',
        '[]'
      )
    ) {
      console.log('first: LDS');
      return 'LDS';
    } else {
      console.log('first: DS');
      return 'DS';
    }
  };

  const calculateLastDayExpenses = () => {
    const time = times.departure;
    if (
      time.isBetween(
        dayjs.utc('7:00', timeFormat),
        dayjs.utc('11:29', timeFormat),
        'minute',
        '[]'
      )
    ) {
      console.log('last: B');
      return 'B';
    } else if (
      time.isBetween(
        dayjs.utc(('11:30', timeFormat)),
        dayjs.utc(('16:59', timeFormat)),
        'minute',
        '[]'
      )
    ) {
      console.log('last: BL');
      return 'BL';
    } else if (
      time.isBetween(
        dayjs.utc('17:00', timeFormat),
        dayjs.utc('21:59', timeFormat),
        'minute',
        '[]'
      )
    ) {
      console.log('last: BLD');
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
      console.log('!triggered else');
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
    //   const request = window.indexedDB.open('ExpensesDB', 1);
    //   request.onsuccess = (event) => {
    //     const db = event.target.result;
    //     const tx = db.transaction(['expenses'], 'readonly');
    //     const expensesStore = tx.objectStore('expenses');
    //     const airportCodesIndex = expensesStore.index('airport_codes');
    //     const request = airportCodesIndex.get(station);
    //     request.onsuccess = () => {
    //       setExpenses({
    //         breakfast: request.result.expenses.breakfast,
    //         lunch: request.result.expenses.lunch,
    //         dinner: request.result.expenses.dinner,
    //         snack: request.result.expenses.snack,
    //       });
    //     };
    //     request.onerror = (event) => {
    //       console.log(`!DB Error: ${event.target.error}`);
    //     };
    //     tx.oncomplete = () => {
    //       db.close();
    //     };
    //   };
  };

  return (
    <div>
      <div className="row align-middle my-1">
        <div className="col-2"></div>
        <div className="col-5">Hotel: {hotelInfo}</div>
        <div className="col-3">Layover Length: {layoverLength}</div>
        <div className="col-2">Meals: {layoverMeals}</div>
      </div>
      <p>~ Arrival: {times.arrival.format(timeFormat)}</p>
      {`~ Layover: ${layoverTimes.start.format(
        'HH:mm'
      )} - ${layoverTimes.end.format('HH:mm')}`}
      <p>~ Depart: {times.departure.format(timeFormat)}</p>
      <p>~ Full Days: {fullDays}</p>
      <ExpensesTable
        station={layoverStation}
        meals={meals}
        expenses={expenses}
        isLayover={true}
        fullDays={fullDays}
      />
    </div>
  );
}

export default Layover;
