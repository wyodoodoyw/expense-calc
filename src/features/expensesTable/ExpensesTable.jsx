/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import canadian_airport_codes from '../../data/canadian_airport_codes';
import getExpenseseFromDB from '../../modules/getExpensesFromDB';
// import getExpenseseFromDB from '../../modules/newGetExp';
import calcMealsDomDept from '../../modules/calcMealsDomDept';
import calcMealsDomArrival from '../../modules/calcMealsDomArrival';
import calcMealsIntDept from '../../modules/calcMealsIntDept';
import calcMealsIntArrival from '../../modules/calcMealsIntArrival';
import calcLayoverDays from '../../modules/calcLayoverDays';

const ExpensesTable = () => {
  // const dispatch = useDispatch();
  const p = useSelector((state) => state.pairing);
  const seq = p.sequence;
  const numLayovers = p.layoverCount;

  const [meals, setMeals] = useState([]);
  const [station, setStation] = useState('');
  const [caExpenses, setCaExpenses] = useState({});
  const [intlExpenses, setIntlExpenses] = useState({});
  const [displayTotal, setDisplayTotal] = useState(0);

  useEffect(() => {
    processLayovers();
    getExpenseseFromDB('YYZ', setCaExpenses);
    calculateDisplayTotal();
  }, []);

  useEffect(() => {}, [displayTotal]);

  const processLayovers = () => {
    setMeals([]);
    if (seq.length === 2) {
      //no international layover, no expenses
      return;
    }
    for (let i = 0; i < seq.length; i++) {
      if (seq[i].hotelInfo && seq[i].isInt) {
        // International Layover
        setStation(seq[i].layoverStation);
        getExpenseseFromDB(seq[i].layoverStation, setIntlExpenses);
        calculateIntLayover(
          seq[i].layoverStart,
          seq[i].layoverEnd,
          seq[i].layoverLength
        );
      } else if (
        i === 1 &&
        canadian_airport_codes.includes(seq[i].layoverStation)
      ) {
        // Domestic Layover prior to International Flight/Layover
        calcDomLayoverPrior(
          seq[0].dutyStart,
          seq[0].departureTime,
          seq[2].departureTime,
          seq[1].layoverStart,
          seq[1].layoverLength
        );
      } else if (
        i === seq.length - 2 &&
        canadian_airport_codes.includes(seq[i].layoverStation)
      ) {
        // Domestic Layover after International Flight/Layover
        calcDomLayoverAfter(
          seq[seq.length - 3].arrivalTime,
          seq[seq.length - 1].arrivalTime,
          seq[seq.length - 1].dutyEnd,
          seq[seq.length - 2].layoverEnd,
          seq[seq.length - 2].layoverLength
        );
      }
    }
  };

  const calcDomLayoverPrior = (
    dutyStart,
    domDeptTime,
    intDeptTime,
    layoverStart,
    layoverLength
  ) => {
    setMeals((prev) => [
      ...prev,
      {
        index: prev.length,
        meals: calcMealsDomDept(dutyStart, domDeptTime),
        station: 'YYZ',
      },
    ]);
    if (layoverLength.slice(0, 2) - 24 + layoverStart.slice(0, 2) >= 1) {
      setMeals((prev) => [
        ...prev,
        {
          index: prev.length,
          meals: calcMealsIntDept(intDeptTime),
          station: 'YYZ',
        },
      ]);
    }
  };

  const calcDomLayoverAfter = (
    intArrivalTime,
    domArrivalTime,
    dutyEnd,
    layoverEnd,
    layoverLength
  ) => {
    setMeals((prev) => [
      ...prev,
      {
        index: prev.length,
        meals: calcMealsIntArrival(intArrivalTime),
        station: 'YYZ',
      },
    ]);
    if (
      Number(layoverLength.slice(0, 2)) - 24 + Number(layoverEnd.slice(0, 2)) >=
      24
    ) {
      setMeals((prev) => [
        ...prev,
        {
          index: prev.length,
          meals: calcMealsDomArrival(domArrivalTime, dutyEnd),
          station: 'YYZ',
        },
      ]);
    }
    setMeals((prev) => [
      ...prev,
      {
        index: prev.length,
        meals: calcMealsDomArrival(domArrivalTime, dutyEnd),
        station: 'YYZ',
      },
    ]);
  };

  const calculateIntLayover = (start, end, length) => {
    setMeals((prev) => [
      ...prev,
      { index: prev.length, meals: calcMealsIntArrival(start), station: 'int' },
    ]);
    // Adjust for full days on layover
    for (let i = 1; i <= calcLayoverDays(start, end, length); i++) {
      setMeals((prev) => [
        ...prev,
        { index: prev.length, meals: 'BLDS', station: 'int' },
      ]);
    }
    setMeals((prev) => [
      ...prev,
      { index: prev.length, meals: calcMealsIntDept(end), station: 'int' },
    ]);
  };

  const calculateDisplayTotal = () => {
    let dispTotal = 0;
    for (let i = 0; i < meals.length; i++) {
      if (meals[i].station === 'YYZ') {
        dispTotal +=
          (meals[i].meals.includes('B') && Number(caExpenses.breakfast)) +
          (meals[i].meals.includes('L') && Number(caExpenses.lunch)) +
          (meals[i].meals.includes('D') && Number(caExpenses.dinner)) +
          (meals[i].meals.includes('S') && Number(caExpenses.snack));
      } else if (meals[i].station === 'int') {
        dispTotal +=
          (meals[i].meals.includes('B') && Number(intlExpenses.breakfast)) +
          (meals[i].meals.includes('L') && Number(intlExpenses.lunch)) +
          (meals[i].meals.includes('D') && Number(intlExpenses.dinner)) +
          (meals[i].meals.includes('S') && Number(intlExpenses.snack));
      }
    }
    dispTotal += numLayovers * 5.05;
    setDisplayTotal(dispTotal.toFixed(2));
  };

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
              <tr key={item.index}>
                <td></td>
                <td>{item.meals.includes('B') && caExpenses.breakfast}</td>
                <td>{item.meals.includes('L') && caExpenses.lunch}</td>
                <td>{item.meals.includes('D') && caExpenses.dinner}</td>
                <td>{item.meals.includes('S') && caExpenses.snack}</td>
              </tr>
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
          <td colSpan={4}>${displayTotal}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default ExpensesTable;
