const calculateDisplayTotal = (
  meals,
  caExpenses,
  intlExpenses,
  numLayovers,
  setDisplayTotal
) => {
  try {
    let dispTotal = 0;
    for (let i = 0; i < meals.length; i++) {
      if (meals[i].station === 'YYZ') {
        dispTotal +=
          (meals[i].meals.includes('B') && Number(caExpenses.breakfast)) +
          (meals[i].meals.includes('L') && Number(caExpenses.lunch)) +
          (meals[i].meals.includes('D') && Number(caExpenses.dinner)) +
          (meals[i].meals.includes('S') && Number(caExpenses.snack));
      } else if (meals[i].station === 'int') {
        dispTotal +=
          (meals[i].meals.includes('B') && Number(intlExpenses.breakfast)) +
          (meals[i].meals.includes('L') && Number(intlExpenses.lunch)) +
          (meals[i].meals.includes('D') && Number(intlExpenses.dinner)) +
          (meals[i].meals.includes('S') && Number(intlExpenses.snack));
      }
    }
    dispTotal += numLayovers * 5.05;
    setDisplayTotal(dispTotal.toFixed(2));
    return;
  } catch (err) {
    console.log(`Error: ${err}`);
  }
};

export default calculateDisplayTotal;
