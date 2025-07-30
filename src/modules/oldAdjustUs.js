// const adjustforUS = () => {
//   const sequence = p.sequence;
//   const dutyDays = p.dutyDays;
//   console.log('adjustforUS called');

//   // iterate over usLayovers
//   // find layover, determine if it is in the US
//   // adjust for US meals on US layover
//   // check also flight prior and flight after layover
//   if (usLayovers) {
//     for (let i = 0; i < usLayovers.length; i++) {
//       const l = usLayovers[i];
//       for (let j = 0; j < l.length; j++) {
//         console.log(l.layoverMeals);

//         switch (l.layoverMeals[j]) {
//           case 'B':
//             setCaMeals((prev) => ({
//               ...prev,
//               breakfast: prev.breakfast - 1,
//             }));
//             setUsMeals((prev) => ({
//               ...prev,
//               breakfast: prev.breakfast + 1,
//             }));
//             break;
//           case 'L':
//             setCaMeals((prev) => ({
//               ...prev,
//               breakfast: prev.lunch - 1,
//             }));
//             setUsMeals((prev) => ({
//               ...prev,
//               breakfast: prev.lunch + 1,
//             }));
//             break;
//           case 'D':
//             setCaMeals((prev) => ({
//               ...prev,
//               breakfast: prev.dinner - 1,
//             }));
//             setUsMeals((prev) => ({
//               ...prev,
//               breakfast: prev.dinner + 1,
//             }));
//             break;
//           case 'S':
//             setCaMeals((prev) => ({
//               ...prev,
//               breakfast: prev.snack - 1,
//             }));
//             setUsMeals((prev) => ({
//               ...prev,
//               breakfast: prev.snack + 1,
//             }));
//             break;
//         }
//       }
//     }

// if (american_airport_codes.includes(s[i].arrivalAirport)) {
//   console.log(`Adjust: ${s[i].index} arriving at ${s[i].arrivalAirport}`);
//   const time = dayjs(s[i].arrivalTime, timeFormat);
//   let duty = {
//     start: dayjs('00:00', timeFormat),
//     end: dayjs('23:59', timeFormat),
//   };
//   for (let j = 0; j < dutyDays.length; j++) {
//     // set duty.start to start of first duty day
//     if (
//       dutyDays[j].flightIndices.includes(s[i].index) &&
//       dutyDays.index === 0
//     ) {
//       duty.start = dayjs(dutyDays[0].dutyDayStart, timeFormat);
//     }
//     // set duty.end to end of last duty day
//     if (
//       dutyDays[j].flightIndices.includes(s[i].index) &&
//       dutyDays.index === dutyDays.length - 1
//     ) {
//       duty.start = dayjs(
//         dutyDays[dutyDays.length - 1].dutyDayEnd,
//         timeFormat
//       );
//     }

//     if (
//       time.isAfter(dayjs('18:30', timeFormat), 'minute') &&
//       duty.start.isBefore(dayjs('17:00', timeFormat), 'minutes') &&
//       duty.end.isAfter(dayjs('18:30', timeFormat), 'minutes')
//     ) {
//       setCaMeals((prev) => ({
//         ...prev,
//         dinner: prev.dinner - 1,
//       }));
//       setUsMeals((prev) => ({
//         ...prev,
//         dinner: prev.dinner + 1,
//       }));
//       return 'D';
//     } else if (
//       time.isAfter(dayjs('13:30', timeFormat), 'minute') &&
//       duty.start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
//       duty.end.isAfter(dayjs('13:30', timeFormat), 'minutes')
//     ) {
//       console.log('L');
//       return 'L';
//     } else if (
//       time.isAfter(dayjs('09:30', timeFormat), 'minute') &&
//       duty.start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
//       duty.end.isAfter(dayjs('09:30', timeFormat), 'minutes')
//     ) {
//       console.log('B');
//       return 'B';
//     } else if (
//       time.isAfter(dayjs('01:00', timeFormat), 'minute') &&
//       duty.start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
//       duty.end.isAfter(
//         (dayjs('01:00', timeFormat).add(1, 'day'), 'minutes')
//       )
//     ) {
//       console.log('S');
//       return 'S';
//     }
//   }
// }
