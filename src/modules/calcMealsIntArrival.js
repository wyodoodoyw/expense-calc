import dayjs from 'dayjs';

const timeFormat = 'HHmm';

const calcMealsIntArrival = (arrivalTime) => {
  const time = dayjs(arrivalTime, timeFormat);

  if (time.isBefore(dayjs('12:30', timeFormat), 'minutes')) {
    return 'BLDS';
  } else if (
    time.isAfter(dayjs('12:30', timeFormat), 'minute') &&
    time.isBefore(dayjs('13:30', timeFormat), 'minutes')
  ) {
    return 'LDS';
  } else if (time.isAfter(dayjs('13:30', timeFormat), 'minute')) {
    return 'DS';
  }
};

export default calcMealsIntArrival;
