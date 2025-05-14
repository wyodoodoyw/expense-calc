import { useState } from 'react';
import Domestic from './Domestic';
import Layover from './Layover';
import DomesticToInternational from './DomesticToInternational';
import InternationalToDomestic from './InternationalToDomestic';
// import FileUploader from './FileUploader';
import PairingFileUploader from './PairingFileUploader';

function Accordian() {
  const [selectedValue, setSelectedValue] = useState();
  const [uploaded, setUploaded] = useState(false);

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
          className={'accordion-collapse ' + (uploaded ? 'collapse' : 'show')}
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
            {/* <FileUploader setUploaded={setUploaded} /> */}
            <PairingFileUploader />
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
          className={'accordion-collapse ' + (uploaded ? 'show' : 'collapse')}
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
                  value="naSun"
                  onChange={(e) => setSelectedValue(e.target.value)}
                />
                <label className="form-check-label" htmlFor="radio1">
                  <strong>
                    A domestic, transborder, or sun pairing. Please see * below.
                  </strong>
                  <p className="mb-0">
                    Sun Destinations: Cuba, Jamaica, Mexico, BDA, GCM, GGT, LIR,
                    NAS, SJO
                  </p>
                </label>
              </div>
              {/* <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="flexRadioDefault"
                  id="radio2"
                  value="transborder"
                  onChange={(e) => setSelectedValue(e.target.value)}
                />
                <label className="form-check-label" htmlFor="radio3">
                  <strong>A transborder turn.</strong>
                </label>
              </div> */}
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="flexRadioDefault"
                  id="radio3"
                  value="intl"
                  onChange={(e) => setSelectedValue(e.target.value)}
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
                  value="domToIntl"
                  onChange={(e) => setSelectedValue(e.target.value)}
                />
                <label className="form-check-label" htmlFor="radio3">
                  <strong>
                    A domestic flight and layover <strong>before</strong> an
                    international flight.
                  </strong>
                  <p className="mb-0">
                    Example: a layover in YUL before going to NRT.
                  </p>
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="flexRadioDefault"
                  id="radio4"
                  value="intlToDom"
                  onChange={(e) => setSelectedValue(e.target.value)}
                />
                <label className="form-check-label" htmlFor="radio3">
                  <strong>
                    A domestic flight and layover <strong>after</strong> an
                    international flight.
                  </strong>
                  <p className="mb-0">
                    Example: a layover in YUL after going to NRT.
                  </p>
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
      {uploaded && selectedValue === 'naSun' && <Domestic />}
      {uploaded && selectedValue === 'intl' && <Layover />}
      {uploaded && selectedValue === 'domToIntl' && <DomesticToInternational />}
      {uploaded && selectedValue === 'intlToDom' && <InternationalToDomestic />}
    </div>
  );
}

export default Accordian;
