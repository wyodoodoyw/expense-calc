// const processPairingForDisplay = (pairingSequence) => {
//   // Break up into duty days and layovers
//   const display = [];
//   let dutyDayStartingIndex = 0;
//   let dutyDay = [];
//   for (let i = 0; i < pairingSequence.length; i++) {
//     if (pairingSequence[i].dutyTime) {
//       //End of duty day
//       for (let j = dutyDayStartingIndex; j <= i; j++) {
//         if (j === dutyDayStartingIndex) {
//           // Add duty start time to first flight of duty day
//           // Does not yet subtract 1 hour, or more
//           const departureTime = pairingSequence[j].departureTime;
//           const hour = departureTime.slice(0, -2);
//           const minute = departureTime.slice(-2);
//           pairingSequence[j].dutyStart = `${hour}` + minute;
//         }
//         if (j === i) {
//           // Add duty end time to last flight of duty day
//           // Does not yet add 15 minutes
//           const arrivalTime = pairingSequence[j].arrivalTime;
//           const hour = arrivalTime.slice(0, -2);
//           const minute = arrivalTime.slice(-2);
//           pairingSequence[j].dutyEnd = `${hour}` + minute;
//         }
//         dutyDay.push(pairingSequence[j]);
//         dutyDay.index = i;
//       }
//       display.push(dutyDay);
//       dutyDay = [];
//     } else if (pairingSequence[i].hotelInfo) {
//       // layover
//       const dutyDay = [];
//       dutyDay.push(pairingSequence[i]);
//       dutyDay.index = i;
//       display.push(dutyDay);
//       dutyDayStartingIndex = i + 1;
//     } else {
//       // pass
//     }
//   }
//   return display;
// };

// export default processPairingForDisplay;
