import canadian_airport_codes from '../data/canadian_airport_codes';
import international_airport_codes from '../data/international_airport_codes';
import addDutyDuration from './addDutyDuration';

export default function getMealsFromSequenceDom(seq = []) {
  // Always return an object so callers can destructure safely
  if (!Array.isArray(seq) || seq.length === 0) {
    return { meals: [], station: '' };
  }
  const meals = [{ index: 0, meals: 'BLDS', station: 'YYZ' }];
  const station = 'YYZ';

  // push meals to meal array
  const pushMeal = (mealStr, st = 'int') => {
    if (!mealStr) return;
    meals.push({
      index: meals.length,
      meals: mealStr,
      station: st,
    });
  };

  const pushMeals = (arr) => {
    if (Array.isArray(arr)) {
      arr.forEach((m) => {
        if (typeof m === 'string') pushMeal(m, 'YYZ');
        else if (m && m.meals) pushMeal(m.meals, m.station || 'YYZ');
      });
    }
  };

  //--- STEP 1: Calculate meals for the first day
  //--- STEP 2: Calculate meals for full days
  //--- STEP 3: Calculate meals for the final day
  //--- STEP 4: Update meals for any flight arriving or leaving USA

  if (meals) {
    // console.log(`{meals, station}: ${JSON.stringify(meals, station)}`);
    return { meals, station };
  } else {
    return;
  }
}
