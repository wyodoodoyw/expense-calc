import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  message: 'Loading...',
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload.isLoading;
      state.message = action.payload.message || 'Loading...';
    },
    clearLoading: (state) => {
      state.isLoading = false;
      state.message = 'Loading...';
    },
  },
});

export const { setLoading, clearLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
