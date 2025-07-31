import dayjs from 'dayjs';

const timeFormat = 'HHmm';

const calcMealsDomDept = (deptTime, dutyStart) => {
  const time = dayjs(deptTime, timeFormat);

  if (
    time.isBefore(dayjs('08:00', timeFormat), 'minute') &&
    dutyStart.isBefore(dayjs('08:00', timeFormat), 'minutes')
  ) {
    return 'D';
  } else if (
    time.isBefore(dayjs('12:30', timeFormat), 'minute') &&
    dutyStart.isBefore(dayjs('12:30', timeFormat), 'minutes')
  ) {
    return 'L';
  } else if (
    time.isBefore(dayjs('18:00', timeFormat), 'minute') &&
    dutyStart.isBefore(dayjs('18:00', timeFormat), 'minutes')
  ) {
    return 'B';
  } else if (
    time.isBefore(dayjs('23:00', timeFormat), 'minute') &&
    dutyStart.isBefore(dayjs('23:00', timeFormat))
  ) {
    return 'S';
  }
};

export default calcMealsDomDept;
