import { createSlice } from '@reduxjs/toolkit';

// Define the initial value for the slice state
// const initialState = {
// id: 1,
// pairingNumber: 'T5001',
// pairingOperates: '27OCT-31OCT',
// pairingDates: ['27', '28', '29', '30', '31'],
// pairingCrew: ['P 01', 'FA05', 'GJ01', 'GY01', 'BL02'],
// pairingPurser: '01',
// pairingFA: '05',
// pairingGP: '01',
// pairingGY: '01',
// pairingBL: '02',
// tafb: '4405',
// totalCredit: '1525',
// totalDuty: '1810',
// blockCredit: '1525',
// totalAllowance: '305.68',
// cicoAmount: '5.05',
// };

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
      // console.log(`payload: ${JSON.stringify(action.payload)}`);
      ...state,
      // {
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
    }),
    // pairingDates: ['27', '28', '29', '30', '31'],
    // pairingCrew: ['P 01', 'FA05', 'GJ01', 'GY01', 'BL02'],
    // pairingPurser: '01',
    // pairingFA: '05',
    // pairingGP: '01',
    // pairingGY: '01',
    // pairingBL: '02',
    // tafb: '4405',
    // totalCredit: '1525',
    // totalDuty: '1810',
    // blockCredit: '1525',
    // totalAllowance: '305.68',
    // cicoAmount: '5.05',
    // );
  },
  // },
});

// Export the generated action creators for use in components
export const { updatePairing } = pairingSlice.actions;

// Export the slice reducer for use in the store configuration
export default pairingSlice.reducer;
