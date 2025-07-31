import dayjs from 'dayjs';

const timeFormat = 'HH:mm';

const calcMealsDomArrival = (arrivalTime, dutyEnd) => {
  const time = dayjs(arrivalTime, timeFormat);

  if (
    time.isAfter(dayjs('18:30', timeFormat), 'minute') &&
    dutyEnd.isAfter(dayjs('18:30', timeFormat), 'minutes')
  ) {
    return 'D';
  } else if (
    time.isAfter(dayjs('13:30', timeFormat), 'minute') &&
    dutyEnd.isAfter(dayjs('13:30', timeFormat), 'minutes')
  ) {
    return 'L';
  } else if (
    time.isAfter(dayjs('09:30', timeFormat), 'minute') &&
    dutyEnd.isAfter(dayjs('09:30', timeFormat), 'minutes')
  ) {
    return 'B';
  } else if (
    time.isAfter(dayjs('01:00', timeFormat), 'minute') &&
    dutyEnd.isAfter((dayjs('01:00', timeFormat).add(1, 'day'), 'minutes'))
  ) {
    return 'S';
  }
};

export default calcMealsDomArrival;
