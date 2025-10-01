import { current, createSlice } from '@reduxjs/toolkit';

export const flightSlice = createSlice({
  name: 'flight',
  initialState: {
    aircraft: '',
    arrivalAirport: '',
    arrivalTime: '',
    daysOfWeek: '',
    departureAirport: '',
    departureTime: '',
    flightNumber: '',
    flightTime: '',
    index: 0,
    isDeadhead: false,
  },
  reducers: {
    initializeFlight: (state, action) => ({
      id: action.payload.index,
      aircraft: action.payload.aircraft,
      arrivalAirport: action.payload.arrivalAirport,
      arrivalTime: action.payload.arrivalTime,
      daysOfWeek: action.payload.daysOfWeek,
      departureAirport: action.payload.departureAirport,
      departureTime: action.payload.departureTime,
      flightNumber: action.payload.flightNumber,
      flightTime: action.payload.flightTime,
      isDeadhead: action.payload.isDeadhead,
    }),

    updateFlightDeparture: (state, action) => {
      const { index, value } = action.payload;
      let flightToUpdate = state.find((flight) => flight.index === index);
      // const flightToUpdate = state.pairing.sequence[index];
      console.log(current(state));
      flightToUpdate.departureTime = value;
    },

    updateFlightArrival: (state, action) => {
      // const { index, value } = action.payload;
      // const flightToUpdate = state.find((flight) => flight.index === index);
      // console.log(flightToUpdate);
      // flightToUpdate.arrivalTime = value;
    },
  },
});

// Export the generated action creators for use in components
export const { initializeFlight, updateFlightArrival, updateFlightDeparture } =
  flightSlice.actions;

// Export the slice reducer for use in the store configuration
export default flightSlice.reducer;
