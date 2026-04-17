import dayjs from 'dayjs';
import stringToTime from './stringToTime';
import isBetween from 'dayjs/plugin/isBetween';

import calcLayoverDays from './calcLayoverDays';

dayjs.extend(isBetween);

const getBeginMeals = (dutyStart, departure) => {
  const duty = stringToTime(dutyStart);
  const dept = stringToTime(departure);

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

  let meals = '';
  if (
    time.isBetween(
      stringToTime('23:00'),
      stringToTime('23:59'),
      null,
      'minute',
      '[]',
    ) ||
    time.isBetween(
      stringToTime('00:00'),
      stringToTime('04:00'),
      null,
      'minute',
      '[]',
    )
  ) {
    meals += 'BLDS';
  } else if (
    time.isBetween(
      stringToTime('13:30'),
      stringToTime('23:00'),
      null,
      'minute',
      '[)',
    )
  ) {
    meals += 'BLD';
  } else if (
    time.isBetween(
      stringToTime('09:30'),
      stringToTime('18:00'),
      null,
      'minute',
      '[)',
    )
  ) {
    meals += 'BL';
  } else if (
    time.isBetween(
      stringToTime('04:00'),
      stringToTime('12:30'),
      null,
      'minute',
      '[)',
    )
  ) {
    meals += 'B';
  }
  return meals;
};

const calcMealsDomBeforeInt = (
  dutyStart,
  domesticDept,
  internationalDept,
  segmentLength,
) => {
  let collector = [];

  //First Meal
  if (dutyStart && domesticDept) {
    const result = getBeginMeals(dutyStart, domesticDept);
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
