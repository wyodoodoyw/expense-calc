const includesMeal = (
  meal,
  dutyStart,
  firstDept,
  start,
  end,
  lastArr,
  dutyEnd,
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
  let arrTest = start
    .set('hour', meal.arrTest.slice(0, -2))
    .set('minutes', meal.arrTest.slice(-2));
  let mealEnd = start
    .set('hour', meal.end.slice(0, -2))
    .set('minutes', meal.end.slice(-2));
  const mealTest = start
    .set('hour', meal.test.slice(0, -2))
    .set('minute', meal.test.slice(-2));

  if (meal.canChar === 'S') {
    // console.log(
    //   `arrTest: ${arrTest.tz(defTZ).format(f)}  mealEnd: ${mealEnd.tz(defTZ).format(f)}`,
    // );
    arrTest = arrTest.add(1, 'day');
    mealEnd = mealEnd.add(1, 'day');
    // console.log(
    //   `arrTest: ${arrTest.tz(defTZ).format(f)}  mealEnd: ${mealEnd.tz(defTZ).format(f)}`,
    // );
  }

  if (
    dutyStart.isBefore(mealStart, 'minutes') &&
    firstDept.isBefore(deptTest, 'minutes') &&
    lastArr.isAfter(arrTest, 'minutes') &&
    dutyEnd.isAfter(mealEnd, 'minutes') &&
    mealTest.isBetween(start, end, 'minute', '[]')
  ) {
    check = true;
  } else {
    check = false;
  }

  console.log(
    `checking ${meal.canChar} || dS: ${dutyStart.isBefore(mealStart, 'minutes')} || fD: ${firstDept.isBefore(deptTest, 'minutes')} || s: ${start.tz(defTZ).format(f)} - ${mealTest.tz(defTZ).format(f)} - e: ${end.tz(defTZ).format(f)} || lA: ${lastArr.format(f)} ${lastArr.isAfter(arrTest, 'minutes')} || dE: ${dutyEnd.isAfter(mealEnd, 'minutes')} || inc? ${
      check ? 'yes' : 'no'
    }`,
  );

  if (
    dutyStart.isBefore(mealStart, 'minutes') &&
    firstDept.isBefore(deptTest, 'minutes') &&
    lastArr.isAfter(arrTest, 'minutes') &&
    dutyEnd.isAfter(mealEnd, 'minutes') &&
    mealTest.isBetween(start, end, 'minute', '[]')
  ) {
    return true;
  }
};

export default includesMeal;
