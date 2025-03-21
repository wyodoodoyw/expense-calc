import FileUploader from './FileUploader';

function Accordian(props) {
  return (
    <div className="accordion" id="accordian">
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseOne"
            aria-expanded="true"
            aria-controls="collapseOne"
          >
            <strong>Upload the expenses file for the block month.</strong>
            <span className="ms-2">ex. 202410-MealAllowances.pdf</span>
          </button>
        </h2>
        <div
          id="collapseOne"
          className="accordion-collapse collapse show"
          data-bs-parent="#accordian"
        >
          <div className="accordion-body">
            {/* <div className="input-group mb-3">
              <input type="file" className="form-control" id="fileInput" />
              <label className="input-group-text" htmlFor="fileInput">
                Upload
              </label>
              <div className="invalid-feedback">
                Please make sure your are uploading the correct file.
              </div>
            </div> */}
            <FileUploader />
          </div>
        </div>
      </div>
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseTwo"
            aria-expanded="false"
            aria-controls="collapseTwo"
          >
            <strong>What would you like to calculate the expenses for?</strong>
          </button>
        </h2>
        <div
          id="collapseTwo"
          className="accordion-collapse collapse"
          data-bs-parent="#accordian"
        >
          <div className="input-group mb-3">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Select
            </button>
            <ul className="dropdown-menu">
              <li>
                <a className="dropdown-item" href="#">
                  A NA Sun Flight
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  A layover at an international destination
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  A domestic flight and layover before or after an international
                  flight. Ex. a layover in YUL before going to NRT.
                </a>
              </li>
            </ul>
          </div>

          {/* <div className="accordion-body">
            <form>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="flexRadioDefault"
                  id="radio1"
                />
                <label className="form-check-label" htmlFor="radio1">
                  A North America/Sun flight.
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="flexRadioDefault"
                  id="radio2"
                />
                <label className="form-check-label" htmlFor="radio2">
                  A layover at an international destination.
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="flexRadioDefault"
                  id="radio3"
                />
                <label className="form-check-label" htmlFor="radio3">
                  A domestic flight and layover before or after an international
                  flight. Ex. a layover in YUL before going to NRT.
                </label>
              </div>
            </form>
          </div>*/}
        </div>
      </div>
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseThree"
            aria-expanded="false"
            aria-controls="collapseThree"
          >
            <strong>
              Adjust the times below for an updated expense calculation.
            </strong>
          </button>
        </h2>
        <div
          id="collapseThree"
          className="accordion-collapse collapse"
          data-bs-parent="#accordian"
        >
          <div className="accordion-body">
            <strong>This is the third accordion body.</strong> It is hidden by
            default, until the collapse plugin adds the appropriate classes that
            we use to style each element. These classes control the overall
            appearance, as well as the showing and hiding via CSS transitions.
            You can modify any of this with custom CSS or overriding our default
            variables. also worth noting that just about any HTML can go within
            the <code>.accordion-body</code>, though the transition does limit
            overflow.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Accordian;
