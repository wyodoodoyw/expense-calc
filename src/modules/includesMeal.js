import stringToDate from './stringToDate.js';
import timezones from '../data/timezones.js';

const includesMeal = (
  meal,
  currDay,
  dutyStart,
  firstDept,
  start,
  end,
  lastArr,
  dutyEnd,
  firstDutyDay,
  lastDutyDay,
  startLoc,
  endLoc,
) => {
  if (!meal || !start || !end) return;

  const defTZ = 'America/Toronto';
  const f = 'DD HH:mm';
  let check;

  const mealStart = start
    .set('hour', meal.start.slice(0, -2))
    .set('minute', meal.start.slice(-2));
  const deptTest = start
    .set('hour', meal.deptTest.slice(0, -2))
    .set('minutes', meal.deptTest.slice(-2));
  const arrTest = start
    .set('hour', meal.arrTest.slice(0, -2))
    .set('minutes', meal.arrTest.slice(-2));
  const mealEnd = start
    .set('hour', meal.end.slice(0, -2))
    .set('minutes', meal.end.slice(-2));
  const mealTest = start
    .set('hour', meal.test.slice(0, -2))
    .set('minute', meal.test.slice(-2));

  if (
    dutyStart.isBefore(mealStart) &&
    firstDept.isBefore(deptTest) &&
    lastArr.isAfter(arrTest) &&
    dutyEnd.isAfter(mealEnd) &&
    mealTest.isBetween(start, end, 'minute', '[]')
  ) {
    check = true;
  } else {
    check = false;
  }

  // console.log(
  //   `checking ${meal.canChar} || dS: ${dutyStart.isBefore(mealStart)} || fD: ${firstDept.isBefore(deptTest)} || s: ${start} - ${mealTest} - e: ${end} || lS: ${lastArr.isAfter(arrTest)} || dE: ${dutyEnd.isAfter(mealEnd)} || ${
  //     check ? 'yes' : 'no'
  //   }`,
  // );
  console.log(
    `checking ${meal.canChar} || dS: ${dutyStart.isBefore(mealStart)} || fD: ${firstDept.isBefore(deptTest)} || s: ${start.tz(defTZ).format(f)} - ${mealTest.tz(defTZ).format(f)} - e: ${end.tz(defTZ).format(f)} || lS: ${lastArr.isAfter(arrTest)} || dE: ${dutyEnd.isAfter(mealEnd)} || inc? ${
      check ? 'yes' : 'no'
    }`,
  );

  if (meal.canChar === 'S') {
    arrTest.add(1, 'day');
    mealEnd.add(1, 'day');
  }
  if (
    dutyStart.isBefore(mealStart) &&
    firstDept.isBefore(deptTest) &&
    lastArr.isAfter(arrTest) &&
    dutyEnd.isAfter(mealEnd) &&
    mealTest.isBetween(start, end, 'minute', '[]')
  ) {
    return true;
  }
};

export default includesMeal;
