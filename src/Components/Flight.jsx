/* eslint-disable react/prop-types */
import { useState } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import { useSelector, useDispatch } from 'react-redux';
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
  // console.log(`f: ${JSON.stringify(f)}`);

  const [flightTimes, setFlightTimes] = useState(
    {
      start: dayjs()
        .set('hour', f.departureTime.slice(0, -2))
        .set('minute', f.departureTime.slice(-2)),
      end: dayjs()
        .set('hour', f.arrivalTime.slice(0, -2))
        .set('minute', f.arrivalTime.slice(-2)),
    },
    []
  );

  const handleTimeChange = ({ target }) => {
    // handle changes to flight times
    // const { name, value } = target;
    //   setFlightTimes((prev) => ({
    //     ...prev,
    //     [name]: dayjs(value, timeFormat),
    //   }));
    // setDutyTimes((prev) => ({
    //   ...prev,
    //   [name]: dayjs(value, timeFormat),
    // }));
  };

  return (
    <>
      <div className="ms-3 text-center row bg-info">
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
            value={flightTimes.start}
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
            value={flightTimes.end}
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
