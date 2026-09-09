import stringToDate from './stringToDate.js';
// import { b, l, d, s } from '../data/mealConstants';

const includesMealLayover = (meal, day, start, end) => {
  if (!meal || !start || !end) return;

  console.log(
    `checking ${meal.canChar} || start: x${start
      .tz('America/Toronto')
      .format(
        'DD HH:mm',
      )} || test: ${stringToDate(meal.test, day).tz('America/Toronto').format('DD HH:mm')} ||end: x${end.tz('America/Toronto').format('DD HH:mm')} ${stringToDate(meal.test, day).isBetween(start, end, 'minute', '[]') ? 'yes' : 'no'}`,
  );
  if (stringToDate(meal.test, day).isBetween(start, end, 'minute', '[]')) {
    return true;
  }
};
export default includesMealLayover;
