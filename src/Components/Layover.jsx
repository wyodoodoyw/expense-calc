/* eslint-disable react/prop-types */
import expenses from '../api/expense';
function Layover(props) {
  let layover = props.layover;
  let layover_expenses = props.layover_expenses; //{ breakfast: 1, lunch: 1, dinner: 2, snack: 1, cico: 1}
  let layover_expenses_total = props.layover_expenses_total; //$127.89
  let layover_length = props.layover_length; // 24:45
  let location_expenses = expenses.expenses; // { breakfast: 29.91, lunch: 49.96, dinner: 57.26, snack: 20.36, day: 157.49 }

  const calculateDays = (layover_length) => {
    const days = layover_length.split(':')[0] / 24;
    return Math.floor(days);
  };

  const calculateFirstExpenses = () => {
    if (layover.layover_start < '12:30') {
      // B L D S
      return { breakfast: 1, lunch: 1, dinner: 1, snack: 1 };
    } else if (
      layover.layover_start >= '12:30' &&
      layover.layover_start < '13:30'
    ) {
      // L D S
      return { breakfast: 0, lunch: 1, dinner: 1, snack: 1 };
    } else if (layover.layover_start >= '13:30') {
      // D S
      return { breakfast: 0, lunch: 0, dinner: 1, snack: 1 };
    } else {
      // error
      console.log('!error');
    }
  };

  const calculateLastExpenses = () => {
    if (layover.layover_end >= '7:00' && layover.layover_end < '12:00') {
      // B
      return { breakfast: 1, lunch: 0, dinner: 0, snack: 0 };
    } else if (
      layover.layover_end >= '11:30' &&
      layover.layover_end < '17:00'
    ) {
      // B L
      return { breakfast: 1, lunch: 1, dinner: 0, snack: 0 };
    } else if (
      layover.layover_end >= '17:00' &&
      layover.layover_end < '22:00'
    ) {
      // B L D
      return { breakfast: 1, lunch: 1, dinner: 1, snack: 0 };
    } else if (layover.layover_end >= '22:00' && layover.layover_end < '1:00') {
      // B L D S
      return { breakfast: 1, lunch: 1, dinner: 1, snack: 1 };
    } else {
      //error, or no further allowance
    }
  };

  let new_expenses = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
    cico: 0,
  };

  const calculateNewExpenses = () => {
    const new_expensesDayOne = calculateFirstExpenses();
    const new_expensesDayLast = calculateLastExpenses();

    new_expenses.breakfast =
      new_expensesDayOne.breakfast + new_expensesDayLast.breakfast;
    new_expenses.lunch = new_expensesDayOne.lunch + new_expensesDayLast.lunch;
    new_expenses.dinner =
      new_expensesDayOne.dinner + new_expensesDayLast.dinner;
    new_expenses.snack = new_expensesDayOne.snack + new_expensesDayLast.snack;

    for (const [key, value] of Object.entries(new_expenses)) {
      console.log(key, value);
    }
    // for (const [key, value] of Object.entries(new_expensesDayLast)) {
    //   console.log(key, value);
    // }
  };
  const handleTimeChange = (e) => {
    calculateNewExpenses();
    // if (e.target.id === 'layover_end') {
    //   //const old_layover_end = layover.layover_end;
    //   layover.layover_end = e.target.value;
    //   layover.layover_start = document.getElementById('layover_start').value;
    // } else if (e.target.id === 'layover_start') {
    //   //const old_layover_start = layover.layover_start;
    //   layover.layover_start = e.target.value;
    //   layover.layover_end = document.getElementById('layover_end').value;
    // }
  };

  return (
    <>
      <div className="mx-auto col-8 justify-content-center my-5 border border-2 border-dark rounded-3 m-1 p-3">
        <form>
          <div className="mb-3">
            <div className="input-group mb-3" id="flight_info">
              <span className="input-group-text">Layover in: </span>
              <input
                id="flight_no"
                type="text"
                className="col-11 form-control"
                placeholder="YUL"
                value={props.layover_stn}
              />
            </div>
          </div>
          <div className="row form-group input-group">
            <label htmlFor="layover_start_time" className="form-no">
              Start Time:
            </label>
            <input
              id="layover_start"
              type="time"
              className="form-control"
              placeholder="11:00"
              value={layover.layover_start}
              onChange={handleTimeChange}
            />

            <label htmlFor="layover_end_time" className="form-no">
              End Time:
            </label>

            <input
              id="layover_end"
              type="time"
              className="form-control"
              placeholder="12:18"
              value={layover.layover_end}
              onChange={handleTimeChange}
            />
          </div>
        </form>
        <table className="table table-striped table-bordered mt-3 text-center">
          <tr>
            <th>Breakfast</th>
            <th>Lunch</th>
            <th>Dinner</th>
            <th>Snack</th>
            <th>CI/CO</th>
          </tr>
          <tr>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td className="colspan"></td>
          </tr>
          <tr>
            <td>$29.91</td>
            <td>$49.96</td>
            <td>$57.26</td>
            <td>$20.36</td>
            <td>$5.05</td>
          </tr>
          <tr>
            <td>$29.91</td>
            <td>$49.96</td>
            <td>$57.26</td>
            <td>$20.36</td>
            <td>$5.05</td>
          </tr>
          <tfoot className="table-success">
            <td>Total:</td>
            <td colSpan={4}>$$$$$</td>
          </tfoot>
        </table>
      </div>
    </>
  );
}

export default Layover;
