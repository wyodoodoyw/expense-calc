import stringToDate from './stringToDate.js';

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
) => {
  if (!meal || !start || !end) return;

  let check;

  if (
    dutyStart.isBefore(stringToDate(meal.start, currDay)) &&
    firstDept.isBefore(stringToDate(meal.deptTest, currDay)) &&
    lastArr.isAfter(stringToDate(meal.arrTest, currDay)) &&
    dutyEnd.isAfter(stringToDate(meal.end, currDay)) &&
    stringToDate(meal.test, currDay).isBetween(start, end, 'minute', '[]')
  ) {
    check = true;
  } else {
    check = false;
  }

  console.log(
    `checking ${meal.canChar} || start: ${start.tz('America/Toronto').format('DD HH:mm')} || test: ${stringToDate(meal.test, currDay).tz('America/Toronto').format('DD HH:mm')} ||end: ${end.tz('America/Toronto').format('DD HH:mm')} ${
      check ? 'yes' : 'no'
    }`,
  );
  if (meal.canChar === 'S') {
    if (
      dutyStart.isBefore(stringToDate(meal.start, currDay)) &&
      firstDept.isBefore(stringToDate(meal.deptTest, currDay)) &&
      lastArr.isAfter(stringToDate(meal.arrTest, currDay + 1)) &&
      dutyEnd.isAfter(stringToDate(meal.end, currDay + 1)) &&
      stringToDate(meal.test, currDay).isBetween(start, end, 'minute', '[]')
    ) {
      return true;
    }
  } else {
    if (
      dutyStart.isBefore(stringToDate(meal.start, currDay)) &&
      firstDept.isBefore(stringToDate(meal.deptTest, currDay)) &&
      lastArr.isAfter(stringToDate(meal.arrTest, currDay)) &&
      dutyEnd.isAfter(stringToDate(meal.end, currDay)) &&
      stringToDate(meal.test, currDay).isBetween(start, end, 'minute', '[]')
    ) {
      return true;
    }
  }
};

export default includesMeal;
