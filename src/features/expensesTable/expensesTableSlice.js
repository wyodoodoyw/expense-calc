import { createSlice } from '@reduxjs/toolkit';

const getExpenseAmounts = (stn) => {
  const request = window.indexedDB.open('ExpensesDB', 1);
  request.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction(['expenses'], 'readonly');
    const expensesStore = tx.objectStore('expenses');
    const airportCodesIndex = expensesStore.index('airport_codes');
    const request2 = airportCodesIndex.get(stn);
    request2.onsuccess = () => {
      if (request2.result) {
        const exp = request2.result.expenses;
        // console.log(`Expense fetched for ${stn}: ${JSON.stringify(exp)}`);

        switch (stn) {
          case 'YYZ':
            return {
              breakfast: exp.breakfast,
              lunch: exp.lunch,
              dinner: exp.dinner,
              snack: exp.snack,
            };

          case 'MCO':
            return {
              breakfast: exp.breakfast,
              lunch: exp.lunch,
              dinner: exp.dinner,
              snack: exp.snack,
            };

          default:
            return {
              breakfast: exp.breakfast,
              lunch: exp.lunch,
              dinner: exp.dinner,
              snack: exp.snack,
            };
        }
      }
    };
    request.onerror = (event) => {
      console.log(`!DB Error: ${event.target.error}`);
    };
    tx.oncomplete = () => {
      db.close();
    };
  };
};

export const expensesTableSlice = createSlice({
  name: 'expenseTable',
  initialState: {
    caAllowance: getExpenseAmounts('YYZ'),
    usAllowance: getExpenseAmounts('MCO'),
    intAllowance: null,
  },
  reducers: {
    getIntAllowances: (state, action) => {
      const stn = action.payload;
      state.intAllowance = getExpenseAmounts(stn);
    },
  },
});

// Export the generated action creators for use in components
export const { getIntAllowances } = expensesTableSlice.actions;

// Export the slice reducer for use in the store configuration
export default expensesTableSlice.reducer;
