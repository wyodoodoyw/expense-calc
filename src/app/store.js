import { configureStore } from '@reduxjs/toolkit';
import pairingReducer from '../features/pairing/pairingSlice';
// import flightReducer from '../features/flight/flightSlice';
// import layoverReducer from '../features/layover/layoverSlice';
import expensesTableReducer from '../features/expensesTable/expensesTableSlice';
import loadingReducer from '../features/loading/loadingSlice';

export const store = configureStore({
  reducer: {
    pairing: pairingReducer,
    // flight: flightReducer,
    // layover: layoverReducer,
    expensesTable: expensesTableReducer,
    loading: loadingReducer,
  },
});
