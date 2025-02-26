/* eslint-disable react/prop-types */
function Layover(props) {
  return (
    <div className="row card-body border-top border-bottom">
      <div className="col-9">
        {props.index}. Layover in {props.layover_stn} <br />
        Start: <input type="time" name="dept-time" required value="11:00" />
        End: <input type="time" name="dept-time" required value="12:18" />
      </div>
      <div className="col-3 bg-light">
        <table>
          <tbody>
            <tr>
              <td>L</td>
              <td>$1.00</td>
            </tr>
            <tr>
              <td>D</td>
              <td>$1.00</td>
            </tr>
            <tr>
              <td>S</td>
              <td>$1.00</td>
            </tr>
            <tr>
              <td>B</td>
              <td>$1.00</td>
            </tr>
            <tr>
              <td>L</td>
              <td>$1.00</td>
            </tr>
          </tbody>
        </table>
        <p>{props.layover_expenses}</p>
      </div>
    </div>
  );
}

export default Layover;
