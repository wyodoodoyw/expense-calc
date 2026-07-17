/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import getExpensesFromDB from '../../modules/getExpensesFromDB';
import getMealsFromSequence from '../../modules/getMealsFromSequence';
import getMealsFromSequenceDom from '../../modules/getMealsFromSequenceDom';
import calculateDisplayTotal from '../../modules/calcDisplayTotal';
import sun_domestic_airport_codes from '../../data/sun_domestic_airport_codes';

const ExpensesTable = () => {
  const p = useSelector((state) => state.pairing);
  const seq = p.sequence;
  const numLayovers = p.layoverCount;

  const [meals, setMeals] = useState([]);
  const [station, setStation] = useState('');
  const [caExpenses, setCaExpenses] = useState({});
  const [usExpenses, setUsExpenses] = useState({});
  const [intlExpenses, setIntlExpenses] = useState({});
  const [displayTotal, setDisplayTotal] = useState(0);

  useEffect(() => {
    // INTERNATIONAL PAIRINGS
    if (!p.pairingIdentifier || seq.length === 0) return;

    if (p.isInt) {
      const { meals: derivedMeals, station: intlStation } =
        getMealsFromSequence(seq || []);
      setMeals(derivedMeals);
      setStation(intlStation);

      // fetch CA expenses (base) and fetch intl expenses only if station found
      getExpensesFromDB('YYZ', setCaExpenses);
      if (intlStation) {
        getExpensesFromDB(intlStation, setIntlExpenses);
      } else {
        setIntlExpenses({});
      }
      // DOMESTIC AND TB PAIRINGS
    } else {
      const getDomMeals = async () => {
        const { meals: derivedMeals, station: station } =
          await getMealsFromSequenceDom(p.pairingIdentifier, seq || []);
        setMeals(derivedMeals || []);
        setStation(station);
        sun_domestic_airport_codes.includes(station) &&
          getExpensesFromDB(station, setIntlExpenses);
      };

      getDomMeals();

      // fetch CA expenses (base) and fetch intl expenses only if station found
      getExpensesFromDB('YYZ', setCaExpenses);
      getExpensesFromDB('MCO', setUsExpenses);
    }
  }, [seq]);

  useEffect(() => {
    const hasMeals = Array.isArray(meals) && meals.length > 0;
    const needsCa = hasMeals && meals.some((m) => m.station === 'YYZ');
    const needsUSA = hasMeals && meals.some((m) => m.station === 'MCO');
    const needsIntl = hasMeals && meals.some((m) => m.station === 'int');

    const caLoaded = Object.keys(caExpenses || {}).length > 0;
    const usLoaded = Object.keys(usExpenses || {}).length > 0;
    const intlLoaded = Object.keys(intlExpenses || {}).length > 0;

    if (!hasMeals) {
      setDisplayTotal(0);
      return;
    }

    if (
      (needsCa && !caLoaded) ||
      (needsUSA && !usLoaded) ||
      (needsIntl && !intlLoaded) ||
      !meals ||
      numLayovers === undefined
    ) {
      // wait until required expenses are loaded
      return;
    }

    const total = calculateDisplayTotal(
      meals,
      caExpenses,
      usExpenses,
      intlExpenses,
      numLayovers,
    );

    setDisplayTotal(total.toFixed(2));
  }, [meals, caExpenses, usExpenses, intlExpenses, numLayovers]);

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

        {meals &&
          meals.map((item) => {
            if (
              item.station === 'YYZ' ||
              item.station === 'MCO' ||
              sun_domestic_airport_codes.includes(item.station)
            ) {
              return (
                item.meals && (
                  <tr key={item.index}>
                    <td>🇨🇦</td>
                    <td>
                      {(item.meals.includes('B') && caExpenses.breakfast) ||
                        (item.meals.includes('C') &&
                          usExpenses.breakfast + '*') ||
                        (item.meals.includes('A') &&
                          intlExpenses.breakfast + '**')}
                    </td>
                    <td>
                      {(item.meals.includes('L') && caExpenses.lunch) ||
                        (item.meals.includes('M') && usExpenses.lunch + '*') ||
                        (item.meals.includes('N') && intlExpenses.lunch + '**')}
                    </td>
                    <td>
                      {(item.meals.includes('D') && caExpenses.dinner) ||
                        (item.meals.includes('E') && usExpenses.dinner + '*') ||
                        (item.meals.includes('F') &&
                          intlExpenses.dinner + '**')}
                    </td>
                    <td>
                      {(item.meals.includes('S') && caExpenses.snack) ||
                        (item.meals.includes('T') && usExpenses.snack + '*') ||
                        (item.meals.includes('U') && intlExpenses.snack + '**')}
                    </td>
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
                    {item.meals &&
                      item.meals.includes('L') &&
                      intlExpenses.lunch}
                  </td>
                  <td>
                    {item.meals &&
                      item.meals.includes('D') &&
                      intlExpenses.dinner}
                  </td>
                  <td>
                    {item.meals &&
                      item.meals.includes('S') &&
                      intlExpenses.snack}
                  </td>
                </tr>
              );
            }
          })}
        {meals && (
          <>
            <tr className="table-secondary">
              <td>CI/CO:</td>
              <td colSpan={4}>{(numLayovers * 5.05).toFixed(2)}</td>
            </tr>

            <tr className="table-primary">
              <td>Total:</td>
              <td colSpan={4}>${displayTotal}</td>
            </tr>
          </>
        )}
      </tbody>
    </table>
  );
};

export default ExpensesTable;
