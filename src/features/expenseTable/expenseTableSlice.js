import { createSlice } from '@reduxjs/toolkit';

export const expenseTableSlice = createSlice({
  name: 'expenseTable',
  initialState: {
    caAllowance: null,
    usAllowance: null,
  },
  reducers: {
    updateCaTotal: (state, action) => {
      const { index, value } = action.payload;
      state.caAllowance = value;
    },

    updateUsTotal: (state, action) => {
      const { index, value } = action.payload;
      state.usAllowance = value;
    },
  },
});

// Export the generated action creators for use in components
export const { updateCaTotal, updateUsTotal } = expenseTableSlice.actions;

// Export the slice reducer for use in the store configuration
export default expenseTableSlice.reducer;
