/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import american_airport_codes from '../../data/american_airport_codes';

const ExpensesTable = () => {
  const p = useSelector((state) => state.pairing);
  const meals = p.calculatedMeals;
  let mmeals = meals.split('BLDS');
  for (let i = 0; i < mmeals.length; i++) {
    if (mmeals[i] === '') {
      mmeals[i] = 'BLDS';
    }
  }
  // console.log(mmeals);
  const numLayovers = p.layoverCount;
  const isLayover = numLayovers > 0;

  const [caMeals, setCaMeals] = useState({
    breakfast: (meals.match(/B/g) || []).length,
    lunch: (meals.match(/L/g) || []).length,
    dinner: (meals.match(/D/g) || []).length,
    snack: (meals.match(/S/g) || []).length,
  });

  const [caExpenses, setCaExpenses] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null,
  });

  const [usExpenses, setUsExpenses] = useState(null);

  const [intlExpenses, setIntlExpenses] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null,
  });

  useEffect(() => {
    setCaMeals({
      breakfast: (meals.match(/B/g) || []).length,
      lunch: (meals.match(/L/g) || []).length,
      dinner: (meals.match(/D/g) || []).length,
      snack: (meals.match(/S/g) || []).length,
    });
    getExpenseAmounts('YYZ');
    getExpenseAmounts('MCO');
    getExpenseAmounts('NRT');
    calculateCaDisplayTotal(caMeals, caExpenses);
  }, [meals]);

  const getExpenseAmounts = (station) => {
    const request = window.indexedDB.open('ExpensesDB', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction(['expenses'], 'readonly');
      const expensesStore = tx.objectStore('expenses');
      const airportCodesIndex = expensesStore.index('airport_codes');
      const request = airportCodesIndex.get(station);
      request.onsuccess = () => {
        const exp = request.result.expenses;

        switch (station) {
          case 'YYZ':
            setCaExpenses({
              breakfast: exp.breakfast,
              lunch: exp.lunch,
              dinner: exp.dinner,
              snack: exp.snack,
            });
            break;
          case 'MCO':
            setUsExpenses({
              breakfast: exp.breakfast,
              lunch: exp.lunch,
              dinner: exp.dinner,
              snack: exp.snack,
            });
            break;
          default:
            setIntlExpenses({
              breakfast: exp.breakfast,
              lunch: exp.lunch,
              dinner: exp.dinner,
              snack: exp.snack,
            });
            break;
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

        {mmeals.map((str, index) => {
          return (
            <tr key={index}>
              <td></td>
              <td>${str.includes('B') && caExpenses.breakfast}</td>
              <td>${str.includes('L') && caExpenses.lunch}</td>
              <td>${str.includes('D') && caExpenses.dinner}</td>
              <td>${str.includes('S') && caExpenses.snack}</td>
              {isLayover && (
                <td>${index !== mmeals.length - 1 && (5.05).toFixed(2)}</td>
              )}
              {!isLayover && <td>-</td>}
            </tr>
          );
        })}
        {/* <tr className="table-primary">
          <td>Total:</td>
          <td colSpan={5}>${calculateCaDisplayTotal(caMeals, caExpenses)}</td>
        </tr> */}
      </tbody>
    </table>
  );
};

export default ExpensesTable;
