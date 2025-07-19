/* eslint-disable react/prop-types */
import canadian_airport_codes from '../../data/canadian_airport_codes';
import american_airport_codes from '../../data/american_airport_codes';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const timeFormat = 'HH:mm';

const InternationalExpensesTable = () => {
  const p = useSelector((state) => state.pairing);
  const meals = p.calculatedMeals;
  const numLayovers = p.layoverCount;
  const isLayover = numLayovers > 0;

  const [usLayovers, setUsLayovers] = useState();

  const [caMeals, setCaMeals] = useState({
    breakfast: (meals.match(/B/g) || []).length,
    lunch: (meals.match(/L/g) || []).length,
    dinner: (meals.match(/D/g) || []).length,
    snack: (meals.match(/S/g) || []).length,
  });

  const [usMeals, setUsMeals] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  });

  const [caExpenses, setCaExpenses] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null,
  });
  const [usExpenses, setUsExpenses] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null,
  });

  useEffect(() => {
    console.log(`triggered`);
    setCaMeals({
      breakfast: (meals.match(/B/g) || []).length,
      lunch: (meals.match(/L/g) || []).length,
      dinner: (meals.match(/D/g) || []).length,
      snack: (meals.match(/S/g) || []).length,
    });
    calculateCaDisplayTotal(caMeals, caExpenses);
  }, [meals]);

  // useEffect(() => {
  //   adjustforUS();
  // }, [usLayovers]);

  const calculateUsLayovers = () => {
    const sequence = p.sequence;
    const layovers = [];
    for (let i = 0; i < sequence.length; i++) {
      const s = sequence[i];
      if (s.hotelInfo && american_airport_codes.includes(s.layoverStation)) {
        layovers.push(s);
      }
    }
    setUsLayovers(layovers);
  };

  const getExpenseAmounts = (station) => {
    const request = window.indexedDB.open('ExpensesDB', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction(['expenses'], 'readonly');
      const expensesStore = tx.objectStore('expenses');
      const airportCodesIndex = expensesStore.index('airport_codes');
      const request = airportCodesIndex.get('YYZ');
      request.onsuccess = () => {
        const ca = request.result.expenses;
        if (canadian_airport_codes.includes(station)) {
          setCaExpenses({
            breakfast: ca.breakfast,
            lunch: ca.lunch,
            dinner: ca.dinner,
            snack: ca.snack,
          });
        }
        if (usLayovers) {
          const request2 = airportCodesIndex.get(usLayovers[0].layoverStation);
          request2.onsuccess = () => {
            const e = request2.result.expenses;
            setUsExpenses({
              breakfast: (e.breakfast - ca.breakfast).toFixed(2),
              lunch: (e.lunch - ca.lunch).toFixed(2),
              dinner: (e.dinner - ca.dinner).toFixed(2),
              snack: (e.snack - ca.snack).toFixed(2),
            });
          };
        }
      };
      request.onerror = (event) => {
        console.log(`!DB Error: ${event.target.error}`);
      };
      tx.oncomplete = () => {
        db.close();
      };
    };
  };

  // const adjustforUS = () => {
  //   const sequence = p.sequence;
  //   const dutyDays = p.dutyDays;
  //   console.log('adjustforUS called');

  // iterate over usLayovers
  // find layover, determine if it is in the US
  // adjust for US meals on US layover
  // check also flight prior and flight after layover
  // if (usLayovers) {
  //   for (let i = 0; i < usLayovers.length; i++) {
  //     const l = usLayovers[i];
  //     for (let j = 0; j < l.length; j++) {
  //       console.log(l.layoverMeals);

  //       switch (l.layoverMeals[j]) {
  //         case 'B':
  //           setCaMeals((prev) => ({
  //             ...prev,
  //             breakfast: prev.breakfast - 1,
  //           }));
  //           setUsMeals((prev) => ({
  //             ...prev,
  //             breakfast: prev.breakfast + 1,
  //           }));
  //           break;
  //         case 'L':
  //           setCaMeals((prev) => ({
  //             ...prev,
  //             breakfast: prev.lunch - 1,
  //           }));
  //           setUsMeals((prev) => ({
  //             ...prev,
  //             breakfast: prev.lunch + 1,
  //           }));
  //           break;
  //         case 'D':
  //           setCaMeals((prev) => ({
  //             ...prev,
  //             breakfast: prev.dinner - 1,
  //           }));
  //           setUsMeals((prev) => ({
  //             ...prev,
  //             breakfast: prev.dinner + 1,
  //           }));
  //           break;
  //         case 'S':
  //           setCaMeals((prev) => ({
  //             ...prev,
  //             breakfast: prev.snack - 1,
  //           }));
  //           setUsMeals((prev) => ({
  //             ...prev,
  //             breakfast: prev.snack + 1,
  //           }));
  //           break;
  //       }
  //     }
  //   }

  // if (american_airport_codes.includes(s[i].arrivalAirport)) {
  //   console.log(`Adjust: ${s[i].index} arriving at ${s[i].arrivalAirport}`);
  //   const time = dayjs(s[i].arrivalTime, timeFormat);
  //   let duty = {
  //     start: dayjs('00:00', timeFormat),
  //     end: dayjs('23:59', timeFormat),
  //   };
  //   for (let j = 0; j < dutyDays.length; j++) {
  //     // set duty.start to start of first duty day
  //     if (
  //       dutyDays[j].flightIndices.includes(s[i].index) &&
  //       dutyDays.index === 0
  //     ) {
  //       duty.start = dayjs(dutyDays[0].dutyDayStart, timeFormat);
  //     }
  //     // set duty.end to end of last duty day
  //     if (
  //       dutyDays[j].flightIndices.includes(s[i].index) &&
  //       dutyDays.index === dutyDays.length - 1
  //     ) {
  //       duty.start = dayjs(
  //         dutyDays[dutyDays.length - 1].dutyDayEnd,
  //         timeFormat
  //       );
  //     }

  //     if (
  //       time.isAfter(dayjs('18:30', timeFormat), 'minute') &&
  //       duty.start.isBefore(dayjs('17:00', timeFormat), 'minutes') &&
  //       duty.end.isAfter(dayjs('18:30', timeFormat), 'minutes')
  //     ) {
  //       setCaMeals((prev) => ({
  //         ...prev,
  //         dinner: prev.dinner - 1,
  //       }));
  //       setUsMeals((prev) => ({
  //         ...prev,
  //         dinner: prev.dinner + 1,
  //       }));
  //       return 'D';
  //     } else if (
  //       time.isAfter(dayjs('13:30', timeFormat), 'minute') &&
  //       duty.start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
  //       duty.end.isAfter(dayjs('13:30', timeFormat), 'minutes')
  //     ) {
  //       console.log('L');
  //       return 'L';
  //     } else if (
  //       time.isAfter(dayjs('09:30', timeFormat), 'minute') &&
  //       duty.start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
  //       duty.end.isAfter(dayjs('09:30', timeFormat), 'minutes')
  //     ) {
  //       console.log('B');
  //       return 'B';
  //     } else if (
  //       time.isAfter(dayjs('01:00', timeFormat), 'minute') &&
  //       duty.start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
  //       duty.end.isAfter(
  //         (dayjs('01:00', timeFormat).add(1, 'day'), 'minutes')
  //       )
  //     ) {
  //       console.log('S');
  //       return 'S';
  //     }
  //   }
  // }

  // // DEPARTURE
  // if (american_airport_codes.includes(s[i].departureAirport)) {
  //   console.log(
  //     `Adjust: ${s[i].index} departing from ${s[i].departureAirport}`
  //   );
  // }
  // } else {
  //   console.log(`No US layovers found`);
  // }
  // };

  const calculateCaDisplayTotal = (meals, expenses) => {
    const total = (
      meals.breakfast * expenses.breakfast +
      meals.lunch * expenses.lunch +
      meals.dinner * expenses.dinner +
      meals.snack * expenses.snack +
      numLayovers * 5.05
    ).toFixed(2);
    // adjustforUS();
    return total;
  };

  // const calculateUsDisplayTotal = (meals, expenses) => {
  //   const total = (
  //     meals.breakfast * expenses.breakfast +
  //     meals.lunch * expenses.lunch +
  //     meals.dinner * expenses.dinner +
  //     meals.snack * expenses.snack
  //   ).toFixed(2);
  //   // adjustforUS();
  //   return total;
  // };

  // if (!caExpenses.breakfast) {
  //   getExpenseAmounts(p.sequence[0].departureAirport);
  // }

  // if (!usLayovers) {
  //   calculateUsLayovers();
  // }
  // if (usLayovers) {
  //   adjustforUS();
  // }

  return (
    <table className="table table-striped table-bordered mt-3 text-center ">
      <tbody>
        <tr>
          <th>{p.sequence[0].departureAirport}</th>
          <th>Breakfast</th>
          <th>Lunch</th>
          <th>Dinner</th>
          <th>Snack</th>
          <th>CI/CO</th>
        </tr>
        <tr>
          <td></td>
          <td>{caMeals.breakfast}</td>
          <td>{caMeals.lunch}</td>
          <td>{caMeals.dinner}</td>
          <td>{caMeals.snack}</td>
          {isLayover && <td>{numLayovers}</td>}
          {!isLayover && <td>-</td>}
        </tr>
        <tr>
          <td>x</td>
          <td>${caExpenses.breakfast}</td>
          <td>${caExpenses.lunch}</td>
          <td>${caExpenses.dinner}</td>
          <td>${caExpenses.snack}</td>
          <td className="align-middle">$5.05</td>
        </tr>
        <tr>
          <td>=</td>
          <td>${(caMeals.breakfast * caExpenses.breakfast).toFixed(2)}</td>
          <td>${(caMeals.lunch * caExpenses.lunch).toFixed(2)}</td>
          <td>${(caMeals.dinner * caExpenses.dinner).toFixed(2)}</td>
          <td>${(caMeals.snack * caExpenses.snack).toFixed(2)}</td>
          {isLayover && <td>${(numLayovers * 5.05).toFixed(2)}</td>}
          {!isLayover && <td>-</td>}
        </tr>
        <tr className="table-primary">
          <td>Total:</td>
          <td colSpan={5}>${calculateCaDisplayTotal(caMeals, caExpenses)}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default InternationalExpensesTable;
