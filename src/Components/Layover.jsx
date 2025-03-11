/* eslint-disable react/prop-types */
import expenses from '../api/expenses';

function Layover(props) {
  let layover = props.layover;
  let new_layover = props.layover;
  let location_expenses = expenses.expenses; // { breakfast: 29.91, lunch: 49.96, dinner: 57.26, snack: 20.36, day: 157.49 }

  const calculateDays = (layover_length) => {
    const days = layover_length.split(':')[0] / 24;
    return Math.floor(days);
  };

  const calculateFirstDayExpenses = () => {
    console.log(`!${layover.layover_start}`);
    if (layover.layover_start < '12:30') {
      // B L D S
      return 'BLDS';
    } else if (
      layover.layover_start >= '12:30' &&
      layover.layover_start < '13:30'
    ) {
      // L D S
      return 'LDS';
    } else if (layover.layover_start >= '13:30') {
      // D S
      return 'DS';
    } else {
      // error
      console.log('!error');
    }
  };

  const calculateLastDayExpenses = () => {
    if (layover.layover_end >= '7:00' && layover.layover_end < '12:00') {
      // B
      return 'B';
    } else if (
      layover.layover_end >= '11:30' &&
      layover.layover_end < '17:00'
    ) {
      // B L
      return 'BL';
    } else if (
      layover.layover_end >= '17:00' &&
      layover.layover_end < '22:00'
    ) {
      // B L D
      return 'BLD';
    } else if (layover.layover_end >= '22:00' && layover.layover_end < '1:00') {
      // B L D S
      return 'BLDS';
    } else {
      //error, or no further allowance
    }
  };

  const calculateNewExpenses = () => {
    new_layover.layover_expenses = '';
    new_layover.layover_expenses += calculateFirstDayExpenses();
    new_layover.layover_expenses += calculateLastDayExpenses();
    console.log(`!${new_layover.layover_expenses}`);
  };

  const handleTimeChange = () => {
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

  const calculateNumBreakfasts = () => {
    return (new_layover.layover_expenses.match(/B/g) || []).length;
  };

  const calculateNumLunches = () => {
    return (new_layover.layover_expenses.match(/L/g) || []).length;
  };

  const calculateNumDinners = () => {
    return (new_layover.layover_expenses.match(/D/g) || []).length;
  };

  const calculateNumSnacks = () => {
    return (new_layover.layover_expenses.match(/S/g) || []).length;
  };

  const calculateDisplayBreakfastTotal = () => {
    return calculateNumBreakfasts() * location_expenses.breakfast;
  };

  const calculateDisplayLunchTotal = () => {
    return calculateNumLunches() * location_expenses.lunch;
  };

  const calculateDisplayDinnerTotal = () => {
    return calculateNumDinners() * location_expenses.dinner;
  };

  const calculateDisplaySnackTotal = () => {
    return calculateNumSnacks() * location_expenses.snack;
  };

  const calculateDisplayTotal = () => {
    return (
      calculateDisplayBreakfastTotal() +
      calculateDisplayLunchTotal() +
      calculateDisplayDinnerTotal() +
      calculateDisplaySnackTotal() +
      new_layover.layover_cico * 5.05
    );
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
                value={new_layover.layover_stn}
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
              defaultValue={layover.layover_start}
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
              defaultValue={layover.layover_end}
              onChange={handleTimeChange}
            />
          </div>
        </form>
        <table className="table table-striped table-bordered mt-3 text-center">
          <tbody>
            <tr>
              <th>Breakfast</th>
              <th>Lunch</th>
              <th>Dinner</th>
              <th>Snack</th>
              <th>CI/CO</th>
            </tr>
            <tr>
              <td>{calculateNumBreakfasts()}</td>
              <td>{calculateNumLunches()}</td>
              <td>{calculateNumDinners()}</td>
              <td>{calculateNumSnacks()}</td>
              <td>{new_layover.layover_cico}</td>
            </tr>
            <tr>
              <td>${location_expenses.breakfast}</td>
              <td>${location_expenses.lunch}</td>
              <td>${location_expenses.dinner}</td>
              <td>${location_expenses.snack}</td>
              <td>$5.05</td>
            </tr>
            <tr>
              <td>${calculateDisplayBreakfastTotal()}</td>
              <td>${calculateDisplayLunchTotal()}</td>
              <td>${calculateDisplayDinnerTotal()}</td>
              <td>${calculateDisplaySnackTotal()}</td>
              <td>${new_layover.layover_cico * 5.05}</td>
            </tr>
            <tr className="table-success">
              <td>Total:</td>
              <td colSpan={4}>${calculateDisplayTotal()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Layover;
