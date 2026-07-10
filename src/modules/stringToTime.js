import dayjs from 'dayjs';

const stringToTime = (timeString) => {
  if (typeof timeString !== 'string') return null;

  if (timeString) {
    timeString = timeString.replace(':', '');
    // console.log(`timeString: ${timeString}`);
    // console.log(
    //   `dayjs: ${dayjs()
    //     .set('hour', timeString.slice(0, -2))
    //     .set('minute', timeString.slice(-2))
    //     .format('HH:mm')}`,
    // );
    return dayjs()
      .set('hour', timeString.slice(0, -2))
      .set('minute', timeString.slice(-2));
  } else {
    console.log(`Error converting string to dayjs() ${timeString}.`);
  }
};

export default stringToTime;
