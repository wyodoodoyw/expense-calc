import stringToTime from './stringToTime';
import calcLayoverDays from './calcLayoverDays';

const layoverStart = (start) => {
  const time = stringToTime(start);

  if (time.isBefore(stringToTime('12:31'), 'minute')) {
    return 'BLDS';
  } else if (
    time.isAfter(stringToTime('12:30'), 'minute') &&
    time.isBefore(stringToTime('13:31'), 'minute')
  ) {
    return 'LDS';
  } else if (time.isAfter(stringToTime('13:30'), 'minute')) {
    return 'DS';
  }
};

const layoverEnd = (end) => {
  const time = stringToTime(end);

  if (
    time.isAfter(stringToTime('06:59'), 'minute') &&
    time.isBefore(stringToTime('11:29'), 'minutes')
  ) {
    return 'B';
  } else if (
    time.isAfter(stringToTime('11:29'), 'minute') &&
    time.isBefore(stringToTime('16:59'), 'minutes')
  ) {
    return 'BL';
  } else if (
    time.isAfter(stringToTime('16:59'), 'minute') &&
    time.isBefore(stringToTime('21:59'), 'minutes')
  ) {
    return 'BLD';
  } else if (
    time.isAfter(stringToTime('21:59'), 'minute') ||
    time.isBefore(stringToTime('01:00'), 'minute')
  ) {
    return 'BLDS';
  }
};

const calcMealsIntLayover = (start, end, length) => {
  const collector = [];

  const startMeals = layoverStart(start);
  if (startMeals) {
    collector.push({
      index: collector.length,
      meals: layoverStart(start),
      station: 'int',
    });
  }

  // Adjust for full days on layover
  for (let i = 1; i <= calcLayoverDays(start, end, length); i++) {
    collector.push({
      index: collector.length,
      meals: 'BLDS',
      station: 'int',
    });
  }
  const endMeals = layoverEnd(end);
  if (endMeals) {
    collector.push({
      index: collector.length,
      meals: layoverEnd(end),
      station: 'int',
    });
  }
  // console.log(
  //   `layover: ${start} to ${end} l: ${length} days: ${calcLayoverDays(start, end, length)}`,
  // );
  return collector;
};

export default calcMealsIntLayover;
