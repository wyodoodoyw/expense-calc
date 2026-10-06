import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);

const stringToDate = (timeString, dutyDay = 0, stn = 'YYZ') => {
  if (timeString) {
    timeString = timeString.replace(':', '');
    return dayjs('2000-01-01')
      .add(dutyDay, 'day')
      .set('hour', timeString.slice(0, -2))
      .set('minute', timeString.slice(-2))
      .tz(timezone[stn], true);
  } else {
    console.log(`Error converting string to dayjs() ${timeString}.`);
  }
};

export default stringToDate;
