import calcMealsIntDept from './calcMealsIntDept';
import calcMealsIntArrival from './calcMealsIntArrival';
import calcLayoverDays from './calcLayoverDays';

const calcMealsIntLayover = (start, end, length, collector) => {
  const startMeals = calcMealsIntArrival(start);
  // console.log(`startMeals: ${startMeals}`);
  if (startMeals) {
    // collector((prev) => [
    //   ...prev,
    //   {
    //     index: prev.length,
    //     meals: calcMealsIntArrival(start),
    //     station: 'int',
    //   },
    // ]);
    collector.push({
      index: collector.length,
      meals: calcMealsIntArrival(start),
      station: 'int',
    });
  }

  // Adjust for full days on layover
  for (let i = 1; i <= calcLayoverDays(start, end, length); i++) {
    // collector((prev) => [
    //   ...prev,
    //   { index: prev.length, meals: 'BLDS', station: 'int' },
    // ]);
    collector.push({
      index: collector.length,
      meals: 'BLDS',
      station: 'int',
    });
  }
  const endMeals = calcMealsIntDept(end);
  // console.log(`endMeals: ${endMeals}`);
  if (endMeals) {
    // collector((prev) => [
    //   ...prev,
    //   { index: prev.length, meals: calcMealsIntDept(end), station: 'int' },
    // ]);
    collector.push({
      index: collector.length,
      meals: calcMealsIntDept(end),
      station: 'int',
    });
  }
  return collector;
};

export default calcMealsIntLayover;
