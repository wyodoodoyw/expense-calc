import cutStringAfterExclusive from '../cutStringAfterExclusive';
import cutStringBeforeExclusive from '../cutStringBeforeExclusive';
import aircraft from '../data/aircraft';

const parseAsFlight = (line, index) => {
  // console.log('---FLIGHT---');
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
  // console.log(regex);
  let threeDigits = line.match(regex);
  // console.log(threeDigits);
  if (threeDigits) {
    for (let i = 0; i < threeDigits.length; i++) {
      if (aircraft.includes(threeDigits[i])) {
        newFlight.aircraft = threeDigits[i];
        break;
        // console.log(`newFlight.aircraft ${newFlight.aircraft}`);
      }
    }
  }
  let days = cutStringBeforeExclusive(line, newFlight.aircraft);
  newFlight.daysOfWeek = days.match(/[0-9]/g);
  // console.log(`dayfOfWeek: ${newFlight.daysOfWeek}`);
  // Remove substring that has been parsed above
  line = cutStringAfterExclusive(line, newFlight.aircraft);

  line.includes('DHD')
    ? (newFlight.isDeadhead = true)
    : (newFlight.isDeadhead = false);
  // console.log(`isDHD: ${newFlight.isDeadhead}`);
  // console.log(line);
  line = line.replace('DHD', '');

  const numbers = line.match(/[0-9]{1,4}/g);
  newFlight.flightNumber = numbers[0];
  newFlight.departureTime = numbers[1];
  newFlight.arrivalTime = numbers[2];
  newFlight.flightTime = numbers[3];

  if (numbers[4]) {
    newFlight.dutyTime = numbers[4];
  }
  if (numbers[5]) {
    newFlight.layoverLength = numbers[5];
  }
  // console.log(line);
  const airports = line.match(/[A-Z]{3}/g);
  // console.log(`airports: ${airports}`);
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
