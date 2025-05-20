/* eslint-disable react/prop-types */
import { useState } from 'react';
// import { TimePicker } from '@mui/x-date-pickers';
// import ExplanationInternationalArrival from './ExplanationInternationalArrival';
// import ExplanationInternationalDept from './ExplanationInternationalDept';
// import dayjs from 'dayjs';
// import isBetween from 'dayjs/plugin/isBetween';
// import customParseFormat from 'dayjs/plugin/customParseFormat';

// dayjs.extend(isBetween);
// dayjs.extend(customParseFormat);
// const timeFormat = 'HH:mm';

function Layover({ layover }) {
  const { hotelInfo, layoverLength, meals } = layover;
  // const [station, setStation] = useState('YUL');
  // const [layoverTimes, setLayoverTimes] = useState({
  //   layover_start: dayjs('15:55', timeFormat),
  //   layover_end: dayjs('17:40', timeFormat),
  // });
  // const [fullDays, setFullDays] = useState(0);
  // // const [filtered, setFiltered] = useState([]);

  // // Amount of expenses earned for each type of meal
  // const [expenses, setExpenses] = useState({
  //   breakfast: 17.95,
  //   lunch: 20.33,
  //   dinner: 40.27,
  //   snack: 10.52,
  // });

  // // Number of each type of meal
  // const [meals, setMeals] = useState({
  //   breakfast: 1,
  //   lunch: 1,
  //   dinner: 2,
  //   snack: 1,
  // });

  // // Number of CICO paid
  // const [cico, setCico] = useState(1);

  // const handleStationChange = (e) => {
  //   const new_station = e.target.value;
  //   setStation(new_station);

  //   const request = window.indexedDB.open('ExpensesDB', 1);

  //   request.onsuccess = (event) => {
  //     const db = event.target.result;
  //     const tx = db.transaction(['expenses'], 'readonly');
  //     const expensesStore = tx.objectStore('expenses');
  //     // const airportCodesIndex = expensesStore.index('airport_codes');
  //     const request = expensesStore.getAll();

  //     request.onsuccess = () => {
  //       const filtered = request.result.filter((item) => {
  //         if (item['airport_codes']) {
  //           for (let i = 0; i < item['airport_codes'].length; i++) {
  //             if (item['airport_codes'][i].includes(new_station)) {
  //               return true;
  //             }
  //           }
  //         }
  //       });
  //       console.log(filtered);
  //       // setFiltered(filtered);
  //       if (filtered.length === 1) {
  //         setExpenses({
  //           breakfast: filtered[0].expenses.breakfast,
  //           lunch: filtered[0].expenses.lunch,
  //           dinner: filtered[0].expenses.dinner,
  //           snack: filtered[0].expenses.snack,
  //         });
  //       }
  //     };

  //     request.onerror = (event) => {
  //       console.log(`!DB Error: ${event.target.error}`);
  //     };

  //     tx.oncomplete = () => {
  //       db.close();
  //     };
  //   };
  // };

  // const handleExpensesChange = (e) => {
  //   // handle changes to expenses amount ($)
  //   const { name, value } = e.target;

  //   setExpenses((prev) => {
  //     return {
  //       ...prev,
  //       [name]: value,
  //     };
  //   });
  // };

  // const handleTimeChange = ({ target }) => {
  //   // handle changes to times, and recalculate number of meals/expenses
  //   const { name, value } = target;
  //   setLayoverTimes((prev) => ({
  //     ...prev,
  //     [name]: dayjs(value, timeFormat),
  //   }));
  // };

  // useEffect(() => {
  //   let new_expenses = calculateFirstDayExpenses();
  //   new_expenses += calculateLastDayExpenses();

  //   setMeals({
  //     breakfast: (new_expenses.match(/B/g) || []).length,
  //     lunch: (new_expenses.match(/L/g) || []).length,
  //     dinner: (new_expenses.match(/D/g) || []).length,
  //     snack: (new_expenses.match(/S/g) || []).length,
  //   });
  // }, [layoverTimes]);

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

  // const calculateFirstDayExpenses = () => {
  //   const time = layoverTimes.layover_start;
  //   if (dayjs(time).isBefore(dayjs('12:30', timeFormat), 'minute')) {
  //     return 'BLDS';
  //   } else if (
  //     time.isBetween(
  //       dayjs('12:30', timeFormat),
  //       dayjs('13:30', timeFormat),
  //       'minute',
  //       '[]'
  //     )
  //   ) {
  //     return 'LDS';
  //   } else {
  //     return 'DS';
  //   }
  // };

  // const calculateLastDayExpenses = () => {
  //   const time = layoverTimes.layover_end;

  //   if (
  //     time.isBetween(
  //       dayjs('7:00', timeFormat),
  //       dayjs('11:29', timeFormat),
  //       'minute',
  //       '[]'
  //     )
  //   ) {
  //     return 'B';
  //   } else if (
  //     time.isBetween(
  //       dayjs('11:30', timeFormat),
  //       dayjs('16:59', timeFormat),
  //       'minute',
  //       '[]'
  //     )
  //   ) {
  //     return 'BL';
  //   } else if (
  //     time.isBetween(
  //       dayjs('17:00', timeFormat),
  //       dayjs('21:59', timeFormat),
  //       'minute',
  //       '[]'
  //     )
  //   ) {
  //     return 'BLD';
  //   } else if (
  //     time.isBetween(
  //       dayjs('22:00', timeFormat),
  //       dayjs('01:00', timeFormat).add(1, 'day'),
  //       'minute',
  //       '[]'
  //     )
  //   ) {
  //     return 'BLDS';
  //   } else {
  //     console.log('!triggered else');
  //     return '';
  //   }
  // };

  // const calculateDisplayBreakfastTotal = () => {
  //   return meals.breakfast * expenses.breakfast;
  // };

  // const calculateDisplayLunchTotal = () => {
  //   return meals.lunch * expenses.lunch;
  // };

  // const calculateDisplayDinnerTotal = () => {
  //   return meals.dinner * expenses.dinner;
  // };

  // const calculateDisplaySnackTotal = () => {
  //   return meals.snack * expenses.snack;
  // };

  // const calculateDisplayTotal = () => {
  //   return (
  //     calculateDisplayBreakfastTotal() +
  //     calculateDisplayLunchTotal() +
  //     calculateDisplayDinnerTotal() +
  //     calculateDisplaySnackTotal() +
  //     cico * 5.05
  //   ).toFixed(2);
  // };

  // const handleSearchClick = () => {
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
  //       // console.log(`!DB: ${JSON.stringify(request.result)}`);
  //     };

  //     request.onerror = (event) => {
  //       console.log(`!DB Error: ${event.target.error}`);
  //     };

  //     tx.oncomplete = () => {
  //       db.close();
  //     };
  //   };
  // };

  return (
    <p className="mt-3">
      Hotel: {hotelInfo} Layover Length: {layoverLength} Meals: {meals}
    </p>
  );
}

export default Layover;
