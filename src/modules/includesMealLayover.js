const includesMealLayover = (meal, day, start, end) => {
  if (!meal || !start || !end) return;

  const defTZ = 'America/Toronto';
  const f = 'DD HH:mm';

  const mealTest = start
    .set('hour', meal.test.slice(0, -2))
    .set('minute', meal.test.slice(-2))
    .add(day, 'day');

  console.log(
    `checking ${meal.canChar} || day: ${day} || start: x${start.tz(defTZ).format(f)} || test: ${mealTest.tz(defTZ).format(f)} ||end: x${end.tz(defTZ).format(f)} ${mealTest.isBetween(start, end, 'minute', '[)') ? 'YES' : 'no'}`,
  );

  if (mealTest.isBetween(start, end, 'minute', '[])')) {
    return true;
  }
};
export default includesMealLayover;
