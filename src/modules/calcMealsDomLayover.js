import calcMealsDomDept from './calcMealsDomDept';
import calcMealsDomArrival from './calcMealsDomArrival';
import calcLayoverDays from './calcLayoverDays';

const calcMealsDomLayover = (start, end, length) => {
  const collector = [];

  const startMeals = calcMealsDomArrival(start);
  if (startMeals) {
    collector.push({
      index: collector.length,
      meals: calcMealsDomArrival(start),
      station: 'YYZ',
    });
  }

  // Adjust for full days on layover
  for (let i = 1; i <= calcLayoverDays(start, end, length); i++) {
    collector.push({
      index: collector.length,
      meals: 'BLDS',
      station: 'YYZ',
    });
  }
  const endMeals = calcMealsDomDept(end);
  if (endMeals) {
    collector.push({
      index: collector.length,
      meals: calcMealsDomDept(end),
      station: 'YYZ',
    });
  }
  return collector;
};

export default calcMealsDomLayover;
