import dayjs from 'dayjs';
import stringToTime from './stringToTime';

const timeFormat = 'HH:mm';

const calcMealsDomArrival = (arrivalTime, dutyEnd) => {
  const time = stringToTime(arrivalTime);
  const duty = stringToTime(dutyEnd);

  if (
    time.isAfter(dayjs('18:30', timeFormat), 'minute') &&
    duty.isAfter(dayjs('18:30', timeFormat), 'minutes')
  ) {
    return 'BLD';
  } else if (
    time.isAfter(dayjs('13:30', timeFormat), 'minute') &&
    duty.isAfter(dayjs('13:30', timeFormat), 'minutes')
  ) {
    return 'BL';
  } else if (
    time.isAfter(dayjs('09:30', timeFormat), 'minute') &&
    duty.isAfter(dayjs('09:30', timeFormat), 'minutes')
  ) {
    return 'B';
  } else if (
    time.isAfter(dayjs('01:00', timeFormat), 'minute') &&
    duty.isAfter((dayjs('01:00', timeFormat).add(1, 'day'), 'minutes'))
  ) {
    return 'BLDS';
  }
};

export default calcMealsDomArrival;
