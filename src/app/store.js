import { configureStore } from '@reduxjs/toolkit';
import pairingReducer from '../features/pairing/pairingSlice';

export const store = configureStore({
  reducer: {
    pairing: pairingReducer,
  },
});
