import dayjs from 'dayjs';
import stringToTime from './stringToTime';
import isBetween from 'dayjs/plugin/isBetween';

import calcLayoverDays from './calcLayoverDays';

dayjs.extend(isBetween);

const getBeginMeals = (intArrival) => {
  const time = stringToTime(intArrival);

  let meals = '';

  if (time.isBefore(stringToTime('12:30'), 'minutes')) {
    meals += 'BLDS';
  } else if (
    time.isAfter(stringToTime('12:30'), 'minutes') &&
    time.isBefore(stringToTime('13:31'), 'minutes')
  ) {
    meals += 'LDS';
  } else if (time.isAfter(stringToTime('13:30'), 'minutes')) {
    meals += 'DS';
  }
  return meals;
};

const getEndMeals = (domesticArrival, dutyEnd) => {
  const arrival = stringToTime(domesticArrival);
  const duty = stringToTime(dutyEnd);

  // console.log(
  //   `arrival: ${arrival.format('HH:mm')}, duty: ${duty.format('HH:mm')}`
  // );
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
    arrival.isAfter(stringToTime('01:00'), 'minutes') &&
    duty.isAfter(stringToTime('01:00'), 'minutes')
  ) {
    meals += 'BLDS';
  }
  return meals;
};

const calcMealsDomAfterInt = (
  internationalArrival,
  domesticArrival,
  dutyEnd,
  segmentLength
) => {
  // console.log(
  //   `internationalArrival: ${internationalArrival}, domesticArrival: ${domesticArrival}, dutyEnd: ${dutyEnd}, segmentLength: ${segmentLength}`
  // );
  let collector = [];

  //First Meal
  if (internationalArrival) {
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
    segmentLength
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
