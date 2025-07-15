import { configureStore } from '@reduxjs/toolkit';
import pairingReducer from '../features/pairing/pairingSlice';
import flightReducer from '../features/flight/flightSlice';
import expenseTableReducer from '../features/expenseTable/expenseTableSlice';

export const store = configureStore({
  reducer: {
    pairing: pairingReducer,
    flight: flightReducer,
    expenseTable: expenseTableReducer,
  },
});
