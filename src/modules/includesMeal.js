import stringToDate from './stringToDate.js';

const includesMeal = (
  meal,
  day,
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
  console.log(
    `dutyStart: ${dutyStart.tz('America/Toronto').format('YYYY-MM-DD HH:mm')} --> dutyEnd: ${dutyEnd.tz('America/Toronto').format('YYYY-MM-DD HH:mm')}`,
  );
  console.log(
    `checking ${meal.canChar} || day: ${day} || start: x${start.tz('America/Toronto').format('HH:mm')} || end: x${end.tz('America/Toronto').format('HH:mm')} || first: ${firstDutyDay} || last: ${lastDutyDay}`,
  );
  console.log(
    `${meal.canChar} deptTest: ${stringToDate(meal.deptTest, day).tz('America/Toronto').format('YYYY-MM-DD HH:mm')} || arrTest: ${stringToDate(meal.arrTest, day).tz('America/Toronto').format('YYYY-MM-DD HH:mm')}`,
  );
  if (
    dutyStart.isBefore(stringToDate(meal.deptTest, day)) &&
    dutyEnd.isAfter(stringToDate(meal.arrTest, day)) &&
    stringToDate(meal.test, day).isBetween(start, end, 'minute', '[]')
  ) {
    return true;
  }
};

export default includesMeal;
