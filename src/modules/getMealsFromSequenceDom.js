import dayjs from 'dayjs';
import isBetween from 'dayjs';
import stringToTime from './stringToTime';
import UTC from 'dayjs/plugin/utc';
import Timezone from 'dayjs/plugin/timezone';
import AdvancedFormat from 'dayjs/plugin/advancedFormat';

import breakfast from './breakfast';
import lunch from './lunch';
import dinner from './dinner';
import snack from './snack';

import crossesMidnight from './crossesMidnight';
import calcPairingDays from './calcPairingDays';
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';

dayjs.extend(isBetween);
dayjs.extend(UTC);
dayjs.extend(Timezone);
dayjs.tz.setDefault('America/New_York');
dayjs.extend(AdvancedFormat);

export default function getMealsFromSequenceDom(pIdentifier, seq = []) {
  if (!Array.isArray(seq) || seq.length === 0) {
    return { meals: [], station: null };
  }

  console.log(`${pIdentifier}`);
  const meals = [];
  const station = 'YYZ';

  const pushMeal = (mealStr) => {
    if (!mealStr) return;
    meals.push({
      index: meals.length,
      meals: mealStr,
      station: 'YYZ',
    });
  };

  const getMealsAndLocations = (seq) => {
    if (!seq) return;

    let mealStr = '';
    let prevChar;

    let first = true;

    seq.forEach((curr, i, arr) => {
      // let start;
      // let end;

      const cross = crossesMidnight(curr);
      console.log(`${i} crosses? ${cross}`);

      let days = 0;
      if (cross && curr.type === 'flight') {
        days = calcPairingDays(
          curr.departureTime,
          curr.endTime,
          curr.flightLength,
        );
      } else if (cross && curr.type === 'layover') {
        days =
          2 +
          calcPairingDays(
            curr.layoverStart,
            curr.layoverEnd,
            curr.layoverLength,
          );
      }

      // if (curr.type === 'flight') {
      //   start = dayjs()
      //     .tz()
      //     .set('hour', curr.departureTime.slice(0, -2))
      //     .set('minute', curr.departureTime.slice(-2))
      //     .startOf('minute');
      //   end = dayjs()
      //     .tz()
      //     .set('hour', curr.arrivalTime.slice(0, -2))
      //     .set('minute', curr.arrivalTime.slice(-2))
      //     .startOf('minute');
      // }
      // else if (curr.type === 'layover') {
      //   start = dayjs()
      //     .tz()
      //     .set('hour', curr.layoverStart.slice(0, -2))
      //     .set('minute', curr.layoverStart.slice(-2))
      //     .startOf('minute');
      //   end = dayjs()
      //     .tz()
      //     .set('hour', curr.layoverEnd.slice(0, -2))
      //     .set('minute', curr.layoverEnd.slice(-2))
      //     .startOf('minute');
      // }

      const next = arr[i + 1];
      const last = i === arr.length - 1;

      if (first && curr.dutyStart && curr.type === 'flight') {
        if (
          stringToTime(curr.dutyStart).isBetween(
            stringToTime('03:00'),
            stringToTime('08:00'),
            null,
            '[)',
          ) &&
          stringToTime(curr.departureTime).isBetween(
            stringToTime('03:00'),
            stringToTime('08:00'),
            null,
            '[)',
          )
          // &&
          // dayjs
          //   .duration()
          //   .add(curr.length.slice(0, -2), 'hours')
          //   .add(curr.length.slice(-2), 'minutes')
          //   .asMinutes() >= 90
        ) {
          mealStr += breakfast(curr, next);
          first = false;
        } else if (
          stringToTime(curr.dutyStart).isBetween(
            stringToTime('08:00'),
            stringToTime('12:30'),
            null,
            '[)',
          ) &&
          stringToTime(curr.departureTime).isBetween(
            stringToTime('08:00'),
            stringToTime('12:30'),
            null,
            '[)',
          )
        ) {
          mealStr += lunch(curr, next);
        } else if (
          stringToTime(curr.dutyStart).isBetween(
            stringToTime('12:30'),
            stringToTime('18:00'),
            null,
            '[)',
          ) &&
          stringToTime(curr.departureTime).isBetween(
            stringToTime('12:30'),
            stringToTime('18:00'),
            null,
            '[)',
          )
        ) {
          mealStr += dinner(curr, next);
        } else if (
          stringToTime(curr.dutyStart).isBetween(
            stringToTime('18:00'),
            stringToTime('23:00'),
            null,
            '[)',
          ) &&
          stringToTime(curr.departureTime).isBetween(
            stringToTime('18:00'),
            stringToTime('23:00'),
            null,
            '[)',
          )
        ) {
          mealStr += snack(curr, next);
          mealStr && pushMeal(mealStr);
          mealStr = '';
        }
        first = false;
      } else if (first && !curr.dutyStart && curr.type === 'flight') {
        if (
          stringToTime(curr.departureTime).isBetween(
            stringToTime('03:00'),
            stringToTime('08:00'),
            null,
            '[)',
          )
          // &&
          // dayjs
          //   .duration()
          //   .add(curr.length.slice(0, -2), 'hours')
          //   .add(curr.length.slice(-2), 'minutes')
          //   .asMinutes() >= 90
        ) {
          mealStr += breakfast(curr, next);
        } else if (
          stringToTime(curr.departureTime).isBetween(
            stringToTime('08:00'),
            stringToTime('12:30'),
            null,
            '[)',
          )
        ) {
          mealStr += lunch(curr, next);
        } else if (
          stringToTime(curr.departureTime).isBetween(
            stringToTime('12:30'),
            stringToTime('18:00'),
            null,
            '[)',
          )
        ) {
          mealStr += dinner(curr, next);
        } else if (
          stringToTime(curr.departureTime).isBetween(
            stringToTime('18:00'),
            stringToTime('23:00'),
            null,
            '[)',
          )
        ) {
          mealStr += snack(curr, next);
          mealStr && pushMeal(mealStr);
          mealStr = '';
        }
        first = false;
      } else if (first && curr.type === 'layover') {
        if (
          stringToTime(curr.layoverStart).isBetween(
            stringToTime('03:00'),
            stringToTime('08:00'),
            null,
            '[)',
          )
          // &&
          // dayjs
          //   .duration()
          //   .add(curr.length.slice(0, -2), 'hours')
          //   .add(curr.length.slice(-2), 'minutes')
          //   .asMinutes() >= 90
        ) {
          mealStr += breakfast(curr, next);
          first = false;
        } else if (
          stringToTime(curr.layoverStart).isBetween(
            stringToTime('08:00'),
            stringToTime('12:30'),
            null,
            '[)',
          )
        ) {
          mealStr += lunch(curr, next);
        } else if (
          stringToTime(curr.layoverStart).isBetween(
            stringToTime('12:30'),
            stringToTime('18:00'),
            null,
            '[)',
          )
        ) {
          mealStr += dinner(curr, next);
        } else if (
          stringToTime(curr.layoverStart).isBetween(
            stringToTime('18:00'),
            stringToTime('23:00'),
            null,
            '[)',
          )
        ) {
          mealStr += snack(curr, next);
          mealStr && pushMeal(mealStr);
          mealStr = '';
        }
        first = false;
      } else if (first) {
        console.error(
          `Error determining first meal. type: ${curr.type}, dutyStart: ${curr.dutyStart}, departureTime: ${curr.departureTime}`,
        );
      }

      if (last && curr.dutyEnd && curr.type === 'flight') {
        if (
          stringToTime(curr.arrivalTime).isBetween(
            stringToTime('09:30'),
            stringToTime('13:30'),
            null,
            '(]',
          ) &&
          stringToTime(curr.dutyEnd).isBetween(
            stringToTime('09:30'),
            stringToTime('13:30'),
            null,
            '(]',
          )
        ) {
          mealStr += breakfast(curr, null);
          mealStr && pushMeal(mealStr);
          return;
        } else if (
          stringToTime(curr.arrivalTime).isBetween(
            stringToTime('13:30'),
            stringToTime('18:30'),
            null,
            '(]',
          ) &&
          stringToTime(curr.dutyEnd).isBetween(
            stringToTime('13:30'),
            stringToTime('18:30'),
            null,
            '(]',
          )
        ) {
          mealStr += lunch(curr, null);
          mealStr && pushMeal(mealStr);
          return;
        } else if (
          stringToTime(curr.arrivalTime).isBetween(
            stringToTime('18:30'),
            stringToTime('23:59'),
            null,
            '(]',
          ) &&
          stringToTime(curr.dutyEnd).isBetween(
            stringToTime('18:30'),
            stringToTime('23:59'),
            null,
            '(]',
          )
        ) {
          mealStr += dinner(curr, null);
          mealStr && pushMeal(mealStr);
          return;
        } else if (
          stringToTime(curr.arrivalTime).isBetween(
            stringToTime('01:00'),
            stringToTime('09:30'),
            null,
            '(]',
          ) &&
          stringToTime(curr.dutyEnd).isBetween(
            stringToTime('01:00'),
            stringToTime('09:30'),
            null,
            '(]',
          )
        ) {
          mealStr += snack(curr, null);
          mealStr && pushMeal(mealStr);
          return;
        }
      } else if (last) {
        console.error(
          `Error determining last meal. type: ${curr.type}, arrivalTime: ${curr.arrivalTime}, dutyEnd: ${curr.dutyEnd}`,
        );
      }

      // if (!first && !last) {
      // mealStr && console.log(`!mealStr: ${mealStr} prevChar: ${prevChar}`);

      mealStr && (prevChar = mealStr.slice(-1));

      if (!prevChar) {
        if (breakfast(curr, next)) {
          mealStr += breakfast(curr, next);
          prevChar = 'B';
        } else if (lunch(curr, next)) {
          mealStr += lunch(curr, next);
          prevChar = 'L';
        } else if (dinner(curr, next)) {
          mealStr += dinner(curr, next);
          prevChar = 'D';
        } else if (snack(curr, next)) {
          mealStr += snack(curr, next);
          mealStr && pushMeal(mealStr);
          mealStr = '';
          prevChar = 'S';
        } else {
          //
        }
      }

      //--- NEXT MEALSTR CHAR

      for (let i = 0; i <= days; i++) {
        if (i === 0) {
          if (prevChar === 'B' || prevChar === 'C') {
            if (lunch(curr, next)) {
              mealStr += lunch(curr, next);
              prevChar = 'L';
              console.log(`${i} mealStr: ${lunch(curr, next)}`);
            }
          }

          if (prevChar === 'L' || prevChar === 'M') {
            if (dinner(curr, next)) {
              mealStr += dinner(curr, next);
              prevChar = 'D';
              console.log(`${i} mealStr: ${dinner(curr, next)}`);
            }
          }

          if (prevChar === 'D' || prevChar === 'E') {
            if (snack(curr, next)) {
              mealStr += snack(curr, next, cross);
              console.log(`${i} mealStr: ${snack(curr, next)}`);
              mealStr && pushMeal(mealStr);
              mealStr = '';
              prevChar = 'S';
            }
          }

          if (prevChar === 'S' || prevChar === 'T') {
            mealStr = '';
            if (breakfast(curr, next)) {
              mealStr += breakfast(curr, next);
              console.log(`${i} mealStr: ${breakfast(curr, next)}`);
            }
          }
        } else if (curr.type === 'layover' && i === days) {
          const c = {
            type: 'layover',
            layoverStart: '00:00',
            layoverEnd: curr.layoverEnd,
            layoverStation: curr.layoverStation,
          };

          if (prevChar === 'S' || prevChar === 'T') {
            mealStr = '';
            if (breakfast(c, null, cross)) {
              mealStr += breakfast(curr, next);
              prevChar = 'B';
              // console.log(`e mealStr: ${mealStr}`);
            }
          }

          if (prevChar === 'B' || prevChar === 'C') {
            if (lunch(c, null)) {
              mealStr += lunch(c, null);
              prevChar = 'L';
              // console.log(`a mealStr: ${mealStr}`);
            }
          }

          if (prevChar === 'L' || prevChar === 'M') {
            if (dinner(c, null, cross)) {
              mealStr += dinner(curr, next);
              prevChar = 'D';
              // console.log(`a mealStr: ${mealStr}`);
            }
          }

          if (prevChar === 'D' || prevChar === 'E') {
            if (snack(c, null, cross)) {
              mealStr += snack(curr, next, cross);
              // console.log(`d mealStr: ${mealStr}`);
              mealStr && pushMeal(mealStr);
              mealStr = '';
              prevChar = 'S';
            }
          }
        } else if (i !== 0 && i !== days && curr.type === 'layover') {
          if (canadian_airport_codes.includes(curr.layoverStation)) {
            pushMeal('BLDS');
          } else if (american_airport_codes.includes(curr.layoverStation)) {
            pushMeal('CMET');
          }
        }
      }
    });
  };

  getMealsAndLocations(seq);
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

  if (meals) {
    console.log(`{meals}: ${JSON.stringify(meals, station)}`);
    return { meals, station };
  } else {
    return { meals: [], station: null };
  }
}
