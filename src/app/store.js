import { configureStore } from '@reduxjs/toolkit';
import pairingReducer from '../features/pairing/pairingSlice';
// import flightReducer from '../features/flight/flightSlice';
// import expensesTableReducer from '../features/expensesTable/expensesTableSlice';

export const store = configureStore({
  reducer: {
    pairing: pairingReducer,
    // flight: flightReducer,
    // expensesTable: expensesTableReducer,
  },
});
