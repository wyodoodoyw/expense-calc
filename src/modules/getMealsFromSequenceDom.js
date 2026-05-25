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

dayjs.extend(isBetween);
dayjs.extend(UTC);
dayjs.extend(Timezone);
dayjs.tz.setDefault('America/New_York');
dayjs.extend(AdvancedFormat);

export default function getMealsFromSequenceDom(seq = [], pairingLength) {
  if (!Array.isArray(seq) || seq.length === 0 || !pairingLength) {
    return { meals: [], station: null };
  }

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
      console.log(`\nIndex: ${i}, Type: ${curr.type}`);
      console.log(`prev: ${prevChar}`);

      let start;
      let end;

      const cross = crossesMidnight(curr);
      console.log(`crosses: ${cross}`);

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

      cross && console.log(`days: ${days}`);

      if (curr.type === 'flight') {
        start = dayjs()
          .tz()
          .set('hour', curr.departureTime.slice(0, -2))
          .set('minute', curr.departureTime.slice(-2))
          .startOf('minute');
        end = dayjs()
          .tz()
          .set('hour', curr.arrivalTime.slice(0, -2))
          .set('minute', curr.arrivalTime.slice(-2))
          .startOf('minute');
      } else if (curr.type === 'layover') {
        start = dayjs()
          .tz()
          .set('hour', curr.layoverStart.slice(0, -2))
          .set('minute', curr.layoverStart.slice(-2))
          .startOf('minute');
        end = dayjs()
          .tz()
          .set('hour', curr.layoverEnd.slice(0, -2))
          .set('minute', curr.layoverEnd.slice(-2))
          .startOf('minute');
      }

      console.log(
        `start: ${start.format('HH:mm')} to end: ${end.format('HH:mm')}`,
      );

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
      mealStr && console.log(`!mealStr: ${mealStr} prevChar: ${prevChar}`);

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
        console.log(`! first char: ${mealStr}`);
      }

      //--- NEXT MEALSTR CHAR

      for (let i = 0; i <= days; i++) {
        if (prevChar === 'B' || prevChar === 'C') {
          if (lunch(curr, next)) {
            mealStr += lunch(curr, next);
            prevChar = 'L';
            console.log(`a mealStr: ${mealStr}`);
          }
        }

        if (prevChar === 'L' || prevChar === 'M') {
          if (dinner(curr, next)) {
            mealStr += dinner(curr, next);
            prevChar = 'D';
            console.log(`a mealStr: ${mealStr}`);
          }
        }

        if (prevChar === 'D' || prevChar === 'E') {
          if (snack(curr, next)) {
            mealStr += snack(curr, next);
            console.log(`d mealStr: ${mealStr}`);
            mealStr && pushMeal(mealStr);
            mealStr = '';
            prevChar = 'S';
          }
        }

        if (prevChar === 'S' || prevChar === 'T') {
          mealStr = '';
          if (breakfast(curr, next)) {
            mealStr += breakfast(curr, next);
            console.log(`e mealStr: ${mealStr}`);
          }
        }
      }
    });
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
    console.log(`{meals}: ${JSON.stringify(meals, station)}`);
    return { meals, station };
  } else {
    return { meals: [], station: null };
  }
}
