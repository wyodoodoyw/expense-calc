/* eslint-disable react/prop-types */
import { TimePicker } from '@mui/x-date-pickers';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateFlightDeparture,
  updateFlightArrival,
} from '../pairing/pairingSlice';
import dayjs from 'dayjs';
import stringToTime from '../../modules/stringToTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useState } from 'react';

dayjs.extend(utc);
dayjs.extend(timezone);

function Flight(props) {
  const { index } = props;

  const pairing = useSelector((state) => state.pairing);
  const [f, setFlight] = useState(pairing.sequence[index]);

  const dispatch = useDispatch();

  const departureTime = stringToTime(f.departureTime);
  const arrivalTime = stringToTime(f.arrivalTime);

  const handleTimeChange = ({ target }) => {
    // handle changes to flight times
    const { name, value } = target;
    if (name === 'start') {
      setFlight((prev) => ({
        ...prev,
        departureTime: value.format('HHmm'),
      }));
      dispatch(
        updateFlightDeparture({ index: index, value: value.format('HHmm') })
      );
    }
    if (name === 'end') {
      setFlight((prev) => ({
        ...prev,
        arrivalTime: value.format('HHmm'),
      }));
      dispatch(
        updateFlightArrival({ index: index, value: value.format('HHmm') })
      );
    }
  };

  return (
    <>
      <div className="mx-3 py-3 text-center row flex-shrink-1 bg-info">
        <div className="col-1">
          Flight No: AC{f.flightNumber} {f.isDeadhead && <p>DHD</p>}
        </div>
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
        {f.mealsOnboard && (
          <div className="col-1">Meals Onboard: {f.mealsOnboard}</div>
        )}
        {f.mealExpenses && (
          <div className="col-1">Meals Allowance: {f.mealExpenses}</div>
        )}
        {!f.mealsOnboard && !f.mealAllowance && <div className="col-1"></div>}
      </div>
    </>
  );
}
export default Flight;
