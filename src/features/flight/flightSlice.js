import { createSlice } from '@reduxjs/toolkit';

export const flightSlice = createSlice({
  name: 'flight',
  initialState: {
    // index: null,
    // aircraft: null,
    // arrivalAirport: null,
    // arrivalTime: null,
    // daysOfWeek: [],
    // departureAirport: null,
    // departureTime: null,
    // dutyEnd: null,
    // dutyStart: null,
    // dutyTime: null,
    // flightNumber: null,
    // flightTime: null,
    // isDeadhead: false,
    // layoverLength: null,
    // mealsOnboard: [],
  },
  reducers: {
    updateFlight: (state, action) => ({
      index: action.payload.index,
      aircraft: action.payload.aircraft,
      arrivalAirport: action.payload.arrivalAirport,
      arrivalTime: action.payload.arrivalTime,
      daysOfWeek: action.payload.daysOfWeek,
      departureAirport: action.payload.departureAirport,
      departureTime: action.payload.departureTime,
      dutyEnd: action.payload.dutyEnd,
      dutyStart: action.payload.dutyStart,
      dutyTime: action.payload.dutyTime,
      flightNumber: action.payload.flightNumber,
      flightTime: action.payload.flightTime,
      isDeadhead: action.payload.isDeadhead || false,
      layoverLength: action.payload.layoverLength || null,
      mealsOnboard: action.payload.mealsOnboard || [],
    }),
  },
});

// Export the generated action creators for use in components
export const { updatePairing } = flightSlice.actions;

// Export the slice reducer for use in the store configuration
export default flightSlice.reducer;
