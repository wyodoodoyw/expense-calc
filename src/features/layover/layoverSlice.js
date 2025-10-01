import { createSlice } from '@reduxjs/toolkit';

export const layoverSlice = createSlice({
  name: 'layover',
  initialState: {},
  reducers: {
    // Move layover meals logic here so can handle a pairing with muliple international layovers??
  },
});

// Export the generated action creators for use in components
// export const { } = layoverSlice.actions;

// Export the slice reducer for use in the store configuration
export default layoverSlice.reducer;
