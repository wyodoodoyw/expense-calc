import { useState } from 'react';

function RadioButtons() {
  const [selectedValue, setSelectedValue] = useState();

  const handleSubmit = (e) => {
    console.log(selectedValue);
    e.preventDefault();
  };

  return (
    <>
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="flexRadioDefault"
            id="radio1"
            value="value1"
            onChange={(e) => setSelectedValue(e.target.value)}
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
            value="value2"
            onChange={(e) => setSelectedValue(e.target.value)}
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
            value="value3"
            onChange={(e) => setSelectedValue(e.target.value)}
          />
          <label className="form-check-label" htmlFor="radio3">
            A domestic flight and layover before or after an international
            flight. Ex. a layover in YUL before going to NRT.
          </label>
        </div>
        <button>Submit</button>
      </form>
    </>
  );
}

export default RadioButtons;
