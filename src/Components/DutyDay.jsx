/* eslint-disable react/prop-types */
import { useState } from 'react';
import dayjs from 'dayjs';
import Flight from './Flight';

const timeFormat = 'HH:mm';

function DutyDay(props) {
  const { flights } = props;

  // console.log(flights);

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
    <>
      <p>Duty State Start: {dutyTimes.start.format(timeFormat)}</p>
      {flights.map((flight) => {
        return (
          <tr key={flight.index} className="table-success">
            <td key={flight.index}>
              <Flight
                key={flight.index}
                flight={flight}
                dutyTimes={dutyTimes}
                setDutyTimes={setDutyTimes}
              />
            </td>
          </tr>
        );
      })}
      <p>Duty State End: {dutyTimes.end.format(timeFormat)}</p>
    </>
  );
}

export default DutyDay;
