import stringToTime from './stringToTime';
import other_airlines from '../data/other_airlines';
// import cutStringAfterExclusive from '../modules/cutStringAfterExclusive';
// import cutStringBeforeExclusive from '../modules/cutStringBeforeExclusive';
import aircraft from '../data/aircraft';

const parseAsFlight = (array, index, isLastFlight) => {
  const newFlight = {
    index: index,
    isFlight: true,
  };

  // Day of week operated
  let daysOfWeek = [];
  for (let i = 0; i < array[0].length; i++) {
    const day = array[0][i];
    daysOfWeek.push(day);
  }
  newFlight.daysOfWeek = daysOfWeek;

  console.log(array[1]);
  // isDHD
  if (array[1].includes('DHD')) {
    newFlight.isDeadhead = true;
  } else {
    newFlight.isDeadhead = false;
  }

  // Aircraft type, flight number
  if (
    newFlight.isDeadhead &&
    other_airlines.includes(array[1].substring(0, 3))
  ) {
    newFlight.aircraft = array[1].substring(0, 3);
    newFlight.flightNumber = array[1].substring(6);
  } else if (
    newFlight.isDeadhead &&
    !other_airlines.includes(array[1].substring(0, 3))
  ) {
    newFlight.aircraft = array[1].substring(0, 3);
    newFlight.flightNumber = array[2];
  } else {
    newFlight.aircraft = array[1];
    newFlight.flightNumber = array[2];
  }

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
  // newFlight.mealsOnboard = array[(7, array.length - 1)];

  // Calculate duty start and duty end
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
