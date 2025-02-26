/* eslint-disable react/prop-types */
function Flight(props) {
  return (
    <div className="card-body border">
      {props.index}. AC{props.flight_no} {props.dept_stn}-{props.arrival_stn}
      [🇨🇦🇺🇸] <br />
      Departure:
      <input type="time" name="dept-time" required value={props.dept_time} />
      Arrival:
      <input
        type="time"
        name="arrival-time"
        required
        value={props.arrival_time}
      />
    </div>
  );
}

export default Flight;
