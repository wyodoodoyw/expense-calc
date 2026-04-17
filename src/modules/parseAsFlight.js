import stringToTime from './stringToTime';
import all_airports from '../data/all_airports';
import american_airport_codes from '../data/american_airport_codes';
import international_airport_codes from '../data/international_airport_codes';
import aircraft from '../data/aircraft';

const parseAsFlight = (array, index, isLastFlight) => {
  let newFlight = {
    index: index,
    type: 'flight',
    str: array,
  };

  // Days of week operated
  let daysOfWeek = [];
  for (let i = 0; i < array[0].length; i++) {
    const day = array[0][i];
    daysOfWeek.push(day);
  }
  newFlight.daysOfWeek = daysOfWeek;

  // ['2', '223', '475', 'YUL 0940', 'YOW 1024', '44']
  // ['7', '330', '894', 'YYZ 1700', 'YUL 1821', '121', 'D']
  // ['7', '789', '112', 'YVR 1225', 'YYZ 1945', '420', '1235', 'LD']
  // ['5', '330', '121', 'YYZ 1730', 'YVR 1934', '504', '634', '2611', 'D']
  // ['1', '330DHD', '309', 'YUL 2200', 'YVR 0026', '526', '1156', '1404', 'SS', 'PP']
  // ['123456', '77P', '5', 'YUL 1255', 'NRT 1525', '1330', '1455', '2445', 'HB', 'HD', 'SS']

  if (all_airports.includes(array[3].substring(0, 3))) {
    // Deadhead
    if (array[1].includes('DHD')) {
      newFlight.isDeadhead = true;
    } else {
      newFlight.isDeadhead = false;
    }

    // Aircraft Type
    if (array[1] && aircraft.includes(array[1].substring(0, 3))) {
      newFlight.aircraft = array[1].substring(0, 3);
    } else {
      console.warn(`Error parsing aircraft type: ${JSON.stringify(array)}`);
    }

    if (array[2] && array[2].match(/[0-9]{1,4}/g)) {
      newFlight.flightNumber = array[2];
    } else {
      console.warn(`Error parsing flight number: ${array}`);
    }

    // Departure Information
    if (array[3] && all_airports.includes(array[3].substring(0, 3))) {
      newFlight.departureAirport = array[3].substring(0, 3);
    } else {
      console.warn(`Error parsing departure airport: ${array}`);
    }

    if (array[3] && array[3].substring(4).match(/[0-9]{4}/g)) {
      newFlight.departureTime = array[3].substring(4);
    } else {
      console.warn(`Error parsing departure time: ${array}`);
    }

    // isInt or isUsa
    newFlight.isUsa =
      american_airport_codes.includes(newFlight.departureAirport) ||
      american_airport_codes.includes(newFlight.arrivalAirport);
    newFlight.isInt =
      international_airport_codes.includes(newFlight.departureAirport) ||
      international_airport_codes.includes(newFlight.arrivalAirport);

    // Arrival Information
    if (array[4] && all_airports.includes(array[4].substring(0, 3))) {
      newFlight.arrivalAirport = array[4].substring(0, 3);
    } else {
      console.warn(`Error parsing arrival airport: ${array}`);
    }

    if (array[4] && array[4].substring(4).match(/[0-9]{4}/g)) {
      newFlight.arrivalTime = array[4].substring(4);
    } else {
      console.warn(`Error parsing arrival time: ${array}`);
    }

    // Flight Time
    if (array[5] && array[5].match(/[0-9]{2,4}/g)) {
      newFlight.flightTime = array[5];
    } else {
      console.warn(`Error parsing flight time: ${array}`);
    }

    // array[6]: dutytime OR meal Allowance
    if (array[6] && array[6].match(/[0-9]{3,4}/g)) {
      newFlight.dutyTime = array[6];
    } else if (array[6] && array[6].match(/(HB|CB|HL|HD|FB|SD|SS|PP|MS)/g)) {
      newFlight.mealsOnboard = array.slice(6, array.length);
    } else if (
      array[6] &&
      array[6].match(/^(?!HB)(?!CB)(?!HL)(?!HD)(?!SD)(?!SS)[BLDS]+/g)
    ) {
      newFlight.mealAllowance = array[6];
    } else if (array[6]) {
      console.warn(`Error parsing array[6]: ${array}`);
    }

    // array[7]: layover length OR meal allowance
    if (array[7] && array[7].match(/[0-9]{3,4}/g)) {
      newFlight.layoverLength = array[7];
    } else if (array[7] && array[7].match(/(HB|CB|HL|HD|FB|SD|SS|PP|MS)/g)) {
      newFlight.mealsOnboard = array.slice(7, array.length);
    } else if (
      array[7] &&
      array[7].match(/^(?!HB)(?!CB)(?!HL)(?!HD)(?!SD)(?!SS)[BLDS]+/g)
    ) {
      newFlight.mealAllowance = array[7];
    } else if (array[7]) {
      console.warn(`Error parsing array[7]: ${array}`);
    }

    // array[8]: meal allowance OR meals onboard
    if (array[8] && array[8].match(/(HB|CB|HL|HD|FB|SD|SS|PP|MS)/g)) {
      newFlight.mealsOnboard = array.slice(8, array.length);
    } else if (
      array[8] &&
      array[8].match(/^(?!HB)(?!CB)(?!HL)(?!HD)(?!SD)(?!SS)[BLDS]+/g)
    ) {
      newFlight.mealAllowance = array[8];
    } else if (array[8]) {
      console.warn(`Error parsing array[8]: ${array}`);
    }
  }

  // calculate duty start for first flight of pairing
  if (index === 0 && !newFlight.isDeadhead) {
    const time = stringToTime(newFlight.departureTime);
    switch (newFlight.aircraft) {
      case '767':
        newFlight.dutyStart = time
          .subtract(1, 'hour')
          .subtract(10, 'minute')
          .format('HHmm');
        break;
      case '788':
        newFlight.dutyStart = time
          .subtract(1, 'hour')
          .subtract(10, 'minute')
          .format('HHmm');
        break;
      case '330':
        newFlight.dutyStart = time
          .subtract(1, 'hour')
          .subtract(15, 'minute')
          .format('HHmm');
        break;
      case '789':
        newFlight.dutyStart = time
          .subtract(1, 'hour')
          .subtract(15, 'minute')
          .format('HHmm');
        break;
      case '772':
        newFlight.dutyStart = time
          .subtract(1, 'hour')
          .subtract(15, 'minute')
          .format('HHmm');
        break;
      case '773':
        newFlight.dutyStart = time
          .subtract(1, 'hour')
          .subtract(20, 'minute')
          .format('HHmm');
        break;
      case '77P':
        newFlight.dutyStart = time
          .subtract(1, 'hour')
          .subtract(25, 'minute')
          .format('HHmm');
        break;
      default:
        newFlight.dutyStart = time.subtract(1, 'hour').format('HHmm');
        break;
    }
  } else if (index === 0 && newFlight.isDeadhead) {
    const time = stringToTime(newFlight.departureTime);
    newFlight.dutyStart = time.subtract(30, 'minute').format('HHmm');
  }

  // calculate duty end for last flight of pairing
  if (isLastFlight && !newFlight.isDeadhead) {
    const time = stringToTime(newFlight.arrivalTime);
    newFlight.dutyEnd = time.add(15, 'minute').format('HHmm');
  } else if (isLastFlight && newFlight.isDeadhead) {
    const time = stringToTime(newFlight.arrivalTime);
    newFlight.dutyEnd = time.format('HHmm');
  }

  return newFlight;
};

export default parseAsFlight;
