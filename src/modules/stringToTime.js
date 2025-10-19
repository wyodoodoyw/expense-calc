import dayjs from 'dayjs';

const stringToTime = (timeString) => {
  return dayjs()
    .set('hour', timeString.slice(0, -2))
    .set('minute', timeString.slice(-2));
};

export default stringToTime;
