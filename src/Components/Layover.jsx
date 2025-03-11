/* eslint-disable react/prop-types */
function Layover(props) {
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
                value={props.flight_no}
              />
            </div>
          </div>
          <div className="row form-group input-group">
            <label htmlFor="flight_no" className="form-no">
              Start Time:
            </label>
            <input
              type="time"
              className="form-control"
              placeholder="AAA"
              value="11:00"
            />

            <label htmlFor="flight_no" className="form-no">
              End Time:
            </label>

            <input
              type="time"
              className="form-control"
              placeholder="YYY"
              value="12:18"
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
            <th>Total:</th>
            <th colSpan={4}>$$$$$</th>
          </tfoot>
        </table>
      </div>
    </>
  );
}

export default Layover;
