import { createSlice } from '@reduxjs/toolkit';
// import dayjs from 'dayjs';
import american_airport_codes from '../../data/american_airport_codes';
// import stringToTime from '../../modules/stringToTime';
// import timeDifference from '../../modules/calculateTimeDifference';
// import calculateTimeDifference from '../../modules/calculateTimeDifference';
import adjustLayoverLength from '../../modules/adjustLayoverLength';

const numLayovers = (s) => {
  let layoverCount = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i].hotelInfo) {
      layoverCount++;
    }
  }
  return layoverCount;
};

// STATE //

export const pairingSlice = createSlice({
  name: 'pairing',
  initialState: {},
  reducers: {
    initializePairing: (state, action) => ({
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
      sequence: action.payload.sequence || [],
      layoverCount: 0,
      calculatedMeals: '',
      version: 0,
    }),

    processSequence: (state, action) => {
      for (let i = 0; i < action.payload.length; i++) {
        state.sequence.push(action.payload[i]);
      }
      state.layoverCount = numLayovers(state.sequence);
    },

    updateFlightDeparture: (state, action) => {
      const { index, value } = action.payload;

      // update flight
      const f = state.sequence.find((f) => f.index === index);
      f.departureTime = value;

      // update previous layover
      const l = state.sequence.find((l) => l.index === index - 1);
      l.layoverLength = adjustLayoverLength(
        value,
        l.layoverEnd,
        l.layoverLength
      );
      l.layoverEnd = value;
    },

    updateFlightArrival: (state, action) => {
      const { index, value } = action.payload;

      // update flight
      const f = state.sequence.find((f) => f.index === index);
      f.arrivalTime = value;

      // update next layover
      const l = state.sequence.find((l) => l.index === index + 1);
      l.layoverLength = adjustLayoverLength(
        l.layoverStart,
        value,
        l.layoverLength
      );
      l.layoverStart = value;
    },

    // updateDutyDayEnd: (state, action) => {
    //   const { index, value } = action.payload;
    //   state.dutyDays[index].dutyDayEnd = value;
    // },

    isTransborder: (state) => {
      const s = state.sequence;
      for (let i = 0; i < s.length; i++) {
        if (
          american_airport_codes.includes(s[i].arrivalAirport) ||
          american_airport_codes.includes(s[i].layoverStation)
        ) {
          state.isTransborder = true;
        }
      }
      state.isTransborder = false;
    },
  },
});

// Export the generated action creators for use in components
export const {
  initializePairing,
  processSequence,
  // updateDutyDayEnd,
  updateFlightDeparture,
  updateFlightArrival,
  isTransborder,
} = pairingSlice.actions;

// Export the slice reducer for use in the store configuration
export default pairingSlice.reducer;
