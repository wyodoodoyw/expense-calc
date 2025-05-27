/* eslint-disable react/prop-types */
import { useState } from 'react';
import Flight from './Flight';

function DutyDay(props) {
  const { flights } = props;

  const [dutyTimes, setDutyTimes] = useState({
    start: flights[0].dutyStart,
    end: flights[flights.length - 1].dutyEnd,
    length: flights[flights.length - 1].dutyTime,
  });

  return (
    <>
      {flights.map((flight) => {
        return (
          <tr key={flight.index} className="table-success">
            <td key={flight.index}>
              <Flight key={flight.index} flight={flight} />
            </td>
          </tr>
        );
      })}
    </>
  );
}

export default DutyDay;
