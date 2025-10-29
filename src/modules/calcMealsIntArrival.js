import dayjs from 'dayjs';
import stringToTime from './stringToTime';

const timeFormat = 'HHmm';

const calcMealsIntArrival = (arrivalTime) => {
  const time = stringToTime(arrivalTime);

  if (time.isBefore(dayjs('12:31', timeFormat), 'minute')) {
    return 'BLDS';
  } else if (
    time.isAfter(dayjs('12:30', timeFormat), 'minute') &&
    time.isBefore(dayjs('13:31', timeFormat), 'minute')
  ) {
    return 'LDS';
  } else if (time.isAfter(dayjs('13:30', timeFormat), 'minute')) {
    return 'DS';
  }
};

export default calcMealsIntArrival;
