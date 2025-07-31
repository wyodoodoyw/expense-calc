import dayjs from 'dayjs';

const timeFormat = 'HHmm';

const calcMealsIntDept = (deptTime) => {
  const time = dayjs(deptTime, timeFormat);

  if (
    time.isAfter(dayjs('07:00', timeFormat), 'minute') &&
    time.isBefore(dayjs('11:29', timeFormat), 'minutes')
  ) {
    return 'B';
  } else if (
    time.isAfter(dayjs('11:30', timeFormat), 'minute') &&
    time.isBefore(dayjs('16:59', timeFormat), 'minutes')
  ) {
    return 'BL';
  } else if (
    time.isAfter(dayjs('17:00', timeFormat), 'minute') &&
    time.isBefore(dayjs('21:59', timeFormat), 'minutes')
  ) {
    return 'BLD';
  } else if (
    time.isAfter(dayjs('22:00', timeFormat), 'minute') &&
    time.isBefore(dayjs('01:00', timeFormat).add(1, 'day'), 'minutes')
  ) {
    return 'BL';
  }
};

export default calcMealsIntDept;
