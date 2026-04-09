import dayjs from 'dayjs';
import stringToTime from './stringToTime';
import isBetween from 'dayjs/plugin/isBetween';

import calcLayoverDays from './calcLayoverDays';

dayjs.extend(isBetween);

const getBeginMeals = (intArrival) => {
  const time = stringToTime(intArrival);

  let meals = '';

  if (time.isBefore(stringToTime('09:31'), 'minutes')) {
    meals += 'BLDS';
  } else if (
    time.isBefore(stringToTime('13:31'), 'minutes')
    // &&
    // time.isBefore(stringToTime('13:31'), 'minutes')
  ) {
    meals += 'LDS';
  } else if (time.isBefore(stringToTime('19:31'), 'minutes')) {
    meals += 'DS';
  } else if (
    time.isBefore(stringToTime('23:59', 'minutes')) ||
    (time.isAfter(stringToTime('00:00', 'minutes')) &&
      time.isBefore(stringToTime('06:00', 'minutes')))
  ) {
    meals += 'S';
  }
  return meals;
};

const getEndMeals = (domesticArrival, dutyEnd) => {
  const arrival = stringToTime(domesticArrival);
  const duty = stringToTime(dutyEnd);

  let meals = '';

  if (
    !duty.isBefore(stringToTime('01:00'), 'minute') &&
    arrival.isAfter(stringToTime('18:30'), 'minutes') &&
    duty.isAfter(stringToTime('18:30'), 'minutes')
  ) {
    meals += 'BLD';
  } else if (
    !duty.isBefore(stringToTime('01:00'), 'minute') &&
    arrival.isAfter(stringToTime('13:30'), 'minutes') &&
    duty.isAfter(stringToTime('13:30'), 'minutes')
  ) {
    meals += 'BL';
  } else if (
    !duty.isBefore(stringToTime('01:00'), 'minute') &&
    arrival.isAfter(stringToTime('09:30'), 'minutes') &&
    duty.isAfter(stringToTime('09:30'), 'minutes')
  ) {
    meals += 'B';
  } else if (
    !duty.isBefore(stringToTime('01:00'), 'minute') &&
    !arrival.isAfter(stringToTime('04:00'), 'minute') &&
    arrival.isAfter(stringToTime('01:00'), 'minutes') &&
    duty.isAfter(stringToTime('01:00'), 'minutes')
  ) {
    meals += 'BLDS';
  }
  return meals;
};

// const getShortDutyMeals = (dutyStart, dutyEnd) => {
//   const start = stringToTime(dutyStart);
//   const end = stringToTime(dutyEnd);
//   let meals = '';

//   if (
//     start.isBefore(stringToTime('08:00'), 'minutes') &&
//     end.isAfter(stringToTime('09:30'), 'minutes')
//   ) {
//     meals += 'B';
//   }

//   if (
//     start.isBefore(stringToTime('12:30'), 'minutes') &&
//     end.isAfter(stringToTime('13:30'), 'minutes')
//   ) {
//     meals += 'L';
//   }

//   if (
//     start.isBefore(stringToTime('18:00'), 'minutes') &&
//     end.isAfter(stringToTime('19:30'), 'minutes')
//   ) {
//     meals += 'D';
//   }

//   if (
//     start.isBefore(stringToTime('23:00'), 'minutes') &&
//     end.isAfter(stringToTime('01:00'), 'minutes') &&
//     start.isBefore(stringToTime('04:00'), 'minutes')
//   ) {
//     meals += 'S';
//   }

//   return meals;
// };

//--- MAIN

const calcMealsDomAfterInt = (
  internationalArrival,
  domesticArrival,
  dutyEnd,
  segmentLength,
) => {
  // console.log(
  //   `internationalArrival: ${internationalArrival}, domesticArrival: ${domesticArrival}, dutyEnd: ${dutyEnd}, segmentLength: ${segmentLength}`,
  // );
  let collector = [];

  //First Meal
  // if (Number(segmentLength.slice(0, -2)) < 16) {
  //   const result = getShortDutyMeals(internationalArrival, dutyEnd);
  //   console.log(`short duty meals result: ${result}`);
  //   if (result) {
  //     collector.push({
  //       index: collector.length,
  //       meals: result,
  //       station: 'YYZ',
  //     });
  //   }
  // } else
  if (internationalArrival && Number(segmentLength.slice(0, -2)) >= 16) {
    const result = getBeginMeals(internationalArrival);
    // console.log(`INTL first meal result: ${result}`);
    if (result) {
      collector.push({
        index: collector.length,
        meals: result,
        station: 'YYZ',
      });
    }
  }

  // Adjust for full days on layover
  const days = calcLayoverDays(
    internationalArrival,
    domesticArrival,
    segmentLength,
  );
  // console.log(`days: ${days}`);
  for (let i = 1; i <= days; i++) {
    collector.push({
      index: collector.length,
      meals: 'BLDS',
      station: 'YYZ',
    });
  }

  //Last Meal
  if (domesticArrival) {
    const result = getEndMeals(domesticArrival, dutyEnd);
    // console.log(`last meal result: ${result}`);
    if (result) {
      collector.push({
        index: collector.length,
        meals: result,
        station: 'YYZ',
      });
    }
  }

  return collector;
};

export default calcMealsDomAfterInt;
