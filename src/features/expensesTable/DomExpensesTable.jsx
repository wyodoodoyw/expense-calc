/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import getExpenseseFromDB from '../../modules/getExpensesFromDB';
import getMealsFromSequence from '../../modules/getMealsFromSequence';
import calculateDisplayTotal from '../../modules/calculateDisplayTotal';

const DomExpensesTable = () => {
  const p = useSelector((state) => state.pairing);
  const seq = p.sequence;
  const numLayovers = p.layoverCount;

  const [meals, setMeals] = useState([]);
  const [station, setStation] = useState('');
  const [caExpenses, setCaExpenses] = useState({});
  const [usaExpenses, setUsaExpenses] = useState({});
  const [displayTotal, setDisplayTotal] = useState(0);

  useEffect(() => {
    const { meals: derivedMeals, station: usaStation } = getMealsFromSequence(
      seq || []
    );
    setMeals(derivedMeals);
    setStation(usaStation);

    // fetch CA expenses (base) and fetch usa expenses only if station found
    getExpenseseFromDB('YYZ', setCaExpenses);
    if (usaStation) {
      getExpenseseFromDB('MCO', setUsaExpenses);
    } else {
      setUsaExpenses({});
    }
  }, [p]);

  useEffect(() => {
    const hasMeals = Array.isArray(meals) && meals.length > 0;
    const needsUsa = hasMeals && meals.some((m) => m.station === 'usa');
    const needsCa = hasMeals && meals.some((m) => m.station === 'YYZ');

    const caLoaded = Object.keys(caExpenses || {}).length > 0;
    const usaLoaded = Object.keys(usaExpenses || {}).length > 0;

    if (!hasMeals) {
      setDisplayTotal(0);
      return;
    }

    if ((needsCa && !caLoaded) || (needsUsa && !usaLoaded)) {
      // wait until required expenses are loaded
      return;
    }

    const total = calculateDomDisplayTotal(
      meals,
      caExpenses,
      usaExpenses,
      numLayovers
    );
    setDisplayTotal(total.toFixed(2));
  }, [meals, caExpenses, usaExpenses, numLayovers]);

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
          } else if (item.station === 'usa') {
            return (
              <tr key={item.index}>
                <td>🇺🇸</td>
                <td>
                  {item.meals &&
                    item.meals.includes('B') &&
                    usaExpenses.breakfast}
                </td>
                <td>
                  {item.meals && item.meals.includes('L') && usaExpenses.lunch}
                </td>
                <td>
                  {item.meals && item.meals.includes('D') && usaExpenses.dinner}
                </td>
                <td>
                  {item.meals && item.meals.includes('S') && usaExpenses.snack}
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
          <td colSpan={4}>${displayTotal}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default DomExpensesTable;
