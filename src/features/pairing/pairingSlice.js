import { createSlice } from '@reduxjs/toolkit';

export const pairingSlice = createSlice({
  name: 'pairing',
  initialState: {},
  reducers: {
    updatePairing: (state, action) => ({
      id: action.payload.id,
      pairingNumber: action.payload.pairingNumber,
      pairingOperates: action.payload.pairingOperates,
      pairingPurser: action.payload.pairingPurser,
      pairingFA: action.payload.pairingFA,
      pairingBL: action.payload.pairingBL,
      pairingGP: action.payload.pairingGP,
      pairingGY: action.payload.pairingGY,
      pairingDates: action.payload.pairingDates,
      pairingLanguages: action.payload.pairingLanguages,
      blockCredit: action.payload.blockCredit,
      cicoAmount: action.payload.cicoAmount,
      tafb: action.payload.tafb,
      totalAllowance: action.payload.totalAllowance,
      totalCredit: action.payload.totalCredit,
      totalDuty: action.payload.totalDuty,
      //
      flights: action.payload.flights || [],
      sequence: action.payload.sequence || [],
    }),

    processSequence: (state, action) => {
      for (let i = 0; i < action.payload.length; i++) {
        state.sequence.push(action.payload[i]);
        //Layover
        if (action.payload[i].hotelInfo) {
          // state.sequence[i] = action.payload[i];
        }
        // Flight
        if (action.payload[i].aircraft) {
          // state.sequence[i] = action.payload[i].map((flight) => flight);
        }
      }
    },
  },
});

// Export the generated action creators for use in components
export const { updatePairing, processSequence } = pairingSlice.actions;

// Export the slice reducer for use in the store configuration
export default pairingSlice.reducer;
