import dayjs from 'dayjs';
import stringToTime from './stringToTime';
import isBetween from 'dayjs/plugin/isBetween';

import calcLayoverDays from './calcLayoverDays';

dayjs.extend(isBetween);

const getBeginMeals = (dutyStart, departure) => {
  const duty = stringToTime(dutyStart);
  const dept = stringToTime(departure);

  // console.log(`duty: ${duty.format('HH:mm')}, dept: ${dept.format('HH:mm')}`);
  let meals = '';

  if (
    !duty.isBefore(stringToTime('01:00'), 'minute') &&
    duty.isBefore(stringToTime('08:00'), 'minutes') &&
    dept.isBefore(stringToTime('08:00'), 'minutes')
  ) {
    meals += 'BLDS';
  } else if (
    !duty.isBefore(stringToTime('01:00'), 'minute') &&
    duty.isBefore(stringToTime('12:30'), 'minutes') &&
    dept.isBefore(stringToTime('12:30'), 'minutes')
  ) {
    meals += 'LDS';
  } else if (
    !duty.isBefore(stringToTime('01:00'), 'minute') &&
    duty.isBefore(stringToTime('18:00'), 'minutes') &&
    dept.isBefore(stringToTime('18:00'), 'minutes')
  ) {
    meals += 'DS';
  } else if (
    !duty.isBefore(stringToTime('01:00'), 'minute') &&
    duty.isBefore(stringToTime('23:00'), 'minutes') &&
    dept.isBefore(stringToTime('23:00'), 'minutes') &&
    !dept.isBetween(stringToTime('01:00'), stringToTime('05:00'))
  ) {
    meals += 'S';
  }
  // console.log(`meals: ${meals}`);
  return meals;
};

const getEndMeals = (internationalDept) => {
  const time = stringToTime(internationalDept);
  // console.log(`internationalDept time: ${time.format('HH:mm')}`);

  let meals = '';
  if (
    time.isAfter(stringToTime('06:59'), 'minute') &&
    time.isBefore(stringToTime('11:30'), 'minute')
  ) {
    meals += 'B';
  } else if (
    time.isAfter(stringToTime('11:29'), 'minute') &&
    time.isBefore(stringToTime('17:00'), 'minute')
  ) {
    meals += 'BL';
  } else if (
    time.isAfter(stringToTime('16:59'), 'minute') &&
    time.isBefore(stringToTime('22:00'), 'minute')
  ) {
    meals += 'BLD';
  } else if (
    time.isAfter(stringToTime('21:59'), 'minute') ||
    time.isBefore(stringToTime('01:00'), 'minute')
  ) {
    meals += 'BLDS';
  }
  // console.log(`meals2: ${meals}`);
  return meals;
};

const calcMealsDomBeforeInt = (
  dutyStart,
  domesticDept,
  internationalDept,
  segmentLength
) => {
  // console.log(
  //   `dutyStart: ${dutyStart}, domesticDept: ${domesticDept}, intDept: ${internationalDept}, segmentLength: ${segmentLength}`
  // );
  let collector = [];

  //First Meal
  if (dutyStart && domesticDept) {
    const result = getBeginMeals(dutyStart, domesticDept);
    // console.log(`first meal result: ${result}`);
    if (result) {
      collector.push({
        index: collector.length,
        meals: result,
        station: 'YYZ',
      });
    }
  }

  // Adjust for full days on layover
  const days = calcLayoverDays(domesticDept, internationalDept, segmentLength);
  // console.log(`days: ${days}`);
  for (let i = 1; i <= days; i++) {
    collector.push({
      index: collector.length,
      meals: 'BLDS',
      station: 'YYZ',
    });
  }

  //Last Meal
  if (internationalDept) {
    const result = getEndMeals(internationalDept);
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

export default calcMealsDomBeforeInt;
