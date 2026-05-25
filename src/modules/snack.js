import stringToTime from './stringToTime';
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';
import crossesMidnight from './crossesMidnight';

const snack = (curr, next) => {
  //--- FLIGHTS
  if (curr && curr.type === 'flight') {
    if (
      stringToTime('22:30').isBetween(
        stringToTime(curr.departureTime),
        stringToTime(curr.arrivalTime),
        'minute',
        '[]',
      )
    ) {
      if (stringToTime(curr.departureTime).isBefore(stringToTime('22:30'))) {
        if (canadian_airport_codes.includes(curr.arrivalAirport)) {
          return 'S';
        }
        if (american_airport_codes.includes(curr.arrivalAirport)) {
          return 'T';
        }
      } else if (
        stringToTime(curr.departureTime).isBetween(
          stringToTime('22:30'),
          stringToTime('23:59'),
          null,
          '[]',
        ) ||
        stringToTime(curr.departureTime).isBetween(
          stringToTime('00:00'),
          stringToTime('00:59'),
          null,
          '[]',
        )
      ) {
        if (canadian_airport_codes.includes(curr.departureAirport)) {
          return 'S';
        }
        if (american_airport_codes.includes(curr.departureAirport)) {
          return 'T';
        }
      }
    } else if (
      next &&
      next.type === 'flight' &&
      stringToTime('22:30').isBetween(
        stringToTime(curr.arrivalTime),
        stringToTime(next.departureTime),
        null,
        '[]',
      )
    ) {
      if (canadian_airport_codes.includes(curr.arrivalAirport)) {
        return 'S';
      }
      if (american_airport_codes.includes(curr.arrivalAirport)) {
        return 'T';
      }
    }
    //--- LAYOVER
  } else if (curr && curr.type === 'layover') {
    if (
      !crossesMidnight(
        curr.layoverStart,
        curr.layoverEnd,
        curr.layoverLength,
      ) &&
      stringToTime('22:30').isBetween(
        stringToTime(curr.layoverStart),
        stringToTime(curr.layoverEnd),
        null,
        '[]',
      )
    ) {
      if (canadian_airport_codes.includes(curr.layoverStation)) {
        return 'S';
      }
      if (american_airport_codes.includes(curr.layoverStation)) {
        return 'T';
      }
    } else if (
      (crossesMidnight(
        curr.layoverStart,
        curr.layoverEnd,
        curr.layoverLength,
      ) &&
        stringToTime('22:30').isBetween(
          stringToTime(curr.layoverStart),
          stringToTime('23:59'),
          null,
          '[]',
        )) ||
      stringToTime('22:30').isBetween(
        stringToTime('00:00'),
        stringToTime(curr.layoverEnd),
        null,
        '[]',
      )
    ) {
      if (canadian_airport_codes.includes(curr.layoverStation)) {
        return 'S';
      }
      if (american_airport_codes.includes(curr.layoverStation)) {
        return 'T';
      }
    } else {
      return null;
    }
  }
};

export default snack;
