import { createSlice } from '@reduxjs/toolkit';

export const flightSlice = createSlice({
  name: 'flight',
  initialState: {},
  reducers: {
    intializeFlight: (state, action) => ({
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

    updateFlightDeparture: (state, action) => {
      const { index, value } = action.payload;
      state.sequence[index].departureTime = value;
    },

    updateFlightArrival: (state, action) => {
      const { index, value } = action.payload;
      state.sequence[index].arrivalTime = value;
    },
  },
});

// Export the generated action creators for use in components
export const { initializeFlight, updateFlightDeparture, updateFlightArrival } =
  flightSlice.actions;

// Export the slice reducer for use in the store configuration
export default flightSlice.reducer;
