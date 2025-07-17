/* eslint-disable react/prop-types */
import canadian_airport_codes from '../../data/canadian_airport_codes';
import american_airport_codes from '../../data/american_airport_codes';
import { useSelector } from 'react-redux';
import { useState, useEffect, use } from 'react';
import dayjs from 'dayjs';

const timeFormat = 'HH:mm';

const ExpensesTable = (props) => {
  const { station } = props;

  const p = useSelector((state) => state.pairing);
  const meals = p.calculatedMeals;
  const numLayovers = p.layoverCount;
  const isLayover = numLayovers > 0;

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

  // const [displayTotal, setDisplaytotal] = useState(0.0);

  useEffect(() => {
    getExpenseAmounts(station);
    adjustforUS();
  }, []);

  useEffect(() => {
    // setDisplaytotal(calculateDisplayTotal(caMeals));
  });

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
        if (american_airport_codes.includes('SFO')) {
          const request2 = airportCodesIndex.get('SFO');
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

  const adjustforUS = () => {
    const s = p.sequence;
    const dutyDays = p.dutyDays;

    // ARRIVAL
    for (let i = 0; i < s.length; i++) {
      if (american_airport_codes.includes(s[i].arrivalAirport)) {
        console.log(`Adjust: ${s[i].index} arriving at ${s[i].arrivalAirport}`);
        const time = dayjs(s[i].arrivalTime, timeFormat);
        let duty = {
          start: dayjs('00:00', timeFormat),
          end: dayjs('23:59', timeFormat),
        };
        for (let j = 0; j < dutyDays.length; j++) {
          // set duty.start to start of first duty day
          if (
            dutyDays[j].flightIndices.includes(s[i].index) &&
            dutyDays.index === 0
          ) {
            duty.start = dayjs(dutyDays[0].dutyDayStart, timeFormat);
          }
          // set duty.end to end of last duty day
          if (
            dutyDays[j].flightIndices.includes(s[i].index) &&
            dutyDays.index === dutyDays.length - 1
          ) {
            duty.start = dayjs(
              dutyDays[dutyDays.length - 1].dutyDayEnd,
              timeFormat
            );
          }

          if (
            time.isAfter(dayjs('18:30', timeFormat), 'minute') &&
            duty.start.isBefore(dayjs('17:00', timeFormat), 'minutes') &&
            duty.end.isAfter(dayjs('18:30', timeFormat), 'minutes')
          ) {
            setCaMeals((prev) => ({
              ...prev,
              dinner: prev.dinner - 1,
            }));
            setUsMeals((prev) => ({
              ...prev,
              dinner: prev.dinner + 1,
            }));
            return 'D';
          } else if (
            time.isAfter(dayjs('13:30', timeFormat), 'minute') &&
            duty.start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
            duty.end.isAfter(dayjs('13:30', timeFormat), 'minutes')
          ) {
            console.log('L');
            return 'L';
          } else if (
            time.isAfter(dayjs('09:30', timeFormat), 'minute') &&
            duty.start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
            duty.end.isAfter(dayjs('09:30', timeFormat), 'minutes')
          ) {
            console.log('B');
            return 'B';
          } else if (
            time.isAfter(dayjs('01:00', timeFormat), 'minute') &&
            duty.start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
            duty.end.isAfter(
              (dayjs('01:00', timeFormat).add(1, 'day'), 'minutes')
            )
          ) {
            console.log('S');
            return 'S';
          }
        }
      }

      // DEPARTURE
      if (american_airport_codes.includes(s[i].departureAirport)) {
        console.log(
          `Adjust: ${s[i].index} departing from ${s[i].departureAirport}`
        );
      }
    }
  };

  const calculateDisplayTotal = (meals, expenses) => {
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

  return (
    <table className="table table-striped table-bordered mt-3 text-center ">
      <tbody>
        <tr>
          <th>{station}</th>
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
          <td colSpan={5}>${calculateDisplayTotal(caMeals, caExpenses)}</td>
        </tr>

        <tr>
          <th>SFO**</th>
          <th>Breakfast</th>
          <th>Lunch</th>
          <th>Dinner</th>
          <th>Snack</th>
          <th>-</th>
        </tr>
        <tr>
          <td></td>
          <td>{usMeals.breakfast}</td>
          <td>{usMeals.lunch}</td>
          <td>{usMeals.dinner}</td>
          <td>{usMeals.snack}</td>
          <td>-</td>
        </tr>
        <tr>
          <td>x</td>
          <td>${usExpenses.breakfast}</td>
          <td>${usExpenses.lunch}</td>
          <td>${usExpenses.dinner}</td>
          <td>${usExpenses.snack}</td>
          <td>-</td>
        </tr>
        <tr>
          <td>=</td>
          <td>${(usMeals.breakfast * usExpenses.breakfast).toFixed(2)}</td>
          <td>${(usMeals.lunch * usExpenses.lunch).toFixed(2)}</td>
          <td>${(usMeals.dinner * usExpenses.dinner).toFixed(2)}</td>
          <td>${(usMeals.snack * usExpenses.snack).toFixed(2)}</td>
          <td>-</td>
        </tr>
        <tr className="table-primary">
          <td>Total:</td>
          <td colSpan={5}>${calculateDisplayTotal(usMeals, usExpenses)}</td>
        </tr>
        <tr className="table-primary">
          <td>Grand Total:</td>
          <td colSpan={5}>
            $
            {Number(calculateDisplayTotal(caMeals, caExpenses)) +
              Number(calculateDisplayTotal(usMeals, usExpenses))}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default ExpensesTable;
