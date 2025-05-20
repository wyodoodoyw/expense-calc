import { useState, useEffect } from 'react';
import Flight from './Flight';
import Layover from './Layover';

function SearchPairingResult(props) {
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
  }, [originalPairing]);
  return (
    <>
      <div className="text-start font-monospace ms-3">
        <p>
          {pairingNumber} OPERATES/OPER- {pairingOperates}
        </p>
        <p>
          Crew: {pairingPurser && `P${pairingPurser}  `}
          {pairingFA && `FA${pairingFA}  `}
          {pairingGP && `GJ${pairingGP}  `}
          {pairingGY && `GY${pairingGY}`}
        </p>
        <p>
          Languages: {pairingBL && `BL${pairingBL}  `}
          {pairingLanguages &&
            pairingLanguages.map((item) => {
              return <p key={item}>{`${item}`}</p>;
            })}
        </p>
        <table className="table">
          <tbody>
            {sequence &&
              sequence.map((item) => {
                if (item.aircraft) {
                  return (
                    <tr key={item.index} className="table-primary">
                      <td>
                        <Flight key={item.index} flight={item} />
                      </td>
                    </tr>
                  );
                } else if (item.hotelInfo) {
                  return (
                    <tr key={item.index} className="table-success">
                      <td>
                        <Layover key={item.index} layover={item} />
                      </td>
                    </tr>
                  );
                } else {
                  <p>Error</p>;
                }
              })}
          </tbody>
        </table>

        <p className="mt-3">
          BLOCK/H-VOL {updatablePairing.blockCredit} Total Duty{' '}
          {updatablePairing.totalDuty} (INC - ${updatablePairing.cicoAmount}{' '}
          CICO) TOTAL ALLOWANCE - ${updatablePairing.totalAllowance}
        </p>
        <p>
          TAFB/PTEB {updatablePairing.tafb} TOTAL -{' '}
          {updatablePairing.totalCredit}
        </p>
      </div>
      {/* <form className="row col-11 align-center mx-3 g-3">
        <div className="col-md-4">
          <label htmlFor="validationDefault01" className="form-label">
            First name
          </label>
          <input
            type="text"
            className="form-control"
            id="validationDefault01"
            value="Mark"
            required
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefault02" className="form-label">
            Last name
          </label>
          <input
            type="text"
            className="form-control"
            id="validationDefault02"
            value="Otto"
            required
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="validationDefaultUsername" className="form-label">
            Username
          </label>
          <div className="input-group">
            <span className="input-group-text" id="inputGroupPrepend2">
              @
            </span>
            <input
              type="text"
              className="form-control"
              id="validationDefaultUsername"
              aria-describedby="inputGroupPrepend2"
              required
            />
          </div>
        </div>
        <div className="col-md-6">
          <label htmlFor="validationDefault03" className="form-label">
            City
          </label>
          <input
            type="text"
            className="form-control"
            id="validationDefault03"
            required
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="validationDefault04" className="form-label">
            State
          </label>
          <select className="form-select" id="validationDefault04" required>
            <option selected disabled value="">
              Choose...
            </option>
            <option>...</option>
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="validationDefault05" className="form-label">
            Zip
          </label>
          <input
            type="text"
            className="form-control"
            id="validationDefault05"
            required
          />
        </div>
        <div className="col-12">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="invalidCheck2"
              required
            /> 
            
          </div>
        </div>
      </form>*/}
    </>
  );
}
export default SearchPairingResult;
