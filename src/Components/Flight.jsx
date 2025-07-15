/* eslint-disable react/prop-types */
import { TimePicker } from '@mui/x-date-pickers';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateFlightDeparture,
  updateFlightArrival,
} from '../features/flight/flightSlice';
import {
  calculatePairingMeals,
  updateDutyDayEnd,
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

  const pairing = useSelector((state) => state.pairing);
  const f = pairing.sequence[index];

  const dispatch = useDispatch();

  const departureTime = dayjs()
    .set('hour', f.departureTime.slice(0, -2))
    .set('minute', f.departureTime.slice(-2));
  const arrivalTime = dayjs()
    .set('hour', f.arrivalTime.slice(0, -2))
    .set('minute', f.arrivalTime.slice(-2));

  const dutyDays = pairing.dutyDays;
  let currentDutyDay = null;
  for (let i = 0; i < dutyDays.length; i++) {
    if (dutyDays[i].flightIndices.includes(index)) {
      currentDutyDay = dutyDays[i];
      break;
    }
  }

  const handleTimeChange = ({ target }) => {
    // handle changes to flight times
    const { name, value } = target;
    const dutyEnd = dayjs(value, timeFormat).add(15, 'minutes').format('HHmm');
    if (name === 'start') {
      dispatch(
        updateFlightDeparture({ index: index, value: value.format('HHmm') })
      );
    }
    if (name === 'end') {
      dispatch(
        updateFlightArrival({ index: index, value: value.format('HHmm') })
      );
      // dispatch(
      //   updateDutyDayEnd({
      //     index: currentDutyDay.index,
      //     value: dutyEnd,
      //   })
      // );
    }
    dispatch(calculatePairingMeals());
  };

  return (
    <>
      {/* <div className="mx-3 py-3 row text-start">
        {(f.index === 0 ||
          pairing.sequence[f.index - 1].hotelInfo !== undefined) && (
          <div className="col-">Duty Day Start:</div>
        )}
        <div className="col-">
          {(f.index === 0 ||
            pairing.sequence[f.index - 1].hotelInfo !== undefined) && (
            <input
              type="time"
              value={`${currentDutyDay.dutyDayStart.slice(
                0,
                -2
              )}:${currentDutyDay.dutyDayStart.slice(-2)}`}
              readOnly
            />
          )}
        </div>
      </div> */}
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
        {f.mealAllowance && (
          <div className="col-1">Meals Allowance: {f.mealAllowance}</div>
        )}
        {!f.mealsOnboard && !f.mealAllowance && <div className="col-1"></div>}
      </div>
      {/* <div className="mx-3 py-3 row text-start">
        {(f.index === pairing.sequence.length - 1 ||
          pairing.sequence[f.index + 1].hotelInfo) && (
          <div className="col-">Duty Day End:</div>
        )}
        <div className="col-">
          {(f.index === pairing.sequence.length - 1 ||
            pairing.sequence[f.index + 1].hotelInfo) && (
            <input
              type="time"
              value={`${currentDutyDay.dutyDayEnd.slice(
                0,
                -2
              )}:${currentDutyDay.dutyDayEnd.slice(-2)}`}
              readOnly
            />
          )}
        </div> 
      </div>*/}
    </>
  );
}
export default Flight;
