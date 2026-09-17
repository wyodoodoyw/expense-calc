/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import getExpensesFromDB from '../../modules/getExpensesFromDB';
import getMealsFromSequence from '../../modules/getMealsFromSequence';
import getMealsFromSequenceDom from '../../modules/getMealsFromSequenceDom';
import calculateDisplayTotal from '../../modules/calcDisplayTotal';
import international_airport_codes from '../../data/international_airport_codes';
import american_airport_codes from '../../data/american_airport_codes';
import na_sun_airports from '../../data/na_sun_airports';
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
    if (!p.pairingIdentifier || seq.length === 0) return;

    let arrivalStations = [];
    seq.forEach((s) => {
      if (s.type === 'flight') arrivalStations.push(s.arrivalAirport);
    });
    getExpensesFromDB('YYZ', setCaExpenses);

    // INTERNATIONAL PAIRINGS
    if (arrivalStations.some((s) => international_airport_codes.includes(s))) {
      const { meals: derivedMeals, station: intlStation } =
        getMealsFromSequence(seq || []);
      setMeals(derivedMeals);
      setStation(intlStation);
      getExpensesFromDB(intlStation, setIntlExpenses);

      // DOMESTIC AND TB PAIRINGS
    } else if (arrivalStations.every((s) => na_sun_airports.includes(s))) {
      const getDomMeals = async () => {
        const { meals: derivedMeals, station: station } =
          await getMealsFromSequenceDom(p.pairingIdentifier, seq || [], p.tafb);
        setMeals(derivedMeals || []);
        setStation(station);
        na_sun_airports.includes(station) &&
          getExpensesFromDB(station, setIntlExpenses);
      };

      getDomMeals();

      if (arrivalStations.some((s) => american_airport_codes.includes(s))) {
        getExpensesFromDB('MCO', setUsExpenses);
      }
    } else {
      console.log('No valid arrival stations found in sequence');
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
      <tfoot>
        <tr>
          <td colSpan={5}>* US meals shown in CAD</td>
        </tr>
        <tr>
          <td colSpan={5}>** Sun Destination meals shown in CAD</td>
        </tr>
      </tfoot>
    </table>
  );
};

export default ExpensesTable;
