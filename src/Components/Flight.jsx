/* eslint-disable react/prop-types */
function Flight(props) {
  let flight = props.flight;

  const handleTimeChange = (e) => {
    if (e.target.id === 'dept_time') {
      flight.dept_time = e.target.value;
      flight.arrival_time = document.getElementById('arrival_time').value;
    } else if (e.target.id === 'arrival_time') {
      flight.arrival_time = e.target.value;
      flight.dept_time = document.getElementById('dept_time').value;
    }

    console.log(`!${flight.dept_time}, ${flight.arrival_time}`);
  };

  return (
    <>
      <div className="mx-auto col-8 justify-content-center my-5 border border-2 border-dark rounded-3 m-1 p-3">
        <form>
          <div className="mb-3">
            <label htmlFor="flight_no" className="form-no">
              Flight Number / Numéro du vol:
            </label>
            <div className="input-group mb-3" id="flight_info">
              <span className="input-group-text">AC</span>
              <input
                id="flight_no"
                type="text"
                className="col-11 form-control"
                placeholder="0000"
                value={props.flight_no}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="flight_no" className="form-no">
              Departure Station:
            </label>
            <div className="input-group">
              <span className="input-group-text">🛫</span>
              <input
                type="text"
                className="form-control"
                placeholder="AAA"
                value={props.dept_stn}
              />
              <div className="form-group timepicker">
                <input
                  type="time"
                  id="dept_time"
                  className="form-control"
                  placeholder={props.dept_time}
                  // value=
                  onChange={handleTimeChange}
                />
              </div>
            </div>
          </div>
          <div className="text-center">↓</div>
          <div className="form-group">
            <label htmlFor="flight_no" className="form-no">
              Arrival Station:
            </label>
            <div className="input-group">
              <span className="input-group-text">🛬</span>
              <input
                type="text"
                className="form-control"
                placeholder="YYY"
                value={props.arrival_stn}
              />
              <div className="form-group">
                <input
                  id="arrival_time"
                  type="time"
                  className="form-control"
                  placeholder={props.arrival_time}
                  // value=
                  onChange={handleTimeChange}
                />
              </div>
            </div>
          </div>
        </form>
        <table className="table table-striped table-bordered mt-3 text-center">
          <tbody>
            <tr>
              <th>Breakfast</th>
              <th>Lunch</th>
              <th>Dinner</th>
              <th>Snack</th>
            </tr>
            <tr>
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
            </tr>
            <tr>
              <td>$29.91</td>
              <td>$49.96</td>
              <td>$57.26</td>
              <td>$20.36</td>
            </tr>
          </tbody>
          <tfoot className="table-success">
            <td>Total:</td>
            <td colSpan={3}>$$$$$</td>
          </tfoot>
        </table>
      </div>
    </>
  );
}
export default Flight;
