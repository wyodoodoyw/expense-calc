import dayjs from 'dayjs';

const stringToTime = (timeString) => {
  timeString = timeString.replace(':', '');
  if (timeString) {
    return dayjs()
      .set('hour', timeString.slice(0, -2))
      .set('minute', timeString.slice(-2));
  } else {
    console.log(`Error converting string to dayjs().`);
  }
};

export default stringToTime;
