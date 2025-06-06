import { createSlice } from '@reduxjs/toolkit';

export const dutyDaySlice = createSlice({
  name: 'dutyDay',
  initialState: {},
  reducers: {
    updatePairing: (state, action) => ({
      // update pairing info with payload
      // console.log(`payload: ${JSON.stringify(action.payload)}`);
      ...state,
      id: action.payload.id,
      dutyDayStart: action.payload.dutyDayStart,
      dutyDayEnd: action.payload.dutyDayEnd,
    }),
  },
});

// Export the generated action creators for use in components
export const { updatePairing } = dutyDaySlice.actions;

// Export the slice reducer for use in the store configuration
export default dutyDaySlice.reducer;
