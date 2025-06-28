/* eslint-disable react/prop-types */
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  updateCaTotal,
  updateUsTotal,
} from '../features/expenseTable/expenseTableSlice';

const ExpensesTable = (props) => {
  const { station, meals, numLayovers } = props;
  const isLayover = numLayovers > 0;

  const [expenses, setExpenses] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    getExpenseAmounts(station);
  }, []);

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
          setExpenses({
            breakfast: ca.breakfast,
            lunch: ca.lunch,
            dinner: ca.dinner,
            snack: ca.snack,
          });
        }
        if (american_airport_codes.includes(station)) {
          const request2 = airportCodesIndex.get(station);
          request2.onsuccess = () => {
            const e = request2.result.expenses;
            setExpenses({
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

  const calculateDisplayBreakfastTotal = () => {
    return meals.breakfast * expenses.breakfast;
  };

  const calculateDisplayLunchTotal = () => {
    return meals.lunch * expenses.lunch;
  };

  const calculateDisplayDinnerTotal = () => {
    return meals.dinner * expenses.dinner;
  };

  const calculateDisplaySnackTotal = () => {
    return meals.snack * expenses.snack;
  };

  const calculateDisplayCicoTotal = () => {
    return numLayovers * 5.05;
  };

  const calculateDisplayTotal = () => {
    const total = (
      calculateDisplayBreakfastTotal() +
      calculateDisplayLunchTotal() +
      calculateDisplayDinnerTotal() +
      calculateDisplaySnackTotal() +
      calculateDisplayCicoTotal()
    ).toFixed(2);
    if (canadian_airport_codes.includes(station)) {
      dispatch(updateCaTotal(total));
    }
    if (american_airport_codes.includes(station)) {
      dispatch(updateUsTotal(total));
    }
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
          <td>{meals.breakfast}</td>
          <td>{meals.lunch}</td>
          <td>{meals.dinner}</td>
          <td>{meals.snack}</td>
          {isLayover && <td>{numLayovers}</td>}
          {!isLayover && <td>-</td>}
        </tr>
        <tr>
          <td>x</td>
          <td>${expenses.breakfast}</td>
          <td>${expenses.lunch}</td>
          <td>${expenses.dinner}</td>
          <td>${expenses.snack}</td>
          <td className="align-middle">$5.05</td>
        </tr>
        <tr>
          <td>=</td>
          <td>${calculateDisplayBreakfastTotal().toFixed(2)}</td>
          <td>${(meals.lunch * expenses.lunch).toFixed(2)}</td>
          <td>${(meals.dinner * expenses.dinner).toFixed(2)}</td>
          <td>${(meals.snack * expenses.snack).toFixed(2)}</td>
          {isLayover && <td>${(numLayovers * 5.05).toFixed(2)}</td>}
          {!isLayover && <td>-</td>}
        </tr>
        <tr className="table-primary">
          <td>Total:</td>
          <td colSpan={5}>${calculateDisplayTotal()}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default ExpensesTable;
