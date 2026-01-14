/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import Flight from '../flight/Flight';
import Layover from '../layover/Layover';
import ExpensesTable from '../expensesTable/ExpensesTable';
import getMealsFromSequence from '../../modules/getMealsFromSequence';

function IntPairing() {
  const p = useSelector((state) => state.pairing);
  const seq = p.sequence;

  // const [meals, setMeals] = useState([]);
  // const [station, setStation] = useState('');

  // useEffect(() => {
  //   const { meals: derivedMeals, station: intlStation } = getMealsFromSequence(
  //     seq || []
  //   );
  //   setMeals(derivedMeals);
  //   setStation(intlStation);
  // }, [seq]);

  return (
    <div className="text-start font-monospace">
      <div className="row mt-4">
        <div className="col-6 ps-5">
          {p.pairingNumber} OPERATES/OPER- {p.pairingOperates}
        </div>
        <div className="col-6 text-end pe-5"></div>
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
        {seq &&
          seq.map((current, index) => {
            if (!current.hotelInfo) {
              // flight
              <p key={index}>xx{JSON.stringify(current)}</p>;
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
      {/* <ExpensesTable meals={meals} station={station} /> */}
      <ExpensesTable />
    </div>
  );
}
export default IntPairing;
