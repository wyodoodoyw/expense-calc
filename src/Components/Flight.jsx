/* eslint-disable react/prop-types */
function Flight(props) {
  return (
    <>
      <div className="mx-auto col-8 justify-content-center my-5 border border-2 border-dark rounded-3 m-1 p-3">
        <form>
          <div className="mb-3">
            <span className="input-group-text">AC</span>
            <input
              id="flight_no"
              type="text"
              className="form-control"
              placeholder="0000"
              value={props.flight_no}
            />
          </div>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-text">🛫</span>
              <input
                type="text"
                className="form-control"
                placeholder="AAA"
                value={props.dept_stn}
              />
              <div className="form-group">
                <input
                  type="time"
                  className="form-control"
                  placeholder="AAA"
                  value="11:00"
                />
              </div>
            </div>
          </div>
          <span> ↓ </span>
          <div className="input-group">
            <span className="input-group-text">🛬</span>
            <input
              type="text"
              className="form-control"
              placeholder="YYY"
              value={props.arrival_stn}
            />
            <input
              type="time"
              className="form-control p-1"
              placeholder="YYY"
              value="12:18"
            />
          </div>
        </form>
      </div>
    </>
  );
}
export default Flight;
