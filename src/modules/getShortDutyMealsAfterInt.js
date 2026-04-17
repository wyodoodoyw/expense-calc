import stringToTime from './stringToTime';

const getShortDutyMealsBeforeInt = (arrivalTime, finalDutyEnd) => {
  const start = stringToTime(arrivalTime);
  const end = stringToTime(finalDutyEnd);
  let meals = '';

  if (
    start.isBefore(stringToTime('08:00'), 'minutes') &&
    // start.isAfter(stringToTime('09:30'), 'minutes') &&
    end.isAfter(stringToTime('09:30'), 'minutes')
  ) {
    meals += 'B';
  }

  if (
    start.isBefore(stringToTime('12:30'), 'minutes') &&
    // start.isAfter(stringToTime('12:30'), 'minutes') &&
    end.isAfter(stringToTime('13:30'), 'minutes')
  ) {
    meals += 'L';
  }

  if (
    start.isBefore(stringToTime('17:00'), 'minutes') &&
    // start.isAfter(stringToTime('18:00'), 'minutes') &&
    end.isAfter(stringToTime('18:30'), 'minutes')
  ) {
    meals += 'D';
  }

  if (
    start.isAfter(stringToTime('01:00'), 'minutes') &&
    start.isBefore(stringToTime('05:00'), 'minutes') &&
    end.isAfter(stringToTime('01:00'), 'minute')
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
