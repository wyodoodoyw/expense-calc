import { createSlice } from '@reduxjs/toolkit';

export const pairingSlice = createSlice({
  name: 'pairing',
  initialState: {
    // id: 0,
    // pairingNumber: 'X5432',
    // pairingOperates: 'JFM01-AMY31',
  },
  reducers: {
    updatePairing: (state, action) => ({
      // update pairing info with payload
      // ...state,
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
      console.log(`processSequence: ${JSON.stringify(action.payload)}`);
      for (let i = 0; i < action.payload.length; i++) {
        state.sequence.push(action.payload[i]);
        if (action.payload[i][0].hotelInfo) {
          state.sequence[i] = action.payload[i][0];
        }

        if (action.payload[i][0].aircraft) {
          state.sequence[i] = action.payload[i].map((flight) => flight);
        }
      }
    },
  },
});

// Export the generated action creators for use in components
export const { updatePairing, processSequence } = pairingSlice.actions;

// Export the slice reducer for use in the store configuration
export default pairingSlice.reducer;
