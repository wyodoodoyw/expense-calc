import stringToTime from './stringToTime';
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';

const lunch = (curr, next = null) => {
  if (!curr && !next) return;
  if (curr && curr.type === 'flight') {
    if (
      stringToTime('12:00').isBetween(
        stringToTime(curr.departureTime),
        stringToTime(curr.arrivalTime),
        'minute',
        '[]',
      )
    ) {
      if (stringToTime(curr.departureTime).isBefore(stringToTime('12:00'))) {
        // lunch - curr.arrivalAirport
        if (canadian_airport_codes.includes(curr.departureAirport)) {
          return 'L';
        }
        if (american_airport_codes.includes(curr.departureAirport)) {
          return 'M';
        }
      } else if (
        stringToTime(curr.departureTime).isAfter(stringToTime('11:59'))
      ) {
        // lunch - curr.departureAirport
        if (canadian_airport_codes.includes(next.departureAirport)) {
          return 'L';
        }
        if (american_airport_codes.includes(next.departureAirport)) {
          return 'M';
        }
      }
    } else if (
      next &&
      next.type === 'flight' &&
      stringToTime('12:00').isBetween(
        stringToTime(curr.arrivalTime),
        stringToTime(next.departureTime),
        null,
        '[]',
      )
    ) {
      // lunch - next.departureAirport
      if (canadian_airport_codes.includes(next.departureAirport)) {
        return 'L';
      }
      if (american_airport_codes.includes(next.departureAirport)) {
        return 'M';
      }
    }
  } else if (curr && curr.type === 'layover') {
    if (
      stringToTime('12:00').isBetween(
        stringToTime(curr.layoverStart),
        stringToTime(curr.layoverEnd),
        null,
        '[]',
      )
    ) {
      // lunch - curr.station
      if (canadian_airport_codes.includes(curr.layoverStation)) {
        return 'L';
      }
      if (american_airport_codes.includes(curr.layoverStation)) {
        return 'M';
      }
    } else {
      return 'Y';
    }
  }
};

export default lunch;
