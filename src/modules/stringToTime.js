import dayjs from 'dayjs';

const stringToTime = (timeString) => {
  // console.log(
  //   `${timeString} ${timeString.slice(0, -2)} ${timeString.slice(-2)}`,
  // );
  if (timeString) {
    timeString = timeString.replace(':', '');
    return dayjs()
      .set('hour', timeString.slice(0, -2))
      .set('minute', timeString.slice(-2));
  } else {
    console.log(`Error converting string to dayjs().`);
  }
};

export default stringToTime;
