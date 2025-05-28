/* eslint-disable react/prop-types */
import { useState } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
// import FlightExpenseTable from './FlightExpenseTable';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
// import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(utc);
dayjs.extend(timezone);
const timeFormat = 'HH:mm';

function Flight({ flight, dutyTimes, setDutyTimes }) {
  const {
    aircraft,
    arrivalAirport,
    arrivalTime,
    // daysOfWeek,
    departureAirport,
    departureTime,
    // dutyEnd,
    // dutyStart,
    dutyTime,
    flightNumber,
    flightTime,
    isDeadhead,
    mealsOnboard,
    mealAllowance,
  } = flight;

  const [flightTimes, setFlightTimes] = useState({
    start: dayjs()
      .set('hour', departureTime.slice(0, -2))
      .set('minute', departureTime.slice(-2)),
    end: dayjs()
      .set('hour', arrivalTime.slice(0, -2))
      .set('minute', arrivalTime.slice(-2)),
  });

  const handleTimeChange = ({ target }) => {
    // handle changes to flight times
    const { name, value } = target;
    setFlightTimes((prev) => ({
      ...prev,
      [name]: dayjs(value, timeFormat),
    }));
    setDutyTimes((prev) => ({
      ...prev,
      [name]: dayjs(value, timeFormat),
    }));
  };

  return (
    <>
      <div className="ms-3 text-center row">
        {isDeadhead && <div className="col-1">DHD</div>}
        <div className="col-1">Flight No: AC{flightNumber}</div>
        <div className="col-1">Equipment: {aircraft}</div>
        <div className="col-3 h-100 align-middle fs-3">
          {`${departureAirport} `}
          <TimePicker
            key="flight_start"
            ampm={false}
            format="HH:mm"
            timeSteps={{ hours: 1, minutes: 1 }}
            value={flightTimes.start}
            onAccept={(val) =>
              handleTimeChange({
                target: { name: 'start', value: val },
              })
            }
          />
        </div>
        <div className="col-3 h-100 align-middle fs-3">
          {`${arrivalAirport} `}
          <TimePicker
            key="flight_end"
            ampm={false}
            format="HH:mm"
            timeSteps={{ hours: 1, minutes: 1 }}
            value={flightTimes.end}
            onAccept={(val) =>
              handleTimeChange({
                target: { name: 'end', value: val },
              })
            }
          />
        </div>
        <div className="col-1">Flight Time: {flightTime}</div>
        <div className="col-1">{dutyTime && `Duty Time: ${dutyTime}`}</div>
        {mealsOnboard ? (
          <div className="col-1">Meals Oboard: {mealsOnboard}</div>
        ) : mealAllowance ? (
          <div className="col-1">Meals Allowance: {mealAllowance}</div>
        ) : (
          <div className="col-1"></div>
        )}
      </div>
      <p>~ Dept: {flightTimes.start.format(timeFormat)}</p>
      <p>~ Arrival: {flightTimes.end.format(timeFormat)}</p>
    </>
  );
}
export default Flight;
