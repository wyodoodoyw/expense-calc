/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from 'react';
import { PairingProvider } from './PairingContext';
import Layover from './Layover';
import Flight from './Flight';
import DutyDay from './DutyDay';

function Pairing(props) {
  const { originalPairing } = props;
  const {
    pairingNumber,
    pairingOperates,
    pairingPurser,
    pairingFA,
    pairingBL,
    pairingGP,
    pairingGY,
    pairingDates,
    pairingLanguages,
    blockCredit,
    cicoAmount,
    tafb,
    totalAllowance,
    totalCredit,
    totalDuty,
    sequence,
  } = originalPairing;

  const [updatablePairing, setUpdatablePairing] = useState({
    blockCredit,
    cicoAmount,
    tafb,
    totalAllowance,
    totalCredit,
    totalDuty,
  });

  useEffect(() => {
    setUpdatablePairing({
      blockCredit: blockCredit,
      cicoAmount: cicoAmount,
      tafb: tafb,
      totalAllowance: totalAllowance,
      totalCredit: totalCredit,
      totalDuty: totalDuty,
    });
    // sequenceRef.current = processPairingForDisplay(pairingSequence);
  }, []);

  // const updatePairingState = (current) => {
  //   setPairingState((prev) => ({
  //     ...prev,
  //     [current.index]: current,
  //   }));
  // };

  return (
    <PairingProvider>
      <div className="text-start font-monospace">
        <div className="row mt-4">
          <div className="col-6 ps-5">
            {pairingNumber} OPERATES/OPER- {pairingOperates}
          </div>
          <div className="col-6 text-end pe-5">
            Dates: {JSON.stringify(pairingDates)}
          </div>
        </div>
        <div className="row">
          <div className="col-6 ps-5">
            Crew: {pairingPurser && `P${pairingPurser}  `}
            {pairingFA && `FA${pairingFA}  `}
            {pairingGP && `GJ${pairingGP}  `}
            {pairingGY && `GY${pairingGY}`}
          </div>
          <div className="col-6 text-end pe-5">
            Languages: {pairingBL && `BL${pairingBL}  `}
            {pairingLanguages &&
              pairingLanguages.map((current) => {
                return <p key={current}>{`${current}`}</p>;
              })}
          </div>
        </div>

        <table className="table mt-3">
          <tbody>
            {sequence &&
              sequence.map((current, index, arr) => {
                if (!current[0].hotelInfo) {
                  // duty day of flights
                  <p>{JSON.stringify(current)}</p>;
                  return (
                    <DutyDay key={index} index={index} flights={current} />
                  );
                } else if (current[0].hotelInfo) {
                  // layover
                  return (
                    <tr key={index} className="table-primary">
                      <td>
                        <p>
                          {arr[index - 1][arr[index - 1].length - 1].dutyEnd}
                        </p>
                        <Layover
                          key={current.index}
                          layover={current[0]}
                          prevDuty={
                            arr[index - 1][arr[index - 1].length - 1].dutyTimes
                          }
                          nextDuty={arr[index + 1][0].dutyStart}
                        />
                        <p>{arr[index + 1][0].dutyStart}</p>
                      </td>
                    </tr>
                  );
                }
              })}
          </tbody>
        </table>
        <div className="row ms-3">
          <div className="col-3">
            BLOCK/H-VOL {updatablePairing.blockCredit}
          </div>
          <div className="col-3">Total Duty {updatablePairing.totalDuty}</div>
          <div className="col-3">
            (INC - ${updatablePairing.cicoAmount} CICO)
          </div>
          <div className="col-3">
            TOTAL ALLOWANCE - ${updatablePairing.totalAllowance}
          </div>
        </div>
        <div className="row ms-3">
          <div className="col-3">TAFB/PTEB {updatablePairing.tafb}</div>
          <div className="col-3">TOTAL - {updatablePairing.totalCredit}</div>
        </div>
        <p className="mt-3"></p>
        <p></p>
      </div>
    </PairingProvider>
  );
}
export default Pairing;
