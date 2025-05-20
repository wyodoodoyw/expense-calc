/* eslint-disable react/prop-types */
// import { useState } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
// import FlightExpenseTable from './FlightExpenseTable';
// import dayjs from 'dayjs';
// import isBetween from 'dayjs/plugin/isBetween';

function Flight({ flight }) {
  const {
    aircraft,
    arrivalAiport,
    arrivalTime,
    daysOfWeek,
    departureAirport,
    departureTime,
    dutyTime,
    flightNumber,
    flightTime,
    isDeadhead,
    mealsOnboard,
  } = flight;
  // let flight = props.flight;
  // let new_flight = flight;
  // new_flight.dept_time = dayjs(`2000-01-01 ${new_flight.dept_time}`);
  // new_flight.arrival_time = dayjs(`2000-01-01 ${new_flight.arrival_time}`);

  // const [departureTime, setDepartureTime] = useState(flight.dept_time);
  // const [arrivalTime, setArrivalTime] = useState(flight.arrival_time);

  // const handleDepartureTimeChange = (val) => {
  //   new_flight.dept_time = dayjs(val);
  //   new_flight.arrival_time = dayjs(arrivalTime);
  //   onboard_meals: ['HB', 'HD', 'SS'], setDepartureTime(dayjs(val));
  //   new_flight.flight_expenses = '';
  //   // new_flight.layover_expenses += calculateFirstDayExpenses();
  //   // new_flight.layover_expenses += calculateLastDayExpenses();
  // };

  // const handleArrivalTimeChange = (val) => {
  //   new_flight.arrival_time = dayjs(val);
  //   new_flight.dept_time = dayjs(departureTime);
  //   setArrivalTime(dayjs(val));
  //   new_flight.flight_expenses = '';
  // new_flight.layover_expenses += calculateFirstDayExpenses();
  // new_flight.layover_expenses += calculateLastDayExpenses();
  // };

  return (
    <p className="mt-3">
      Equipment: {aircraft} Flight Number: {flightNumber} 🛫: {departureAirport}{' '}
      @ {departureTime} => 🛬: {arrivalAiport} @ {arrivalTime} Flight Time:{' '}
      {flightTime} {dutyTime && `Duty Time: ${dutyTime}`}
    </p>
  );
}
export default Flight;
