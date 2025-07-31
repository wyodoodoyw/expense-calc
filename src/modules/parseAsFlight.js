import dayjs from 'dayjs';
import cutStringAfterExclusive from '../modules/cutStringAfterExclusive';
import cutStringBeforeExclusive from '../modules/cutStringBeforeExclusive';
import aircraft from '../data/aircraft';

const timeFormat = 'HH:mm';

const parseAsFlight = (line, index, isLastFlight) => {
  const newFlight = {
    index: index,
  };

  // Find occurance of aircraft designator, parse substring prior to it
  let regExpression = '';
  if (aircraft) {
    for (let i = 0; i < aircraft.length; i++) {
      if (i === 0) {
        regExpression += `${aircraft[i]}`;
      } else {
        regExpression += `|${aircraft[i]}`;
      }
    }
  }
  // const regex = new RegExp(String.raw`[0-9]{3}|(77P${otherAirlines})`, 'g');
  const regex = new RegExp(String.raw`(${regExpression})`, 'g');
  let threeDigits = line.match(regex);
  if (threeDigits) {
    for (let i = 0; i < threeDigits.length; i++) {
      if (aircraft.includes(threeDigits[i])) {
        newFlight.aircraft = threeDigits[i];
        break;
      }
    }
  }
  let days = cutStringBeforeExclusive(line, newFlight.aircraft);
  newFlight.daysOfWeek = days.match(/[0-9]/g);
  // Remove substring that has been parsed above
  line = cutStringAfterExclusive(line, newFlight.aircraft);

  line.includes('DHD')
    ? (newFlight.isDeadhead = true)
    : (newFlight.isDeadhead = false);
  line = line.replace('DHD', '');

  const numbers = line.match(/[0-9]{1,4}/g);
  newFlight.flightNumber = numbers[0];
  newFlight.departureTime = numbers[1];
  newFlight.arrivalTime = numbers[2];
  newFlight.flightTime = numbers[3];

  if (index === 0 && !newFlight.isDeadhead) {
    const time = dayjs()
      .set('hour', newFlight.departureTime.slice(0, -2))
      .set('minute', newFlight.departureTime.slice(-2));
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
    const time = dayjs()
      .set('hour', newFlight.departureTime.slice(0, -2))
      .set('minute', newFlight.departureTime.slice(-2));
    newFlight.dutyStart = time.subtract(30, 'minute').format('HHmm');
  }

  if (isLastFlight && !newFlight.isDeadhead) {
    const time = dayjs()
      .set('hour', newFlight.arrivalTime.slice(0, -2))
      .set('minute', newFlight.arrivalTime.slice(-2));
    newFlight.dutyEnd = time.add(15, 'minute').format('HHmm');
  } else if (isLastFlight && newFlight.isDeadhead) {
    const time = dayjs()
      .set('hour', newFlight.arrivalTime.slice(0, -2))
      .set('minute', newFlight.arrivalTime.slice(-2));
    newFlight.dutyEnd = time.format('HHmm');
  }

  if (numbers[4]) {
    newFlight.dutyTime = numbers[4];
  }
  if (numbers[5]) {
    newFlight.layoverLength = numbers[5];
  }

  const airports = line.match(/[A-Z]{3}/g);
  newFlight.departureAirport = airports[0];
  newFlight.arrivalAirport = airports[1];

  // Remove substring that has been parsed above
  if (numbers[5]) {
    line = cutStringAfterExclusive(line, numbers[5]);
  } else if (numbers[4]) {
    line = cutStringAfterExclusive(line, numbers[4]);
  } else {
    line = cutStringAfterExclusive(line, numbers[3]);
  }

  // console.log(`line: ${line}`);
  if (line && line.match(/[A-Z]{2}/g)) {
    const mealsOnboard = line.match(/[A-Z]{2}/g);
    newFlight.mealsOnboard = mealsOnboard;
    line = cutStringAfterExclusive(line, mealsOnboard[mealsOnboard.length - 1]);
  }

  if (line !== ' ') {
    newFlight.mealExpenses = line.trim();
  }
  return newFlight;
};

export default parseAsFlight;
