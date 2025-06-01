/* eslint-disable react/prop-types */
// import { useState, useEffect, useContext } from 'react';
// import { PairingProvider } from './PairingContext';
import Layover from './Layover';
import Flight from './Flight';
import DutyDay from './DutyDay';
import { useSelector } from 'react-redux';

function Pairing(props) {
  const { sequence } = props.pairing;
  // const {
  //   pairingNumber,
  //   pairingOperates,
  //   pairingPurser,
  //   pairingFA,
  //   pairingBL,
  //   pairingGP,
  //   pairingGY,
  //   pairingDates,
  //   pairingLanguages,
  //   blockCredit,
  //   cicoAmount,
  //   tafb,
  //   totalAllowance,
  //   totalCredit,
  //   totalDuty,
  //   sequence,
  // } = originalPairing;

  const p = useSelector((state) => state.pairing);
  // console.log(`p: ${JSON.stringify(p)}`);
  // const [updatablePairing, setUpdatablePairing] = useState({
  //   blockCredit,
  //   cicoAmount,
  //   tafb,
  //   totalAllowance,
  //   totalCredit,
  //   totalDuty,
  // });

  // useEffect(() => {
  //   setUpdatablePairing({
  //     blockCredit: blockCredit,
  //     cicoAmount: cicoAmount,
  //     tafb: tafb,
  //     totalAllowance: totalAllowance,
  //     totalCredit: totalCredit,
  //     totalDuty: totalDuty,
  //   });
  // }, []);

  // const updatePairingState = (current) => {
  //   setPairingState((prev) => ({
  //     ...prev,
  //     [current.index]: current,
  //   }));
  // };

  return (
    <div className="text-start font-monospace">
      <div className="row mt-4">
        <div className="col-6 ps-5">
          {p.pairingNumber} OPERATES/OPER- {p.pairingOperates}
        </div>
        <div className="col-6 text-end pe-5">
          Dates: {JSON.stringify(p.pairingDates)}
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
            p.pairingLanguages.map((current) => {
              return <p key={current}>{`${current}`}</p>;
            })}
        </div>
      </div>

      {/* <table className="table mt-3"> */}
      <div className="row mt-3 ms-3">
        {sequence &&
          sequence.map((current, index, arr) => {
            if (!current[0].hotelInfo) {
              // duty day of flights
              <p>{JSON.stringify(current)}</p>;
              return <DutyDay key={index} index={index} flights={current} />;
            } else if (current[0].hotelInfo) {
              // layover
              return (
                <div className="row" key={sequence.index}>
                  <p>{arr[index - 1][arr[index - 1].length - 1].dutyEnd}</p>
                  <Layover
                    key={current.index}
                    layover={current[0]}
                    prevDuty={
                      arr[index - 1][arr[index - 1].length - 1].dutyTimes
                    }
                    nextDuty={arr[index + 1][0].dutyStart}
                  />
                  <p>{arr[index + 1][0].dutyStart}</p>
                </div>
              );
            }
          })}
      </div>
      {/* </table> */}
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
      <p className="mt-3"></p>
      <p></p>
    </div>
  );
}
export default Pairing;
