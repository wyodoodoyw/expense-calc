/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import ExpensesTable from './ExpensesTable';
import Flight from './Flight';
import Layover from './Layover';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';

const timeFormat = 'HH:mm';

function Pairing() {
  const p = useSelector((state) => state.pairing);
  const sequence = p.sequence;
  const firstDuty = p.dutyDays[0];
  const lastDuty = p.dutyDays[p.dutyDays.length - 1];
  const firstFlight = sequence[0];
  const lastFlight = sequence[sequence.length - 1];

  const [allMeals, setAllMeals] = useState({});
  const [caExpenses, setCaExpenses] = useState({});
  const [usExpenses, setUSExpenses] = useState({});

  useEffect(() => {
    getExpenseAmounts('YYZ');
    getExpenseAmounts('MCO');
    const meals = calculatePairingMeals();
    setAllMeals({
      breakfast: (meals.match(/B/g) || []).length,
      lunch: (meals.match(/L/g) || []).length,
      dinner: (meals.match(/D/g) || []).length,
      snack: (meals.match(/S/g) || []).length,
    });
  }, []);

  const isTransborder = () => {
    for (let i = 0; i < sequence.length; i++) {
      if (
        american_airport_codes.includes(sequence[i].arrivalAirport) ||
        american_airport_codes.includes(sequence[i].layoverStation)
      ) {
        return true;
      }
    }
    return false;
  };

  const numLayovers = () => {
    let layoverCount = 0;
    for (let i = 0; i < sequence.length; i++) {
      if (sequence[i].hotelInfo) {
        layoverCount++;
      }
    }
    return layoverCount;
  };

  const getExpenseAmounts = (station) => {
    const request = window.indexedDB.open('ExpensesDB', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction(['expenses'], 'readonly');
      const expensesStore = tx.objectStore('expenses');
      const airportCodesIndex = expensesStore.index('airport_codes');
      const request = airportCodesIndex.get(station);
      request.onsuccess = () => {
        if (canadian_airport_codes.includes(station)) {
          setCaExpenses({
            breakfast: request.result.expenses.breakfast,
            lunch: request.result.expenses.lunch,
            dinner: request.result.expenses.dinner,
            snack: request.result.expenses.snack,
          });
        } else if (american_airport_codes.includes(station)) {
          setUSExpenses({
            breakfast: request.result.expenses.breakfast,
            lunch: request.result.expenses.lunch,
            dinner: request.result.expenses.dinner,
            snack: request.result.expenses.snack,
          });
        }
      };
      request.onerror = (event) => {
        console.log(`!DB Error: ${event.target.error}`);
      };
      tx.oncomplete = () => {
        db.close();
      };
    };
  };

  const calculatePairingMeals = () => {
    let expenses = '';
    expenses += calculateFirstDayMeals();

    for (let i = 0; i < calculateFullDays(); i++) {
      expenses += 'BLDS';
    }
    expenses += calculateLastDayMeals();
    return expenses;
  };

  const calculateFirstDayMeals = () => {
    const time = dayjs(sequence[0].departureTime, timeFormat);
    const duty = {
      start: dayjs(firstDuty.dutyDayStart),
      end: dayjs('01:01', timeFormat).add(1, 'day'),
    };
    if (
      time.isBefore(dayjs('08:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('09:30', timeFormat), 'minutes')
    ) {
      // console.log(`!Begin: B`);
      return 'BLDS';
    } else if (
      time.isBefore(dayjs('12:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('13:30', timeFormat), 'minutes')
    ) {
      // console.log(`!Begin: L`);
      return 'LDS';
    } else if (
      time.isBefore(dayjs('18:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('18:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('19:30', timeFormat), 'minutes')
    ) {
      // console.log(`!Begin: D`);
      return 'DS';
    } else if (
      time.isBefore(dayjs('23:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('01:00', timeFormat).add(1, 'day'), 'minutes')
    ) {
      // console.log(`!Begin: S`);
      return 'S';
    }
  };

  const calculateLastDayMeals = () => {
    const time = dayjs(lastFlight.arrivalTime, timeFormat);
    const duty = {
      start: dayjs('00:00', timeFormat),
      end: dayjs(lastDuty.dutyDayEnd, timeFormat),
    };

    if (
      time.isAfter(dayjs('18:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('17:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('18:30', timeFormat), 'minutes')
    ) {
      // console.log(`!End: D`);
      return 'BLD';
    } else if (
      time.isAfter(dayjs('13:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('13:30', timeFormat), 'minutes')
    ) {
      // console.log(`!End: L`);
      return 'BL';
    } else if (
      time.isAfter(dayjs('09:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('09:30', timeFormat), 'minutes')
    ) {
      // console.log(`!End: B`);
      return 'B';
    } else if (
      time.isAfter(dayjs('01:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
      duty.end.isAfter((dayjs('01:00', timeFormat).add(1, 'day'), 'minutes'))
    ) {
      // console.log(`!End: S`);
      return 'BLDS';
    }
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
          station={sequence[0].departureAirport}
          meals={allMeals}
          expenses={caExpenses}
          numLayovers={numLayovers()}
        />
      )}
      {/* {!p.pairingNumber.includes('T5') && isTransborder() && (
        <ExpensesTable
          station={sequence[0].departureAirport}
          meals={allMeals}
          expenses={usExpenses}
          isLayover={true}
          fullDays={calculateFullDays()}
        />
      )} */}
    </div>
  );
}
export default Pairing;
