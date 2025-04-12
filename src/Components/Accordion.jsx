import { useState } from 'react';
import Layover from './Layover';
import FileUploader from './FileUploader';

function Accordian(props) {
  const [selectedValue, setSelectedValue] = useState();

  // initial state ==> Canadian Expenses
  // const [expenseB, setExpenseB] = useState(17.95);
  // const [expenseL, setExpenseL] = useState(20.33);
  // const [expenseD, setExpenseD] = useState(40.27);
  // const [expenseS, setExpenseS] = useState(10.52);
  // const [expenseTotal, setExpenseTotal] = useState(89.07);

  const layover = {
    layover_stn: 'HND',
    layover_start: '15:55',
    layover_end: '17:40',
    layover_expenses: 'DSBLD',
    layover_cico: 1,
    layover_expenses_total: 127.89,
    layover_length: '24:45',
  };

  const location_exp = {
    breakfast: 29.91,
    lunch: 49.96,
    dinner: 57.26,
    snack: 20.36,
    day: 157.49,
  };

  return (
    <div className="accordion" id="accordian">
      {/* Panel #1 */}

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
            <FileUploader />
          </div>
        </div>
      </div>

      {/* Panel #2 */}

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
          <div className="accordion-body text-start">
            <form>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="flexRadioDefault"
                  id="radio1"
                  value="value1"
                  onChange={(e) => setSelectedValue(e.target.value)}
                  disabled
                />
                <label className="form-check-label" htmlFor="radio1">
                  <strong>A North America/Sun flight.</strong>
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
                  checked
                />
                <label className="form-check-label" htmlFor="radio2">
                  <strong>A layover at an international destination.</strong>
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
                  disabled
                />
                <label className="form-check-label" htmlFor="radio3">
                  <strong>
                    A domestic flight and layover before or after an
                    international flight.
                  </strong>
                  Example: a layover in YUL before going to NRT.
                </label>
              </div>
              {selectedValue && <p>{selectedValue}</p>}
            </form>
          </div>
        </div>
      </div>

      {/* Panel #3 */}

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
              Input the expense amounts for the destination you&aposd like to
              calculate.
            </strong>
          </button>
        </h2>
        <div
          id="collapseThree"
          className="accordion-collapse collapse"
          data-bs-parent="#accordian"
        >
          <Layover layover={layover} location_exp={location_exp} />
        </div>
        {/* <div
          id="collapseThree"
          className="accordion-collapse collapse"
          data-bs-parent="#accordian"
        >
          <div className="accordion-body">
            <form>
              <div className="form-group row col-2 mx-auto">
                <label
                  htmlFor="inputDestination"
                  className="col-sm-2 col-form-label"
                >
                  Destination
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    className="form-control  text-center"
                    id="inputDestination"
                    placeholder="YYZ"
                  />
                </div>
              </div>
              <div className="form-group row col-6 mx-auto">
                <div className="form-group col-6">
                  <label
                    htmlFor="inputBreakfast"
                    className="col-sm-2 col-form-label"
                  >
                    Breakfast
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control  text-center"
                      id="inputBreakfast"
                      placeholder="17.95"
                      value={props.expenseB}
                      onChange={(val) => props.setExpenseB(val)}
                    />
                  </div>
                </div>
                <div className="form-group col-6">
                  <label
                    htmlFor="inputLunch"
                    className="col-sm-2 col-form-label"
                  >
                    Lunch
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control  text-center"
                      id="inputLunch"
                      placeholder="20.33"
                      value={expenseL}
                      onChange={(val) => setExpenseL(val)}
                    />
                  </div>
                </div>
                <div className="form-group col-6">
                  <label
                    htmlFor="inputDinner"
                    className="col-sm-2 col-form-label"
                  >
                    Dinner
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control text-center"
                      id="inputDinnet"
                      placeholder="40.27"
                      value={expenseD}
                      onChange={(val) => setExpenseD(val)}
                    />
                  </div>
                </div>
                <div className="form-group col-6">
                  <label
                    htmlFor="inputSnack"
                    className="col-sm-2 col-form-label"
                  >
                    Snack
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control  text-center"
                      id="inputSnack"
                      placeholder="10.52"
                      value={expenseS}
                      onChange={(val) => setExpenseS(val)}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group mx-auto mt-3">
                <div className="form-group row mx-auto">
                  <label
                    htmlFor="inputTotal"
                    className="col-sm-2 col-form-label"
                  >
                    Total
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control  text-center"
                      id="inputTotal"
                      placeholder="89.07"
                      // value={Number(expenseB + expenseL + expenseD + expenseS)}
                      disabled
                      // onChange={(val) => setExpenseTotal(val)}
                    />
                  </div>
                </div>
              </div>
            </form> 
          </div>
        </div>*/}
      </div>
    </div>
  );
}

export default Accordian;
