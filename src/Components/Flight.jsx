/* eslint-disable react/prop-types */
import { useState } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateFlightDeparture,
  updateFlightArrival,
} from '../features/pairing/pairingSlice';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
// import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(utc);
dayjs.extend(timezone);
const timeFormat = 'HH:mm';

function Flight(props) {
  const { index } = props;

  const f = useSelector((state) => state.pairing.sequence[index]);
  const departureTime = dayjs()
    .set('hour', f.departureTime.slice(0, -2))
    .set('minute', f.departureTime.slice(-2));
  const arrivalTime = dayjs()
    .set('hour', f.arrivalTime.slice(0, -2))
    .set('minute', f.arrivalTime.slice(-2));

  const dispatch = useDispatch();

  const handleTimeChange = ({ target }) => {
    // handle changes to flight times
    const { name, value } = target;
    // console.log(target);
    if (name === 'start') {
      dispatch(
        updateFlightDeparture({ index: index, value: value.format('HHmm') })
      );
    }
    if (name === 'end') {
      dispatch(
        updateFlightArrival({ index: index, value: value.format('HHmm') })
      );
    }
    // setFlightTimes((prev) => ({
    //   ...prev,
    //   [name]: dayjs(value.format(timeFormat)),
    // }));
    // setDutyTimes((prev) => ({
    //   ...prev,
    //   [name]: dayjs(value, timeFormat),
    // }));
  };

  return (
    <>
      <div className="ms-3 py-3 text-center row bg-info">
        {f.isDeadhead && <div className="col-1">DHD</div>}
        <div className="col-1">Flight No: AC{f.flightNumber}</div>
        <div className="col-1">Equipment: {f.aircraft}</div>
        <div className="col-3 h-100 align-middle fs-3">
          {`${f.departureAirport} `}
          <TimePicker
            key="flight_start"
            ampm={false}
            format="HH:mm"
            timeSteps={{ hours: 1, minutes: 1 }}
            value={departureTime}
            onAccept={(val) =>
              handleTimeChange({
                target: { name: 'start', value: val },
              })
            }
          />
        </div>
        <div className="col-3 h-100 align-middle fs-3">
          {`${f.arrivalAirport} `}
          <TimePicker
            key="flight_end"
            ampm={false}
            format="HH:mm"
            timeSteps={{ hours: 1, minutes: 1 }}
            value={arrivalTime}
            onAccept={(val) =>
              handleTimeChange({
                target: { name: 'end', value: val },
              })
            }
          />
        </div>
        <div className="col-1">Flight Time: {f.flightTime}</div>
        <div className="col-1">{f.dutyTime && `Duty Time: ${f.dutyTime}`}</div>
        {f.mealsOnboard ? (
          <div className="col-1">Meals Oboard: {f.mealsOnboard}</div>
        ) : f.mealAllowance ? (
          <div className="col-1">Meals Allowance: {f.mealAllowance}</div>
        ) : (
          <div className="col-1"></div>
        )}
      </div>
    </>
  );
}
export default Flight;
