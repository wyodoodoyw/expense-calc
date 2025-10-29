import dayjs from 'dayjs';
import stringToTime from './stringToTime';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);
const timeFormat = 'HHmm';

const getMeal = (dutyStart, departure) => {
  const duty = stringToTime(dutyStart);
  const dept = stringToTime(departure);
  // console.log(dept);

  let meals = '';

  if (
    duty.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
    dept.isAfter(dayjs('09:30', timeFormat), 'minutes')
  ) {
    meals += 'B';
  }
  if (
    duty.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
    dept.isAfter(dayjs('13:30', timeFormat), 'minutes')
  ) {
    meals += 'L';
  }
  if (
    duty.isBefore(dayjs('18:00', timeFormat), 'minutes') &&
    dept.isAfter(dayjs('18:30', timeFormat), 'minutes')
  ) {
    meals += 'D';
  }
  if (
    duty.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
    dept.isAfter(dayjs('01:00', timeFormat), 'minutes') &&
    !dept.isBetween(dayjs('01:00', timeFormat), dayjs('05:00', timeFormat))
  ) {
    meals += 'S';
  }
  return meals;
};

const calcMealsDomBeforeInt = (dutyStart, domesticDept, internationalDept) => {
  // console.log(`${dutyStart}, ${domesticDept}, ${internationalDept}`);
  let meals = '';

  //First Meal
  if (domesticDept) {
    const result = getMeal(dutyStart, domesticDept);
    if (result) {
      meals += result;
    }
  }

  //Last Meal
  if (internationalDept) {
    const result = getMeal(dutyStart, internationalDept);
    if (result) {
      meals += result;
    }
  }
  // console.log(`meals: ${meals}`);
  return meals;
};

export default calcMealsDomBeforeInt;
