/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
// import ExpensesTable from '../features/expensesTable/expensesTableSlice';
import na_sun_airports from '../data/na_sun_airports';
import international_airport_codes from '../data/international_airport_codes';
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

  const pairing = useSelector((state) => state.pairing);
  const l = pairing.sequence[index]; //layover

  // Previous Flight
  const prevFlight = pairing.sequence[index - 1];
  const layoverStart = dayjs()
    .set('hour', prevFlight.arrivalTime.slice(0, -2))
    .set('minute', prevFlight.arrivalTime.slice(-2));
  // Next Flight
  const nextFlight = pairing.sequence[index + 1];
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
  const [expenses, setExpenses] = useState({});

  // Number of each type of meal
  const [meals, setMeals] = useState({
    breakfast: (l.layoverMeals.match(/B/g) || []).length,
    lunch: (l.layoverMeals.match(/L/g) || []).length,
    dinner: (l.layoverMeals.match(/D/g) || []).length,
    snack: (l.layoverMeals.match(/S/g) || []).length,
  });

  useEffect(() => {
    getExpenseAmounts(l.layoverStation);
  }, []);

  useEffect(() => {
    let new_expenses = '';
    if (international_airport_codes.includes(l.layoverStation)) {
      new_expenses = calculateFirstDayExpensesIntl();
      new_expenses += calculateLastDayExpensesIntl();
      // console.log(`New: ${new_expenses}`);
    } else if (na_sun_airports.includes(l.layoverStation)) {
      new_expenses = calculateLayoverExpensesNASun();
      // new_expenses += calculateLastDayExpensesNASun();
      // console.log(new_expenses);
    }

    setMeals({
      breakfast: (new_expenses.match(/B/g) || []).length,
      lunch: (new_expenses.match(/L/g) || []).length,
      dinner: (new_expenses.match(/D/g) || []).length,
      snack: (new_expenses.match(/S/g) || []).length,
    });
  }, [prevFlight.arrivalTime, nextFlight.departureTime]);

  // NASun Layover
  const calculateLayoverExpensesNASun = () => {
    const start = dayjs(layoverStart);
    const end = dayjs(layoverEnd);
    let meals = '';
    if (
      start.isBefore(dayjs('08:00', timeFormat), 'minute') &&
      end.isAfter(dayjs('09:30', timeFormat), 'minute')
    ) {
      meals += 'B';
    }
    if (
      start.isBefore(dayjs('12:30', timeFormat), 'minute') &&
      end.isAfter(dayjs('13:30', timeFormat), 'minute')
    ) {
      meals += 'L';
    }
    if (
      start.isBefore(dayjs('17:00', timeFormat), 'minute') &&
      end.isAfter(dayjs('18:30', timeFormat), 'minute')
    ) {
      meals += 'D';
    }
    if (
      start.isBefore(dayjs('23:00', timeFormat), 'minute') &&
      end.isAfter(dayjs('01:00', timeFormat), 'minute')
    ) {
      meals += 'S';
    }
    return meals;
  };

  // const calculateLastDayExpensesNASun = () => {
  //   const time = dayjs(layoverEnd);
  //   if (time.isAfter(dayjs('18:30', timeFormat), 'minute')) {
  //     return 'BLD';
  //   } else if (time.isAfter(dayjs('13:30', timeFormat), 'minute')) {
  //     return 'BL';
  //   } else if (time.isAfter(dayjs('09:30', timeFormat), 'minute')) {
  //     return 'B';
  //   } else if (time.isAfter(dayjs('01:00', timeFormat), 'minute')) {
  //     return 'BLDS';
  //   }
  // };

  // International Layover
  const calculateFirstDayExpensesIntl = () => {
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

  const calculateLastDayExpensesIntl = () => {
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
      {international_airport_codes.includes(l.layoverStation) && (
        <ExpensesTable
          station={l.layoverStation}
          meals={meals}
          expenses={expenses}
          isLayover={true}
          fullDays={calculateFullDays()}
        />
      )}
    </div>
  );
}

export default Layover;
