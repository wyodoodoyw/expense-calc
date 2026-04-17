import stringToTime from './stringToTime';

const getShortDutyMealsBeforeInt = (dutyStart, firstDept, dutyEnd) => {
  const start = stringToTime(dutyStart);
  const dept = stringToTime(firstDept);
  const end = stringToTime(dutyEnd);
  let meals = '';

  if (
    dept.isBefore(stringToTime('08:00'), 'minutes') &&
    start.isBefore(stringToTime('08:00'), 'minutes') &&
    end.isAfter(stringToTime('09:30'), 'minutes')
  ) {
    meals += 'B';
  }

  if (
    dept.isBefore(stringToTime('12:30'), 'minutes') &&
    start.isBefore(stringToTime('12:30'), 'minutes') &&
    end.isAfter(stringToTime('13:30'), 'minutes')
  ) {
    meals += 'L';
  }

  if (
    dept.isBefore(stringToTime('18:00'), 'minutes') &&
    start.isBefore(stringToTime('18:00'), 'minutes') &&
    end.isAfter(stringToTime('19:30'), 'minutes')
  ) {
    meals += 'D';
  }

  if (
    (dept.isBefore(stringToTime('23:00'), 'minutes') &&
      start.isBefore(stringToTime('23:00'), 'minutes') &&
      end.isBefore(stringToTime('00:00'), 'minutes')) ||
    (dept.isBefore(stringToTime('23:00'), 'minutes') &&
      start.isBefore(stringToTime('23:00'), 'minutes') &&
      end.isBefore(stringToTime('04:00'), 'minutes'))
  ) {
    meals += 'S';
  }

  return {
    index: 0,
    meals: meals,
    station: 'YYZ',
  };
};

export default getShortDutyMealsBeforeInt;
