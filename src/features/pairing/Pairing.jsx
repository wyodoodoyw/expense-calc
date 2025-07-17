/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Flight from '../flight/Flight';
import Layover from '../../Components/Layover';
import ExpensesTable from '../expensesTable/ExpensesTable';

function Pairing() {
  const p = useSelector((state) => state.pairing);
  const sequence = p.sequence;
  const firstFlight = sequence[0];
  const [allMeals, setAllMeals] = useState({});

  useEffect(() => {
    const meals = p.calculatedMeals;
    setAllMeals({
      breakfast: (meals.match(/B/g) || []).length,
      lunch: (meals.match(/L/g) || []).length,
      dinner: (meals.match(/D/g) || []).length,
      snack: (meals.match(/S/g) || []).length,
    });
  }, []);

  return (
    <div className="text-start font-monospace">
      <div className="row mt-4">
        <div className="col-6 ps-5">
          {p.pairingNumber} OPERATES/OPER- {p.pairingOperates}
        </div>
        <div className="col-6 text-end pe-5">
          {/* Dates: {JSON.stringify(p.pairingDates)} */}
        </div>
      </div>
      <div className="row">
        <div className="col-6 ps-5">
          Crew: {p.pairingPurser && `P${p.pairingPurser}  `}
          {p.pairingFA && `FA${p.pairingFA}  `}
          {p.pairingGP && `GJ${p.pairingGP}  `}
          {p.pairingGY && `GY${p.pairingGY}`}
        </div>
        <div className="col-6 text-end pe-5">
          Languages: {p.pairingBL && `BL${p.pairingBL}  `}
          {p.pairingLanguages &&
            p.pairingLanguages.map((lang) => {
              return `${lang}`;
            })}
        </div>
      </div>

      <div className="row mt-3 ms-3">
        {sequence &&
          sequence.map((current, index) => {
            if (!current.hotelInfo) {
              // duty day of flights
              <p key={index}>{JSON.stringify(current)}</p>;
              return <Flight key={index} index={index} />;
            } else if (current.hotelInfo) {
              // layover
              return (
                <div className="row" key={index}>
                  <Layover key={index} index={index} />
                </div>
              );
            }
          })}
      </div>
      <div className="row ms-3">
        <div className="col-3">BLOCK/H-VOL {p.blockCredit}</div>
        <div className="col-3">Total Duty {p.totalDuty}</div>
        <div className="col-3">(INC - ${p.cicoAmount} CICO)</div>
        <div className="col-3">TOTAL ALLOWANCE - ${p.totalAllowance}</div>
      </div>
      <div className="row ms-3">
        <div className="col-3">TAFB/PTEB {p.tafb}</div>
        <div className="col-3">TOTAL - {p.totalCredit}</div>
      </div>
      {!p.pairingNumber.includes('T5') && (
        <ExpensesTable station={firstFlight.departureAirport} />
      )}

      <p className="me-3 small text-end">
        * The prices above represent the US amounts minus the Canadian amounts.
      </p>
      {/* <TotalTable /> */}
    </div>
  );
}
export default Pairing;
