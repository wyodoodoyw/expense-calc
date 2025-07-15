import { createSlice } from '@reduxjs/toolkit';

export const flightSlice = createSlice({
  name: 'flight',
  initialState: {},
  reducers: {
    updateFlightDeparture: (state, action) => {
      const { index, value } = action.payload;
      state.departureTime = value;
    },

    updateFlightArrival: (state, action) => {
      const { index, value } = action.payload;
      state.arrivalTime = value;
    },
  },
});

// Export the generated action creators for use in components
export const { updateFlightArrival, updateFlightDeparture } =
  flightSlice.actions;

// Export the slice reducer for use in the store configuration
export default flightSlice.reducer;
