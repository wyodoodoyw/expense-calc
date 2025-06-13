/* eslint-disable react/prop-types */
const ExpensesTable = (props) => {
  const { station, meals, expenses, isLayover, fullDays } = props;
  // const { mB, mL, mD, mS } = meals;
  // const { eB, eL, eD, eS } = expenses;

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

  const calculateDisplayTotal = () => {
    return (
      calculateDisplayBreakfastTotal() +
      calculateDisplayLunchTotal() +
      calculateDisplayDinnerTotal() +
      calculateDisplaySnackTotal() +
      5.05
    ).toFixed(2);
  };

  return (
    <table className="table table-striped table-bordered mt-3 text-center">
      <tbody>
        <tr>
          <th>{station}</th>
          <th>Breakfast</th>
          <th>Lunch</th>
          <th>Dinner</th>
          <th>Snack</th>
          {isLayover && <th>CI/CO</th>}
        </tr>
        <tr>
          <td></td>
          <td>{meals.breakfast}</td>
          <td>{meals.lunch}</td>
          <td>{meals.dinner}</td>
          <td>{meals.snack}</td>
          {isLayover && <td>1</td>}
        </tr>
        <tr>
          <td>x</td>
          <td>${expenses.breakfast}</td>
          <td>${expenses.lunch}</td>
          <td>${expenses.dinner}</td>
          <td>${expenses.snack}</td>
          {isLayover && <td className="align-middle">$5.05</td>}
        </tr>
        <tr>
          <td>=</td>
          <td>${calculateDisplayBreakfastTotal().toFixed(2)}</td>
          <td>${(meals.lunch * expenses.lunch).toFixed(2)}</td>
          <td>${(meals.dinner * expenses.dinner).toFixed(2)}</td>
          <td>${(meals.snack * expenses.snack).toFixed(2)}</td>
          {isLayover && <td>${5.05}</td>}
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
