// import calcPairingDays from './calcPairingDays';
import dayjs from 'dayjs';
import isBetween from 'dayjs';
import stringToTime from './stringToTime';
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';

dayjs.extend(isBetween);

export default function getMealsFromSequenceDom(seq = [], pairingLength) {
  // Always return an object so callers can destructure safely
  if (!Array.isArray(seq) || seq.length === 0 || !pairingLength) {
    return { meals: [], station: null };
  }

  const meals = [];
  const station = 'YYZ';

  // push meals to meal array
  const pushMeal = (mealStr) => {
    if (!mealStr) return;
    meals.push({
      index: meals.length,
      meals: mealStr,
      station: 'YYZ',
    });
  };

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
      } else if (
        stringToTime(curr.layoverStart).isSame(
          stringToTime(curr.layoverStart)
            .add(curr.layoverLength.slice(0, -2), 'hours')
            .add(curr.layoverLength.slice(-2), 'minutes'),
          'day',
        )
      ) {
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
    }
  };

  const lunch = (curr, next) => {
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
          if (canadian_airport_codes.includes(next.departureAirport)) {
            return 'L';
          }
          if (american_airport_codes.includes(next.departureAirport)) {
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
        !stringToTime(curr.layoverStart).isSame(
          stringToTime(curr.layoverStart)
            .add(curr.layoverLength.slice(0, -2), 'hours')
            .add(curr.layoverLength.slice(-2), 'minutes'),
          'day',
        )
      ) {
        if (
          stringToTime('12:00').isBetween(
            stringToTime(curr.layoverStart),
            stringToTime('23:59'),
            null,
            '[]',
          ) ||
          stringToTime('12:00').isBetween(
            stringToTime('00:00'),
            stringToTime(curr.layoverEnd),
            null,
            '[]',
          )
        ) {
          // lunch - curr.layoverStation
          if (canadian_airport_codes.includes(next.departureAirport)) {
            return 'L';
          }
          if (american_airport_codes.includes(next.departureAirport)) {
            return 'M';
          }
        }
      } else if (
        stringToTime(curr.layoverStart).isSame(
          stringToTime(curr.layoverStart)
            .add(curr.layoverLength.slice(0, -2), 'hours')
            .add(curr.layoverLength.slice(-2), 'minutes'),
          'day',
        )
      ) {
        if (
          stringToTime('12:00').isBetween(
            stringToTime(curr.layoverStart),
            stringToTime(curr.layoverEnd),
            null,
            '[]',
          )
        ) {
          // lunch - curr.station
          if (canadian_airport_codes.includes(next.departureAirport)) {
            return 'L';
          }
          if (american_airport_codes.includes(next.departureAirport)) {
            return 'M';
          }
        }
      }
    }
  };

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
          // dinner - curr.arrivalAirport
          console.log(`D: ${curr.arrivalAirport}`);
        } else if (
          stringToTime(curr.departureTime).isAfter(stringToTime('17:29'))
        ) {
          // dinner - curr.departureAirport
          console.log(`D: ${curr.departureAirport}`);
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
        // dinner - next.departureAirport
        console.log(`D: ${next.departureAirport}`);
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
        if (
          stringToTime('17:30').isBetween(
            stringToTime(curr.layoverStart),
            stringToTime('23:59'),
            null,
            '[]',
          ) ||
          stringToTime('17:30').isBetween(
            stringToTime('00:00'),
            stringToTime(curr.layoverEnd),
            null,
            '[]',
          )
        ) {
          // dinner - curr.layoverStation
          console.log(`D: ${curr.layoverStation}`);
        }
      } else if (
        stringToTime(curr.layoverStart).isSame(
          stringToTime(curr.layoverStart)
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
          // dinner - curr.station
          console.log(`D: ${curr.layoverStation}`);
        }
      }
    }
  };

  const snack = (curr, next) => {
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
          // snack - curr.arrivalAirport
          console.log(`S: ${curr.arrivalAirport}`);
        } else if (
          stringToTime(curr.departureTime).isBetween(
            stringToTime('22:29'),
            stringToTime('25:59'),
            null,
            '[]',
          )
        ) {
          // snack - curr.departureAirport
          console.log(`S: ${curr.departureAirport}`);
        } else if (
          stringToTime(curr.departureTime).isBetween(
            stringToTime('00:00'),
            stringToTime('00:59'),
            null,
            '[]',
          )
        ) {
          console.log(`S: ${curr.departureAirport}`);
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
        // snack - next.departureAirport
        console.log(`S: ${next.departureAirport}`);
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
        if (
          stringToTime('22:30').isBetween(
            stringToTime(curr.layoverStart),
            stringToTime('23:59'),
            null,
            '[]',
          ) ||
          stringToTime('22:30').isBetween(
            stringToTime('00:00'),
            stringToTime(curr.layoverEnd),
            null,
            '[]',
          )
        ) {
          // snack - curr.layoverStation
          console.log(`S: ${curr.layoverStation}`);
        }
      } else if (
        stringToTime(curr.layoverStart).isSame(
          stringToTime(curr.layoverStart)
            .add(curr.layoverLength.slice(0, -2), 'hours')
            .add(curr.layoverLength.slice(-2), 'minutes'),
          'day',
        )
      ) {
        if (
          stringToTime('22:30').isBetween(
            stringToTime(curr.layoverStart),
            stringToTime(curr.layoverEnd),
            null,
            '[]',
          )
        ) {
          // snack - curr.station
          console.log(`S: Snack at ${curr.layoverStation}`);
        }
      }
    }
  };

  const getMealsAndLocations = (seq) => {
    if (!seq) return;

    let mealStr = '';

    seq.forEach((curr, i, arr) => {
      const first = i === 0;
      const next = arr[i + 1];
      const last = i === arr.length - 1;

      // console.log(
      //   `curr is first: ${first}, curr duty start: ${curr.dutyStart}`,
      // );

      if (first && curr.dutyStart && curr.type === 'flight') {
        if (stringToTime(curr.dutyStart).isBefore(stringToTime('08:00'))) {
          // breakfast
          // console.log('hello');
          mealStr += breakfast(curr, next);
          // console.log(`m: ${mealStr}`);
        } else if (
          stringToTime(curr.dutyStart).isBefore(stringToTime('12:30'))
        ) {
          // lunch
          mealStr += lunch(curr, next);
        } else if (
          stringToTime(curr.dutyStart).isBefore(stringToTime('18:00'))
        ) {
          // dinner
          mealStr += dinner(curr, next);
        } else if (
          stringToTime(curr.dutyStart).isBefore(stringToTime('23:00'))
        ) {
          // snack
          mealStr += snack(curr, next);
        }
      }

      if (last && curr.dutyEnd && curr.type === 'flight') {
        if (
          stringToTime(curr.dutyEnd).isBetween(
            stringToTime('09:30'),
            stringToTime('13:30'),
            null,
            '[]',
          )
        ) {
          // breakfast
          mealStr && pushMeal(mealStr);
        } else if (
          stringToTime(curr.dutyEnd).isBetween(
            stringToTime('13:30'),
            stringToTime('18:30'),
            null,
            '[]',
          )
        ) {
          // lunch
          mealStr && pushMeal(mealStr);
        } else if (
          stringToTime(curr.dutyEnd).isBetween(
            stringToTime('18:30'),
            stringToTime('01:00'),
            null,
            '[]',
          )
        ) {
          // dinner
          mealStr && pushMeal(mealStr);
        } else if (
          stringToTime(curr.dutyEnd).isBetween(
            stringToTime('01:00'),
            stringToTime('09:30'),
            null,
            '[]',
          )
        ) {
          // snack
          mealStr && pushMeal(mealStr);
        }
      }

      if (!first && !last) {
        //
      }
    });
    // console.log(`mealStr: ${mealStr}`);
    mealStr && pushMeal(mealStr);
  };

  getMealsAndLocations(seq, pairingLength);
  // //--- STEP 1: Handle Night Flights
  // if (
  //   pairingLength &&
  //   Number(pairingLength) <= 1400 &&
  //   seq.length == 2 &&
  //   stringToTime(seq[1].arrivalTime).isAfter(stringToTime('04:00')) &&
  //   stringToTime(seq[1].arrivalTime).isBefore(stringToTime('08:00'))
  // ) {
  //   return {
  //     meals: [{ index: 0, meals: 'DS', station: 'YYZ' }],
  //     station: 'YYZ',
  //   };
  // }

  // //--- STEP 2: Handle short duty days

  // if (pairingLength && Number(pairingLength) <= 1700) {
  //   const dutyStart = seq[0].dutyStart;
  //   const deptTime = seq[0].departureTime;
  //   const arrTime = seq[seq.length - 1].arrivalTime;
  //   const dutyEnd = seq[seq.length - 1].dutyEnd;

  //   const shortDutyMeals = getShortDutyMeals(
  //     dutyStart,
  //     deptTime,
  //     arrTime,
  //     dutyEnd,
  //   );

  //   shortDutyMeals && pushMeal(shortDutyMeals, 'YYZ');

  //   if (shortDutyMeals) {
  //     return { meals, station };
  //   } else {
  //     return { meals: [], station: null };
  //   }
  // }

  if (meals) {
    // console.log(`{meals, station}: ${JSON.stringify(meals, station)}`);
    return { meals, station };
  } else {
    return { meals: [], station: null };
  }
}
