import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);

const stringToDate = (timeString, dutyDay = 0) => {
  if (timeString) {
    timeString = timeString.replace(':', '');
    return dayjs
      .tz('2000-01-01', 'America/Toronto')
      .add(dutyDay, 'day')
      .set('hour', timeString.slice(0, -2))
      .set('minute', timeString.slice(-2));
  } else {
    console.log(`Error converting string to dayjs() ${timeString}.`);
  }
};

export default stringToDate;
