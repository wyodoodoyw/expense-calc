import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import american_airport_codes from '../../data/american_airport_codes';

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
      layoverCount: 0,
      calculatedMeals: '',
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

    // updateFlightDeparture: (state, action) => {
    //   const { index, value } = action.payload;
    //   state.sequence[index].departureTime = value;
    // },

    // updateFlightArrival: (state, action) => {
    //   const { index, value } = action.payload;
    //   state.sequence[index].arrivalTime = value;
    // },

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

    isTransborder: (state, action) => {
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

    numLayovers: (state, action) => {
      const s = state.sequence;
      let layoverCount = 0;
      for (let i = 0; i < s.length; i++) {
        if (s[i].hotelInfo) {
          layoverCount++;
        }
      }
      state.layoverCount = layoverCount;
    },

    calculatePairingMeals: () => {
      let meals = '';
      meals += calculateFirstDayMeals();

      for (let i = 0; i < calculateFullDays(); i++) {
        meals += 'BLDS';
      }
      meals += calculateLastDayMeals();
      // state.calculatedMeals = meals;
      return meals;
    },

    calculateFirstDayMeals: (state, action) => {
      const firstFlight = state.sequence[0];
      const firstDuty = state.dutyDays[0];
      const time = dayjs(firstFlight.departureTime, timeFormat);
      const duty = {
        start: dayjs(firstDuty.dutyDayStart),
        end: dayjs('01:01', timeFormat).add(1, 'day'),
      };
      if (
        time.isBefore(dayjs('08:00', timeFormat), 'minute') &&
        duty.start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
        duty.end.isAfter(dayjs('09:30', timeFormat), 'minutes')
      ) {
        // console.log(`!Begin: B`);
        return 'BLDS';
      } else if (
        time.isBefore(dayjs('12:30', timeFormat), 'minute') &&
        duty.start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
        duty.end.isAfter(dayjs('13:30', timeFormat), 'minutes')
      ) {
        // console.log(`!Begin: L`);
        return 'LDS';
      } else if (
        time.isBefore(dayjs('18:00', timeFormat), 'minute') &&
        duty.start.isBefore(dayjs('18:00', timeFormat), 'minutes') &&
        duty.end.isAfter(dayjs('19:30', timeFormat), 'minutes')
      ) {
        // console.log(`!Begin: D`);
        return 'DS';
      } else if (
        time.isBefore(dayjs('23:00', timeFormat), 'minute') &&
        duty.start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
        duty.end.isAfter(dayjs('01:00', timeFormat).add(1, 'day'), 'minutes')
      ) {
        // console.log(`!Begin: S`);
        return 'S';
      }
    },

    calculateLastDayMeals: (state, action) => {
      const lastFlight = state.sequence[state.sequence.length - 1];
      const lastDuty = state.dutyDays[state.dutyDays.length - 1];
      const time = dayjs(lastFlight.arrivalTime, timeFormat);
      const duty = {
        start: dayjs('00:00', timeFormat),
        end: dayjs(lastDuty.dutyDayEnd, timeFormat),
      };

      if (
        time.isAfter(dayjs('18:30', timeFormat), 'minute') &&
        duty.start.isBefore(dayjs('17:00', timeFormat), 'minutes') &&
        duty.end.isAfter(dayjs('18:30', timeFormat), 'minutes')
      ) {
        // console.log(`!End: D`);
        return 'BLD';
      } else if (
        time.isAfter(dayjs('13:30', timeFormat), 'minute') &&
        duty.start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
        duty.end.isAfter(dayjs('13:30', timeFormat), 'minutes')
      ) {
        // console.log(`!End: L`);
        return 'BL';
      } else if (
        time.isAfter(dayjs('09:30', timeFormat), 'minute') &&
        duty.start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
        duty.end.isAfter(dayjs('09:30', timeFormat), 'minutes')
      ) {
        // console.log(`!End: B`);
        return 'B';
      } else if (
        time.isAfter(dayjs('01:00', timeFormat), 'minute') &&
        duty.start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
        duty.end.isAfter((dayjs('01:00', timeFormat).add(1, 'day'), 'minutes'))
      ) {
        // console.log(`!End: S`);
        return 'BLDS';
      }
    },

    calculateFullDays: (state, action) => {
      const p = state;
      const firstFlight = p.sequence[0];
      const lastFlight = p.sequence[p.sequence.length - 1];
      let hours =
        Number(p.tafb.slice(0, -2)) +
        Number(firstFlight.departureTime[(0, 2)]) -
        Number(lastFlight.arrivalTime[(0, 2)]) -
        23;
      let minutes =
        Number(p.tafb.slice(-2)) +
        Number(lastFlight.arrivalTime[-2]) -
        Number(firstFlight.arrivalTime[-2]) +
        15;
      if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
      }
      return hours / 24;
    },
  },
});

// Export the generated action creators for use in components
export const {
  initializePairing,
  processSequence,
  updateDutyDayEnd,
  updateCAAllowance,
  updateUSAllowance,
  isTransborder,
  numLayovers,
  calculatePairingMeals,
  calculateFirstDayMeals,
  calculateLastDayMeals,
  calculateFullDays,
} = pairingSlice.actions;

// Export the slice reducer for use in the store configuration
export default pairingSlice.reducer;
