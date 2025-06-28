import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

const timeFormat = 'HH:mm';

const getDutyStart = (sequence, firstFlight, aircraft) => {
  let dutyDayStart = dayjs()
    .set('hour', sequence.departureTime.slice(0, -2))
    .set('minute', sequence.departureTime.slice(0 - 2))
    .subtract(1, 'hour');
  if (firstFlight) {
    if (aircraft === '767' || aircraft === '788') {
      dutyDayStart = dutyDayStart.subtract(10, 'minutes');
    } else if (aircraft === '330' || aircraft === '789' || aircraft === '772') {
      dutyDayStart = dutyDayStart.subtract(15, 'minutes');
    } else if (aircraft === '773') {
      dutyDayStart = dutyDayStart.subtract(20, 'minutes');
    } else if (aircraft === '77P') {
      dutyDayStart = dutyDayStart.subtract(25, 'minutes');
    }
  }
  return dutyDayStart.format('HHmm');
};

const getDutyDayEnd = (sequence) => {
  const dutyDayEnd = dayjs()
    .set('hour', sequence.arrivalTime.slice(0, -2))
    .set('minute', sequence.arrivalTime.slice(-2))
    .add(15, 'minutes')
    .format('HHmm');
  return dutyDayEnd;
};

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
      dutyDays: [],
      // caAllowance: null,
      // usAllowance: null,
    }),

    processSequence: (state, action) => {
      // TURN
      const processTurn = (sequence) => {
        const aircraft = sequence[0].aircraft;
        const dutyDay = {
          index: 0,
          dutyDayStart: getDutyStart(sequence[0], true, aircraft),
          dutyDayEnd: getDutyDayEnd(sequence[1]),
          flightIndices: sequence.map((flight) => flight.index),
        };
        return dutyDay;
      };

      // MULTI-LEG DAY
      const processMultiLegDay = (sequence) => {
        const aircraft = sequence[0].aircraft;
        const lastIndex = sequence.length - 1;
        const dutyDay = {
          index: 0,
          dutyDayStart: getDutyStart(sequence[0], aircraft),
          dutyDayEnd: getDutyDayEnd(sequence[lastIndex]),
          flightIndices: sequence.map((flight) => flight.index),
        };
        return dutyDay;
      };

      // OTHER DUTY DAYS
      const processDutyDay = (sequence) => {
        const aircraft = sequence[0].aircraft;
        const lastIndex = sequence.length - 1;
        const dutyDay = {
          index: null,
          dutyDayStart: getDutyStart(
            sequence[0],
            // if first flight of pairing, duty day start varies
            sequence[0].index === 0,
            aircraft
          ),
          dutyDayEnd: getDutyDayEnd(sequence[lastIndex]),
          flightIndices: sequence.map((flight) => flight.index),
        };
        return dutyDay;
      };

      let numberFlights = 0;
      let numberLayovers = 0;
      for (let i = 0; i < action.payload.length; i++) {
        //incremennt numberFlights for each flight in payload
        action.payload[i].flightNumber && numberFlights++;
        //increment numberLayovers for each layover in payload
        action.payload[i].hotelInfo && numberLayovers++;
      }

      if (numberFlights === 2 && numberLayovers === 0) {
        // Turn
        const dutyDay = processTurn(action.payload);
        // console.log(`Turn: ${JSON.stringify(dutyDay)}`);
        state.dutyDays.push(dutyDay);
      } else if (numberFlights > 2 && numberLayovers === 0) {
        // Multi-leg Day
        const dutyDay = processMultiLegDay(action.payload);
        // console.log(`Multi: ${JSON.stringify(dutyDay)}`);
        state.dutyDays.push(dutyDay);
      } else if (numberFlights === 2 && numberLayovers === 1) {
        // One leg both days, with layover
        const dutyDay1 = processDutyDay(action.payload.slice(0, 1));
        dutyDay1.index = 0;
        state.dutyDays.push(dutyDay1);
        // console.log(`One L: ${JSON.stringify(dutyDay1)}`);
        const dutyDay2 = processDutyDay(action.payload.slice(2, 3));
        dutyDay2.index = 1;
        // console.log(`One L: ${JSON.stringify(dutyDay2)}`);
        state.dutyDays.push(dutyDay2);
      } else if (numberFlights > 2 && numberLayovers > 1) {
        // Multi-day pairing with various numbers of flights per day
        let firstIndex = 0;
        let dutyDayIndex = 0;
        for (let i = 0; i < action.payload.length; i++) {
          if (action.payload[i].hotelInfo) {
            const dutyDay = processDutyDay(action.payload.slice(firstIndex, i));
            dutyDay.index = dutyDayIndex;
            // console.log(`Multi-Day: ${JSON.stringify(dutyDay)}`);
            state.dutyDays.push(dutyDay);
            firstIndex = i + 1;
            dutyDayIndex++;
          } else if (i === action.payload.length - 1) {
            const dutyDay = processDutyDay(
              action.payload.slice(firstIndex, i + 1)
            );
            dutyDay.index = dutyDayIndex;
            // console.log(`Multi-Day: ${JSON.stringify(dutyDay)}`);
            state.dutyDays.push(dutyDay);
          }
        }
      }

      for (let i = 0; i < action.payload.length; i++) {
        state.sequence.push(action.payload[i]);
      }
    },

    updateFlightDeparture: (state, action) => {
      const { index, value } = action.payload;
      state.sequence[index].departureTime = value;
    },

    updateFlightArrival: (state, action) => {
      const { index, value } = action.payload;
      state.sequence[index].arrivalTime = value;
    },

    // updateDutyDayStart: (state, action) => {
    //   const { index, value } = action.payload;
    //   state.dutyDays[index].dutyDayStart = value;
    // },

    updateDutyDayEnd: (state, action) => {
      const { index, value } = action.payload;
      state.dutyDays[index].dutyDayEnd = value;
    },

    updateCAAllowance: (state, action) => {
      const { index, value } = action.payload;
      state.caAllowance = value;
    },

    updateUSAllowance: (state, action) => {
      const { index, value } = action.payload;
      state.usAllowance = value;
    },
  },
});

// Export the generated action creators for use in components
export const {
  initializePairing,
  processSequence,
  updateFlightArrival,
  updateFlightDeparture,
  updateDutyDayEnd,
  updateCAAllowance,
  updateUSAllowance,
} = pairingSlice.actions;

// Export the slice reducer for use in the store configuration
export default pairingSlice.reducer;
