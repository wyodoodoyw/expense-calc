/**
 * @param {Array} meals - array of { index, meals: 'BLDS', station: 'YYZ'|'int' }
 * @param {Object} caExpenses - { breakfast, lunch, dinner, snack }
 * @param {Object} intlExpenses - { breakfast, lunch, dinner, snack }
 * @param {Number} numLayovers
 * @returns {Number} total allowance rounded to 2 decimals
 */
export default function calculateDisplayTotal(
  meals,
  caExpenses,
  intlExpenses,
  numLayovers
) {
  try {
    if (!Array.isArray(meals)) return 0;
    const toNum = (v) => {
      const n = Number(v);
      return Number.isNaN(n) ? 0 : n;
    };

    let total = 0;

    meals.forEach((m) => {
      if (!m || !m.meals) return;
      const mealStr = m.meals || '';
      if (m.station === 'YYZ') {
        total += mealStr.includes('B') ? toNum(caExpenses.breakfast) : 0;
        total += mealStr.includes('L') ? toNum(caExpenses.lunch) : 0;
        total += mealStr.includes('D') ? toNum(caExpenses.dinner) : 0;
        total += mealStr.includes('S') ? toNum(caExpenses.snack) : 0;
      } else if (m.station === 'int') {
        total += mealStr.includes('B') ? toNum(intlExpenses.breakfast) : 0;
        total += mealStr.includes('L') ? toNum(intlExpenses.lunch) : 0;
        total += mealStr.includes('D') ? toNum(intlExpenses.dinner) : 0;
        total += mealStr.includes('S') ? toNum(intlExpenses.snack) : 0;
      }
    });
    total += (Number(numLayovers) || 0) * 5.05;

    return Number(total.toFixed(2));
  } catch (err) {
    console.error('calcDisplayTotal error:', err);
    return 0;
  }
}
