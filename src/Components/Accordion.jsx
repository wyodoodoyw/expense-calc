/* eslint-disable react/prop-types */
// import { useState, useEffect } from 'react';
import ExpenseFileUploader from './ExpenseFileUploader';
import PairingFileUploader from './PairingFileUploader';
import SearchPairings from './SearchPairings';

function Accordian(props) {
  const {
    expensesUploaded,
    setExpensesUploaded,
    pairingsUploaded,
    setPairingsUploaded,
  } = props;
  // const [selectedValue, setSelectedValue] = useState();

  return (
    <div className="accordion" id="accordian">
      {/* UPLOAD PANEL */}
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
            <h2>Step 1: </h2>
            <strong className="ms-3">
              Upload the <u>pairing</u> file for the block month.
            </strong>
            <span className="ms-2">ex. 202505-YYZ-PairingFile</span>
          </button>
        </h2>
        <div
          id="collapseOne"
          className={
            'accordion-collapse ' + (pairingsUploaded ? 'collapse' : 'show')
          }
          data-bs-parent="#accordian"
        >
          <div className="accordion-body">
            <p className="text-start">
              Example: For May 2025, go to the following:
            </p>
            <p className="text-start">
              ACAeronet → Crew Scheduling & Planning → Block Bid Packages →
              2025-05 May → Base: YYZ → 202505-YYZ-PairingFile
            </p>
            {/* <FileUploader setUploaded={setUploaded} /> */}
            <PairingFileUploader setPairingsUploaded={setPairingsUploaded} />
          </div>
        </div>
      </div>

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
            <h2>Step 2: </h2>
            <strong className="ms-3">
              Upload the <u>expenses</u> file for the block month.
            </strong>
            <span className="ms-2">ex. 202505-MealAllowances</span>
          </button>
        </h2>
        <div
          id="collapseOne"
          className={
            'accordion-collapse ' + (expensesUploaded ? 'collapse' : 'show')
          }
          data-bs-parent="#accordian"
        >
          <div className="accordion-body">
            <p className="text-start">
              Example: For May 2025, go to the following:
            </p>
            <p className="text-start">
              ACAeronet → Crew Scheduling & Planning → Block Bid Packages →
              2025-05 May → ALL → 202505-MealAllowances
            </p>
            <ExpenseFileUploader setExpensesUploaded={setExpensesUploaded} />
          </div>
        </div>
      </div>

      {/* SEARCH PANEL */}
      <SearchPairings
        pairingsUploaded={pairingsUploaded}
        expensesUploaded={expensesUploaded}
      />
    </div>
  );
}

export default Accordian;
