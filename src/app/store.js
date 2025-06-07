import { configureStore } from '@reduxjs/toolkit';
import pairingReducer from '../features/pairing/pairingSlice';
// import dutyDayReducer from '../features/dutyDay/dutyDaySlice';
// import flightReducer from '../features/flight/flightSlice';
// import layoverReducer from '../features/layover/layoverSlice';

export const store = configureStore({
  reducer: {
    pairing: pairingReducer,
    // dutyDay: dutyDayReducer,
    // flight: flightReducer,
    // layover: layoverReducer,
  },
});
