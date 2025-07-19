// /* eslint-disable react/prop-types */
// import { useState } from 'react';
// import { useSelector } from 'react-redux';
// import dayjs from 'dayjs';
// import Flight from './Flight';

// const timeFormat = 'HH:mm';

// function DutyDay(props) {
//   const { index } = props;

//   const pairing = useSelector((state) => state.pairing);
//   const dutyDay = pairing.dutyDays[index];
//   const sequence = pairing.sequence;
//   const flights = dutyDay.flightIndices.map((index) => {
//     return sequence[index];
//   });
//   console.log(flights);
//   return (
//     <div className="row bg-info">
//       <div className="col-">Duty Day Start:</div>
//       <input
//         type="time"
//         value={`${dutyDay.dutyDayStart.slice(
//           0,
//           -2
//         )}:${dutyDay.dutyDayStart.slice(-2)}`}
//         readOnly
//       />
//       {flights.map((flight) => {
//         return (
//           <div className="row" key={flight.index}>
//             <Flight key={flight.index} index={flight.index} />
//           </div>
//         );
//       })}
//       <div className="col-">Duty Day End:</div>
//       <input
//         type="time"
//         value={`${dutyDay.dutyDayEnd.slice(0, -2)}:${dutyDay.dutyDayEnd.slice(
//           -2
//         )}`}
//         readOnly
//       />
//     </div>
//   );
// }

// export default DutyDay;
