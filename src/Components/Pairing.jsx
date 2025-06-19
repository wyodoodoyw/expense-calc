/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import ExpensesTable from './ExpensesTable';
import Flight from './Flight';
import Layover from './Layover';
import { useSelector } from 'react-redux';

function Pairing() {
  const p = useSelector((state) => state.pairing);
  const sequence = p.sequence;

  const [meals, setMeals] = useState({});
  const [expenses, setExpenses] = useState({});

  useEffect(() => {
    getExpenseAmounts('YYZ');

    setMeals({
      breakfast: 2,
      lunch: 2,
      dinner: 2,
      snack: 2,
    });
  }, []);

  const getExpenseAmounts = (station) => {
    const request = window.indexedDB.open('ExpensesDB', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction(['expenses'], 'readonly');
      const expensesStore = tx.objectStore('expenses');
      const airportCodesIndex = expensesStore.index('airport_codes');
      const request = airportCodesIndex.get(station);
      request.onsuccess = () => {
        setExpenses({
          breakfast: request.result.expenses.breakfast,
          lunch: request.result.expenses.lunch,
          dinner: request.result.expenses.dinner,
          snack: request.result.expenses.snack,
        });
      };
      request.onerror = (event) => {
        console.log(`!DB Error: ${event.target.error}`);
      };
      tx.oncomplete = () => {
        db.close();
      };
    };
  };

  const calculateFullDays = () => {
    let hours =
      Number(p.tafb.slice(0, -2)) +
      Number(sequence[0].departureTime[(0, 2)]) -
      Number(sequence[sequence.length - 1].arrivalTime[(0, 2)]) -
      23;
    let minutes =
      Number(p.tafb.slice(-2)) +
      Number(sequence[sequence.length - 1].arrivalTime[-2]) -
      Number(sequence[0].arrivalTime[-2]) +
      15;
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
    }
    return hours / 24;
  };

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
        <ExpensesTable
          station="YYZ"
          meals={meals}
          expenses={expenses}
          isLayover={true}
          fullDays={calculateFullDays()}
        />
      )}
    </div>
  );
}
export default Pairing;

// } else {
//   return (
//     <div className="text-start font-monospace">
//       <div className="row mt-4">
//         <div className="col-6 ps-5">
//           {p.pairingNumber} OPERATES/OPER- {p.pairingOperates}
//         </div>
//         <div className="col-6 text-end pe-5">
//           {/* Dates: {JSON.stringify(p.pairingDates)} */}
//         </div>
//       </div>
//       <div className="row">
//         <div className="col-6 ps-5">
//           Crew: {p.pairingPurser && `P${p.pairingPurser}  `}
//           {p.pairingFA && `FA${p.pairingFA}  `}
//           {p.pairingGP && `GJ${p.pairingGP}  `}
//           {p.pairingGY && `GY${p.pairingGY}`}
//         </div>
//         <div className="col-6 text-end pe-5">
//           Languages: {p.pairingBL && `BL${p.pairingBL}  `}
//           {p.pairingLanguages &&
//             p.pairingLanguages.map((lang) => {
//               return `${lang}`;
//             })}
//         </div>
//       </div>
//       {p.dutyDays.map((dutyDay, index) => {
//         return <DutyDay key={index} index={index} />;
//       })}
//       {/* <div className="row mt-3 ms-3">
//         {sequence &&
//           sequence.map((current, index) => {
//             if (!current.hotelInfo) {
//               // duty day of flights
//               <p key={index}>{JSON.stringify(current)}</p>;
//               return <Flight key={index} index={index} />;
//             } else if (current.hotelInfo) {
//               // layover
//               return (
//                 <div className="row" key={index}>
//                   <Layover key={index} index={index} />
//                 </div>
//               );
//             }
//           })}
//       </div> */}

//       <div className="row ms-3">
//         <div className="col-3">BLOCK/H-VOL {p.blockCredit}</div>
//         <div className="col-3">Total Duty {p.totalDuty}</div>
//         <div className="col-3">(INC - ${p.cicoAmount} CICO)</div>
//         <div className="col-3">TOTAL ALLOWANCE - ${p.totalAllowance}</div>
//       </div>
//       <div className="row ms-3">
//         <div className="col-3">TAFB/PTEB {p.tafb}</div>
//         <div className="col-3">TOTAL - {p.totalCredit}</div>
//       </div>
//       <p className="mt-3"></p>
//       <p></p>
//     </div>
//   );
//}
