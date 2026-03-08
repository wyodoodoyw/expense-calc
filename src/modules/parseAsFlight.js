import stringToTime from './stringToTime';
import all_airports from '../data/all_airports';
import other_airlines from '../data/other_airlines';
import aircraft from '../data/aircraft';

const parseAsFlight = (array, index, isLastFlight) => {
  let newFlight = {
    index: index,
    type: 'flight',
  };

  // Days of week operated
  let daysOfWeek = [];
  for (let i = 0; i < array[0].length; i++) {
    const day = array[0][i];
    daysOfWeek.push(day);
  }
  newFlight.daysOfWeek = daysOfWeek;

  // Determine which array elements contain flight information
  if (all_airports.includes(array[2].substring(0, 3))) {
    // isDHD
    if (array[1].includes('DHD')) {
      newFlight.isDeadhead = true;
    }
    newFlight.aircraft = array[1].substring(0, 3);
    newFlight.flightNumber = array[1].substring(6);

    // Flight information
    newFlight.departureAirport = array[2].substring(0, 3);
    newFlight.departureTime = array[2].substring(4);
    newFlight.arrivalAirport = array[3].substring(0, 3);
    newFlight.arrivalTime = array[3].substring(4);
    newFlight.flightTime = array[4];
    newFlight.dutyTime = array[5];
    if (array[6] && array[6].match(/[0-9]{3,4}/g)) {
      newFlight.layoverLength = array[6];
    }

    // onboard meals
    if (array[7]) {
      newFlight.mealsOnboard = array.slice(7, array.length).join(' ');
    }
  } else if (all_airports.includes(array[3].substring(0, 3))) {
    // isDHD
    if (array[1].includes('DHD')) {
      newFlight.isDeadhead = true;
    } else {
      newFlight.isDeadhead = false;
    }
    newFlight.aircraft = array[1].substring(0, 3);
    newFlight.flightNumber = array[2];

    // Flight information
    newFlight.departureAirport = array[3].substring(0, 3);
    newFlight.departureTime = array[3].substring(4);
    newFlight.arrivalAirport = array[4].substring(0, 3);
    newFlight.arrivalTime = array[4].substring(4);
    newFlight.flightTime = array[5];
    newFlight.dutyTime = array[6];
    if (array[7] && array[7].match(/[0-9]{3,4}/g)) {
      newFlight.layoverLength = array[7];
    }

    // onboard meals
    if (array[8]) {
      newFlight.mealsOnboard = array.slice(8, array.length).join(' ');
    }
  } else if (all_airports.includes(array[4].substring(0, 3))) {
    for (let i = 0; i < array[1].length; i++) {
      const day = array[1][i];
      newFlight.daysOfWeek.push(day);
    }

    if (array[2].includes('DHD')) {
      newFlight.isDeadhead = true;
    } else {
      newFlight.isDeadhead = false;
    }
    newFlight.aircraft = array[2].substring(0, 3);
    newFlight.flightNumber = array[3];

    // Flight information
    newFlight.departureAirport = array[4].substring(0, 3);
    newFlight.departureTime = array[4].substring(4);
    newFlight.arrivalAirport = array[5].substring(0, 3);
    newFlight.arrivalTime = array[5].substring(4);
    newFlight.flightTime = array[6];
    newFlight.dutyTime = array[7];
    if (array[8] && array[8].match(/[0-9]{3,4}/g)) {
      newFlight.layoverLength = array[8];
    }

    // onboard meals
    if (array[9]) {
      newFlight.mealsOnboard = array.slice(9, array.length).join(' ');
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
    // console.log(
    //   `arrival time: ${newFlight.arrivalTime} ${newFlight.pairingIdentifier}`,
    // );
    newFlight.dutyEnd = time.add(15, 'minute').format('HHmm');
  } else if (isLastFlight && newFlight.isDeadhead) {
    const time = stringToTime(newFlight.arrivalTime);
    newFlight.dutyEnd = time.format('HHmm');
  }

  return newFlight;
};

export default parseAsFlight;
