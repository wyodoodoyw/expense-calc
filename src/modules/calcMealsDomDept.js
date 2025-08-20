import dayjs from 'dayjs';

const timeFormat = 'HHmm';

const calcMealsDomDept = (dutySrt, deptTime) => {
  const time = dayjs(deptTime, timeFormat);
  const dutyStart = dayjs(dutySrt, timeFormat);

  if (
    time.isBefore(dayjs('08:00', timeFormat), 'minute') &&
    dutyStart.isBefore(dayjs('08:00', timeFormat), 'minutes')
  ) {
    return 'BLDS';
  } else if (
    time.isBefore(dayjs('12:30', timeFormat), 'minute') &&
    dutyStart.isBefore(dayjs('12:30', timeFormat), 'minutes')
  ) {
    return 'LDS';
  } else if (
    time.isBefore(dayjs('18:00', timeFormat), 'minute') &&
    dutyStart.isBefore(dayjs('18:00', timeFormat), 'minutes')
  ) {
    return 'DS';
  } else if (
    time.isBefore(dayjs('23:00', timeFormat), 'minute') &&
    dutyStart.isBefore(dayjs('23:00', timeFormat))
  ) {
    return 'S';
  }
};

export default calcMealsDomDept;
