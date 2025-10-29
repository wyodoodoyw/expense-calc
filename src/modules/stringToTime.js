import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// dayjs.extend(utc);
// dayjs.extend(timezone);
// dayjs.tz.setDefault('America/New_York');

const stringToTime = (timeString) => {
  if (timeString) {
    return dayjs()
      .set('hour', timeString.slice(0, -2))
      .set('minute', timeString.slice(-2));
  } else {
    console.log(`Error converting string to dayjs().`);
  }
};

export default stringToTime;
