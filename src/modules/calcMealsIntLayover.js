import calcMealsIntDept from './calcMealsIntDept';
import calcMealsIntArrival from './calcMealsIntArrival';
import calcLayoverDays from './calcLayoverDays';

const calcMealsIntLayover = (start, end, length, setMeals) => {
  const startMeals = calcMealsIntArrival(start);
  console.log(`startMeals: ${startMeals}`);
  if (startMeals) {
    setMeals((prev) => [
      ...prev,
      {
        index: prev.length,
        meals: calcMealsIntArrival(start),
        station: 'int',
      },
    ]);
  }

  // Adjust for full days on layover
  for (let i = 1; i <= calcLayoverDays(start, end, length); i++) {
    setMeals((prev) => [
      ...prev,
      { index: prev.length, meals: 'BLDS', station: 'int' },
    ]);
  }
  const endMeals = calcMealsIntDept(end);
  console.log(`endMeals: ${endMeals}`);
  if (endMeals) {
    setMeals((prev) => [
      ...prev,
      { index: prev.length, meals: calcMealsIntDept(end), station: 'int' },
    ]);
  }
};

export default calcMealsIntLayover;
