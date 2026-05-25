import dayjs, { duration } from 'dayjs';
import Duration from 'dayjs/plugin/duration';

dayjs.extend(Duration);

const addDuration = (oldDur, durationToAdd) => {
  durationToAdd = durationToAdd.replace(':', '');

  const hours = durationToAdd.slice(0, -2);
  const minutes = durationToAdd.slice(-2);

  return oldDur
    .add(hours * 60, 'minutes')
    .add(minutes, 'minutes')
    .toMinutes();
};

export default addDuration;
