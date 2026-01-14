import stringToTime from './stringToTime';

const getShortDutyMeals = (dutyStart, dutyEnd) => {
  const start = stringToTime(dutyStart);
  const end = stringToTime(dutyEnd);
  let meals = '';

  if (
    start.isBefore(stringToTime('08:00'), 'minutes') &&
    end.isAfter(stringToTime('09:30'), 'minutes')
  ) {
    meals += 'B';
  }

  if (
    start.isBefore(stringToTime('12:30'), 'minutes') &&
    end.isAfter(stringToTime('13:30'), 'minutes')
  ) {
    meals += 'L';
  }

  if (
    start.isBefore(stringToTime('18:00'), 'minutes') &&
    end.isAfter(stringToTime('19:30'), 'minutes')
  ) {
    meals += 'D';
  }

  if (
    start.isBefore(stringToTime('23:00'), 'minutes') &&
    end.isAfter(stringToTime('01:00'), 'minutes') &&
    !end.isAfter(stringToTime('09:00'), 'minute')
  ) {
    meals += 'S';
  }

  return {
    index: 0,
    meals: meals,
    station: 'YYZ',
  };
};

export default getShortDutyMeals;
