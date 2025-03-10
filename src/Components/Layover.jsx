/* eslint-disable react/prop-types */
function Layover(props) {
  return (
    <>
      <form className="border border-2 border-dark rounded-3 m-1 p-3">
        <div className="row">
          {/* <div className="col-1 fs-2">{props.index}</div> */}
          <div className="form-group">
            <div className="">
              <div className="input-group mb-3">
                <span className="input-group-text">Layover in: </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="0000"
                  value={props.layover_stn}
                />
              </div>
              <div className="form-group">
                <input
                  type="time"
                  className="form-control"
                  placeholder="AAA"
                  value="11:00"
                />
                <span> to </span>
                <input
                  type="time"
                  className="form-control"
                  placeholder="YYY"
                  value="12:18"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* <div className="card bg-primary-subtle text-start border">
      <div className="card-body">
        <div className="card-title ">
          {props.index}. Layover in {props.layover_stn} <br />
        </div>
        <div className="card-text">
          <div>
            Start:
            <input type="time" name="dept-time" required value="11:00" />
          </div>
          <div>
            End:
            <input type="time" name="arrival-time" required value="12:18" />
          </div>
          <div className="grid gap-3">
            <div className="p-2 g-col-3">D: $57.26</div>
            <div className="p-2 g-col-3">S: $20.36</div>
            <div className="p-2 g-col-3">B: $29.91</div>
            <div className="p-2 g-col-3">L: $49.96</div>
            <div className="p-2 g-col-3">D: $57.26</div>
          </div>
          <p>{props.layover_expenses}</p>
        </div>
      </div>
    </div> */}
    </>
  );
}

export default Layover;
