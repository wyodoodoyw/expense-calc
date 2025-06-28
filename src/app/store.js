import { configureStore } from '@reduxjs/toolkit';
import pairingReducer from '../features/pairing/pairingSlice';
import expenseTableReducer from '../features/expenseTable/expenseTableSlice';

export const store = configureStore({
  reducer: {
    pairing: pairingReducer,
    expenseTable: expenseTableReducer,
  },
});
