/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import Flight from './Flight';
import Layover from './Layover';

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
    pairingSequence,
  } = originalPairing;
  const sequence = pairingSequence;

  const [pairingState, setPairingState] = useState({});

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
  }, []);

  const updatePairingState = (item) => {
    setPairingState((prev) => ({
      ...prev,
      [item.index]: item,
    }));
  };

  return (
    <>
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
              pairingLanguages.map((item) => {
                return <p key={item}>{`${item}`}</p>;
              })}
          </div>
        </div>

        <table className="table mt-3">
          <tbody>
            {sequence &&
              sequence.map((item) => {
                if (item.aircraft) {
                  return (
                    <tr key={item.index} className="table-primary">
                      <td>
                        <Flight
                          key={item.index}
                          flight={item}
                          pairingState={pairingState}
                        />
                      </td>
                    </tr>
                  );
                } else if (item.hotelInfo) {
                  return (
                    <tr key={item.index} className="table-success">
                      <td>
                        <Layover
                          key={item.index}
                          layover={item}
                          pairingState={pairingState}
                        />
                      </td>
                    </tr>
                  );
                } else {
                  <p>Error</p>;
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
    </>
  );
}
export default Pairing;
