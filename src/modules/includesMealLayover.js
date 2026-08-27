import stringToDate from './stringToDate.js';
// import { b, l, d, s } from '../data/mealConstants';

const includesMealLayover = (meal, day, start, end) => {
  if (!meal || !start || !end) return;

  console.log(
    `checking ${meal.canChar} || day: ${day} || start: x${start
      .tz('America/Toronto')
      .format('HH:mm')} || end: x${end.tz('America/Toronto').format('HH:mm')}`,
  );
  if (stringToDate(meal.test, day).isBetween(start, end, 'minute', '[]')) {
    return true;
  }
};
export default includesMealLayover;
