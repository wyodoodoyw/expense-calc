import stringToTime from './stringToTime';
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';

const breakfast = (curr, next) => {
  if (curr && curr.type === 'flight') {
    // during current flight
    if (
      stringToTime('08:00').isBetween(
        stringToTime(curr.departureTime),
        stringToTime(curr.arrivalTime),
        'minute',
        '[]',
      )
    ) {
      // breakfast - curr.departureAirport
      if (canadian_airport_codes.includes(curr.departureAirport)) {
        return 'B';
      }
      if (american_airport_codes.includes(curr.departureAirport)) {
        return 'C';
      }
    } else if (
      next &&
      next.type === 'flight' &&
      stringToTime('08:00').isBetween(
        stringToTime(curr.arrivalTime),
        stringToTime(next.departureTime),
        null,
        '[]',
      )
    ) {
      // between current arrival and next departure
      // breakfast - next.departureAirport
      if (canadian_airport_codes.includes(next.departureAirport)) {
        return 'B';
      }
      if (american_airport_codes.includes(next.departureAirport)) {
        return 'C';
      }
    }
  } else if (curr && curr.type === 'layover') {
    if (
      !stringToTime(curr.layoverStart).isSame(
        stringToTime(curr.layoverStart)
          .add(curr.layoverLength.slice(0, -2), 'hours')
          .add(curr.layoverLength.slice(-2), 'minutes'),
        'day',
      )
    ) {
      // layover crossing midnight
      if (
        stringToTime('08:00').isBetween(
          stringToTime(curr.layoverStart),
          stringToTime('23:59'),
          null,
          '[]',
        ) ||
        stringToTime('08:00').isBetween(
          stringToTime('00:00'),
          stringToTime(curr.layoverEnd),
          null,
          '[]',
        )
      ) {
        // breakfast - curr.layoverStation
        if (canadian_airport_codes.includes(curr.layoverStation)) {
          return 'B';
        }
        if (american_airport_codes.includes(curr.layoverStation)) {
          return 'C';
        }
      }
    } else // if (
    // stringToTime(curr.layoverStart).isSame(
    //   stringToTime(curr.layoverStart)
    //     .add(curr.layoverLength.slice(0, -2), 'hours')
    //     .add(curr.layoverLength.slice(-2), 'minutes'),
    //   'day',
    // )
    // )
    {
      // layover not crossing midnight
      if (
        stringToTime('08:00').isBetween(
          stringToTime(curr.layoverStart),
          stringToTime(curr.layoverEnd),
          null,
          '[]',
        )
      ) {
        // breakfast - curr.layoverStation
        if (canadian_airport_codes.includes(curr.layoverStation)) {
          return 'B';
        }
        if (american_airport_codes.includes(curr.layoverStation)) {
          return 'C';
        }
      }
    }
  } else {
    return null;
  }
};

export default breakfast;
