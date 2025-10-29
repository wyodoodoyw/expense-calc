import dayjs from 'dayjs';
import stringToTime from './stringToTime';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);
const timeFormat = 'HHmm';

const calcMealsDomAfterInt = (intArrival, dutyEnd) => {
  const start = stringToTime(intArrival);
  const end = stringToTime(dutyEnd);

  let meals = '';

  if (
    start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
    end.isAfter(dayjs('09:30', timeFormat), 'minutes')
  ) {
    meals += 'B';
  }
  if (
    start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
    end.isAfter(dayjs('13:30', timeFormat), 'minutes')
  ) {
    meals += 'L';
  }
  if (
    start.isBefore(dayjs('17:00', timeFormat), 'minutes') &&
    end.isAfter(dayjs('18:30', timeFormat), 'minutes')
  ) {
    meals += 'D';
  }
  if (
    start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
    end.isAfter(dayjs('01:00', timeFormat), 'minutes') &&
    !end.isBetween(dayjs('01:00', timeFormat), dayjs('22:59', timeFormat))
  ) {
    meals += 'S';
  }

  return meals;
};

export default calcMealsDomAfterInt;
