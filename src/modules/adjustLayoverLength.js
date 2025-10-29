import dayjs from 'dayjs';
import stringToTime from './stringToTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const calculateTimeDifference = (updatedTime, prevTime) => {
  const updatedTimeDayJs = stringToTime(updatedTime);
  const prevTimeDayJs = stringToTime(prevTime);
  return updatedTimeDayJs.diff(prevTimeDayJs);
};

const adjustLayoverLength = (updatedTime, prevTime, layoverLength) => {
  const difference = dayjs.duration(
    calculateTimeDifference(updatedTime, prevTime)
  );

  const layoverHours = Number(layoverLength.slice(0, 2));
  const layoverMinutes = Number(layoverLength.slice(-2));
  const layoverDays = Math.floor(layoverHours / 24);
  const layoverHoursRemaining = layoverHours % 24;

  const layoverDuration = dayjs.duration({
    days: layoverDays,
    hours: layoverHoursRemaining,
    minutes: layoverMinutes,
  });

  const result = layoverDuration.add(difference);
  return `${result.days() * 24 + result.hours()}${result
    .minutes()
    .toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`;
};

export default adjustLayoverLength;
