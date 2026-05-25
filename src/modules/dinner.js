import stringToTime from './stringToTime';
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';

const dinner = (curr, next) => {
  if (curr && curr.type === 'flight') {
    if (
      stringToTime('17:30').isBetween(
        stringToTime(curr.departureTime),
        stringToTime(curr.arrivalTime),
        'minute',
        '[]',
      )
    ) {
      if (stringToTime(curr.departureTime).isBefore(stringToTime('17:30'))) {
        if (canadian_airport_codes.includes(curr.arrivalAirport)) {
          return 'D';
        } else if (american_airport_codes.includes(curr.arrivalAirport)) {
          return 'E';
        }
      } else if (
        stringToTime(curr.departureTime).isAfter(stringToTime('17:29'))
      ) {
        if (canadian_airport_codes.includes(curr.departureAirport)) {
          return 'D';
        } else if (american_airport_codes.includes(curr.departureAirport)) {
          return 'E';
        }
      }
    } else if (
      next &&
      next.type === 'flight' &&
      stringToTime('17:30').isBetween(
        stringToTime(curr.arrivalTime),
        stringToTime(next.departureTime),
        null,
        '[]',
      )
    ) {
      if (canadian_airport_codes.includes(next.departureAirport)) {
        return 'D';
      } else if (american_airport_codes.includes(next.departureAirport)) {
        return 'E';
      }
    }
  } else if (curr && curr.type === 'layover') {
    // if (
    //   !stringToTime(curr.layoverStart).isSame(
    //     stringToTime(curr.layoverStart)
    //       .add(curr.layoverLength.slice(0, -2), 'hours')
    //       .add(curr.layoverLength.slice(-2), 'minutes'),
    //     'day',
    //   )
    // ) {
    //   if (
    //     stringToTime('17:30').isBetween(
    //       stringToTime(curr.layoverStart),
    //       stringToTime('23:59'),
    //       null,
    //       '[]',
    //     ) ||
    //     stringToTime('17:30').isBetween(
    //       stringToTime('00:00'),
    //       stringToTime(curr.layoverEnd),
    //       null,
    //       '[]',
    //     )
    //   ) {
    //     if (canadian_airport_codes.includes(curr.layoverStation)) {
    //       return 'D';
    //     }
    //     if (american_airport_codes.includes(curr.layoverStation)) {
    //       return 'E';
    //     }
    //   }
    // } else
    if (
      stringToTime(curr.layoverStart).isSame(
        stringToTime(curr.layoverEnd)
          .add(curr.layoverLength.slice(0, -2), 'hours')
          .add(curr.layoverLength.slice(-2), 'minutes'),
        'day',
      )
    ) {
      if (
        stringToTime('17:30').isBetween(
          stringToTime(curr.layoverStart),
          stringToTime(curr.layoverEnd),
          null,
          '[]',
        )
      ) {
        if (canadian_airport_codes.includes(curr.layoverStation)) {
          return 'D';
        }
        if (american_airport_codes.includes(curr.layoverStation)) {
          return 'E';
        }
      }
    }
  } else {
    return null;
  }
};

export default dinner;
