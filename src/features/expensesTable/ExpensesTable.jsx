/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import getExpenseseFromDB from '../../modules/getExpensesFromDB';
import getMealsFromSequence from '../../modules/getMealsFromSequence';
import calculateDisplayTotal from '../../modules/calculateDisplayTotal';

const ExpensesTable = () => {
  const p = useSelector((state) => state.pairing);
  const seq = p.sequence;
  const numLayovers = p.layoverCount;

  const [meals, setMeals] = useState([]);
  const [station, setStation] = useState('');
  const [caExpenses, setCaExpenses] = useState({});
  const [intlExpenses, setIntlExpenses] = useState({});
  const [displayTotal, setDisplayTotal] = useState(0);

  // useEffect(() => {
  //   determineIntlStation();
  //   getExpenseseFromDB('YYZ', setCaExpenses);
  //   calculateMeals();
  // }, [p]);

  // useEffect(() => {
  //   calculateDisplayTotal(
  //     meals,
  //     caExpenses,
  //     intlExpenses,
  //     numLayovers,
  //     setDisplayTotal
  //   );
  // }, [meals, caExpenses, intlExpenses, numLayovers]);

  useEffect(() => {
    const { meals: derivedMeals, station: intlStation } = getMealsFromSequence(
      seq || []
    );
    setMeals(derivedMeals);
    setStation(intlStation);

    // fetch CA expenses (base) and fetch intl expenses only if station found
    getExpenseseFromDB('YYZ', setCaExpenses);
    if (intlStation) {
      getExpenseseFromDB(intlStation, setIntlExpenses);
    } else {
      setIntlExpenses({});
    }
  }, [p]);

  useEffect(() => {
    const hasMeals = Array.isArray(meals) && meals.length > 0;
    const needsIntl = hasMeals && meals.some((m) => m.station === 'int');
    const needsCa = hasMeals && meals.some((m) => m.station === 'YYZ');

    const caLoaded = Object.keys(caExpenses || {}).length > 0;
    const intlLoaded = Object.keys(intlExpenses || {}).length > 0;

    if (!hasMeals) {
      setDisplayTotal(0);
      return;
    }

    if ((needsCa && !caLoaded) || (needsIntl && !intlLoaded)) {
      // wait until required expenses are loaded
      return;
    }

    const total = calculateDisplayTotal(
      meals,
      caExpenses,
      intlExpenses,
      numLayovers
    );
    setDisplayTotal(total.toFixed(2));
  }, [meals, caExpenses, intlExpenses, numLayovers]);

  return (
    <table className="table table-striped table-bordered mt-3 text-center ">
      <tbody>
        <tr>
          <th>Station</th>
          <th>Breakfast</th>
          <th>Lunch</th>
          <th>Dinner</th>
          <th>Snack</th>
        </tr>

        {meals.map((item) => {
          if (item.station === 'YYZ') {
            return (
              item.meals && (
                <tr key={item.index}>
                  <td>🇨🇦</td>
                  <td>{item.meals.includes('B') && caExpenses.breakfast}</td>
                  <td>{item.meals.includes('L') && caExpenses.lunch}</td>
                  <td>{item.meals.includes('D') && caExpenses.dinner}</td>
                  <td>{item.meals.includes('S') && caExpenses.snack}</td>
                </tr>
              )
            );
          } else if (item.station === 'int') {
            return (
              <tr key={item.index}>
                <td>{station}</td>
                <td>
                  {item.meals &&
                    item.meals.includes('B') &&
                    intlExpenses.breakfast}
                </td>
                <td>
                  {item.meals && item.meals.includes('L') && intlExpenses.lunch}
                </td>
                <td>
                  {item.meals &&
                    item.meals.includes('D') &&
                    intlExpenses.dinner}
                </td>
                <td>
                  {item.meals && item.meals.includes('S') && intlExpenses.snack}
                </td>
              </tr>
            );
          }
        })}
        <tr className="table-secondary">
          <td>CI/CO:</td>
          <td colSpan={4}>{(numLayovers * 5.05).toFixed(2)}</td>
        </tr>

        <tr className="table-primary">
          <td>Total:</td>
          <td colSpan={4}>
            {/* <Total displayTotal={Number(displayTotal)} /> */}${displayTotal}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default ExpensesTable;
