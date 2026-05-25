import dayjs from 'dayjs';
import Duration from 'dayjs/plugin/duration';

dayjs.extend(Duration);

const crossesMidnight = (curr) => {
  if (curr.type === 'flight') {
    const start = dayjs()
      .tz()
      .set('hour', curr.departureTime.slice(0, -2))
      .set('minute', curr.departureTime.slice(-2))
      .startOf('minute');

    const midnight = dayjs()
      .tz()
      .set('hour', 23)
      .set('minute', 59)
      .startOf('minute')
      .diff(start, 'minute');
    const dur = dayjs
      .duration({
        hours: curr.flightTime.slice(0, -2),
        minutes: curr.flightTime.slice(-2),
      })
      .asMinutes();
    return midnight < dur;
  } else if (curr.type === 'layover') {
    const start = dayjs()
      .tz()
      .set('hour', curr.layoverStart.slice(0, -2))
      .set('minute', curr.layoverStart.slice(-2))
      .startOf('minute');

    const midnight = dayjs()
      .tz()
      .set('hour', 23)
      .set('minute', 59)
      .startOf('minute')
      .diff(start, 'minute');
    const dur = dayjs
      .duration({
        hours: curr.layoverLength.slice(0, -2),
        minutes: curr.layoverLength.slice(-2),
      })
      .asMinutes();
    return midnight < dur;
  }
};

export default crossesMidnight;
