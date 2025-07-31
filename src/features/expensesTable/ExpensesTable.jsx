/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import canadian_airport_codes from '../../data/canadian_airport_codes';
import american_airport_codes from '../../data/american_airport_codes';
import international_airport_codes from '../../data/international_airport_codes';
import calcMealsDomDept from '../../modules/calcMealsDomDept';
import calcMealsDomArrival from '../../modules/calcMealsDomArrival';
import calcMealsIntDept from '../../modules/calcMealsIntDept';
import calcMealsIntArrival from '../../modules/calcMealsIntArrival';

const ExpensesTable = () => {
  const p = useSelector((state) => state.pairing);
  const seq = p.sequence;
  const meals = p.calculatedMeals;
  let mmeals = meals.split('BLDS');
  for (let i = 0; i < mmeals.length; i++) {
    if (mmeals[i] === '') {
      mmeals[i] = 'BLDS';
    }
  }

  const numLayovers = p.layoverCount;
  const isLayover = numLayovers > 0;

  const [station, setStation] = useState('');

  const [caMeals, setCaMeals] = useState({
    breakfast: (meals.match(/B/g) || []).length,
    lunch: (meals.match(/L/g) || []).length,
    dinner: (meals.match(/D/g) || []).length,
    snack: (meals.match(/S/g) || []).length,
  });

  const [caExpenses, setCaExpenses] = useState({});

  const [usExpenses, setUsExpenses] = useState({});

  const [intlExpenses, setIntlExpenses] = useState({});

  useEffect(() => {
    setCaMeals({
      breakfast: (meals.match(/B/g) || []).length,
      lunch: (meals.match(/L/g) || []).length,
      dinner: (meals.match(/D/g) || []).length,
      snack: (meals.match(/S/g) || []).length,
    });

    processLayovers();

    getExpenseAmounts('YYZ');
    getExpenseAmounts('MCO');
    getExpenseAmounts('NRT');

    // calculateDisplayTotal(caMeals, caExpenses);
  }, []);

  const getExpenseAmounts = (stn) => {
    const request = window.indexedDB.open('ExpensesDB', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction(['expenses'], 'readonly');
      const expensesStore = tx.objectStore('expenses');
      const airportCodesIndex = expensesStore.index('airport_codes');
      const request = airportCodesIndex.get(stn);
      request.onsuccess = () => {
        const exp = request.result.expenses;

        switch (stn) {
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

  const processLayovers = () => {
    for (let i = 0; i < seq.length; i++) {
      if (
        seq[i].hotelInfo &&
        international_airport_codes.includes(seq[i].layoverStation)
      ) {
        console.log(seq[i].layoverStation);
        setStation(seq[i].layoverStation);
        const amount = calculateIntLayover(
          seq[i].layoverStart,
          seq[i].layoverEnd
        );
        // console.log(`int meals: ${amount}`);
      } else if (
        i === 0 &&
        canadian_airport_codes.includes(seq[i].layoverStation)
      ) {
        const amount2 = calculateDomLayoverPrior();
        console.log(amount2);
      } else if (
        i === seq.length - 2 &&
        canadian_airport_codes.includes(seq[i].layoverStation)
      ) {
        calculateDomLayoverAfter();
      }
    }
  };

  const calculateDomLayoverPrior = (start, end) => {
    let meals = '';
    meals = calcMealsDomDept(start, 'dutyStart');
    meals += calcMealsIntDept('deptTime');
    return meals;
  };

  const calculateDomLayoverAfter = (start, end) => {
    let meals = '';
    meals = calcMealsIntArrival('arrivalTime');
    meals += calcMealsDomArrival('arrivalTime', 'dutyEnd');
    return meals;
  };

  const calculateIntLayover = (start, end) => {
    let meals = '';
    meals = calcMealsIntArrival(start);
    meals += calcMealsIntDept(end);
    return meals;
  };

  const calculateDisplayTotal = (meals, expenses) => {
    return (
      meals.breakfast * expenses.breakfast +
      meals.lunch * expenses.lunch +
      meals.dinner * expenses.dinner +
      meals.snack * expenses.snack +
      numLayovers * 5.05
    ).toFixed(2);
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
        <tr className="table-primary">
          <td>Total:</td>
          <td colSpan={5}>${calculateDisplayTotal(caMeals, caExpenses)}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default ExpensesTable;
