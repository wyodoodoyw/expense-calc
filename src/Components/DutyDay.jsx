/* eslint-disable react/prop-types */
import { useState, useContext, useEffect } from 'react';
// import { PairingContext } from './PairingContext';
import dayjs from 'dayjs';
import Flight from './Flight';

const timeFormat = 'HH:mm';

function DutyDay(props) {
  const { index, flights } = props;

  // const [state, setState] = useContext(PairingContext);

  // useEffect(
  //   () =>
  //     setState((prev) => ({
  //       ...prev,
  //       key: index,
  //       dutyStart: dayjs(
  //         `${flights[0].dutyStart.slice(0, -2)}:${flights[0].dutyStart.slice(
  //           -2
  //         )}`,
  //         timeFormat
  //       ),
  //       dutyEnd: dayjs(
  //         `${flights[flights.length - 1].dutyEnd.slice(0, -2)}:${flights[
  //           flights.length - 1
  //         ].dutyEnd.slice(-2)}`,
  //         timeFormat
  //       ),
  //     })),
  //   []
  // );

  const [dutyTimes, setDutyTimes] = useState({
    start: dayjs(
      `${flights[0].dutyStart.slice(0, -2)}:${flights[0].dutyStart.slice(-2)}`,
      timeFormat
    ),
    end: dayjs(
      `${flights[flights.length - 1].dutyEnd.slice(0, -2)}:${flights[
        flights.length - 1
      ].dutyEnd.slice(-2)}`,
      timeFormat
    ),
    length: flights[flights.length - 1].dutyTime,
  });

  return (
    <div className="row bg-info">
      <p>Duty State Start: {dutyTimes.start.format(timeFormat)}</p>
      {flights.map((flight) => {
        return (
          <div className="row" key={flight.index}>
            <Flight
              key={flight.index}
              flight={flight}
              dutyTimes={dutyTimes}
              setDutyTimes={setDutyTimes}
            />
          </div>
        );
      })}
      <p>Duty State End: {dutyTimes.end.format(timeFormat)}</p>
    </div>
  );
}

export default DutyDay;
