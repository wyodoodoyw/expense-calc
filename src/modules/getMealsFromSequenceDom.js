import dayjs from 'dayjs';
import isBetween from 'dayjs';
import duration from 'dayjs/plugin/duration';
import stringToTime from './stringToTime';
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';
import { b, l, d, s } from '../data/mealConstants';

dayjs.extend(isBetween);
dayjs.extend(duration);

export default async function getMealsFromSequenceDom(pIdentifier, seq = []) {
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
      station: station,
    });
  };

  const getMealChar = (meal, start, end, startLoc, endLoc) => {
    if (
      stringToTime(meal.test).isBetween(
        stringToTime(start),
        stringToTime(end),
        'minute',
        '[]',
      )
    ) {
      if (canadian_airport_codes.includes(station)) {
        if (meal === b) {
          return 'B';
        }
        if (meal === l) {
          return 'L';
        }
        if (meal === d) {
          return 'D';
        }
        if (meal === s) {
          return 'S';
        }
      }
      if (american_airport_codes.includes(station)) {
        if (meal === b) {
          return 'C';
        }
        if (meal === l) {
          return 'M';
        }
        if (meal === d) {
          return 'E';
        }
        if (meal === s) {
          return 'T';
        }
      }
    }
  };

  const getLayoverDays = (s, e, len) => {
    if (!s || !e || !len) return;

    const startHH = Number(s.slice(0, -2));
    const startMM = Number(s.slice(-2));
    const endHH = Number(e.slice(0, -2));
    const endMM = Number(e.slice(-2));
    const durHH = Number(len.slice(0, -2));
    const durMM = Number(len.slice(-2));

    const layoverLength = dayjs.duration({ hours: durHH, minutes: durMM });
    const newLen = dayjs
      .duration({
        hours: durHH,
        minutes: durMM,
      })
      .add({ hours: 1, minutes: 15 });

    console.log(
      `length: ${layoverLength.asMinutes()} new: ${JSON.stringify(newLen.asMinutes())}`,
    );

    // const lengthDay = dayjs.duration({ hours: 24 }).asMinutes();
    const lengthDayOne = dayjs
      .duration({ hours: 24 })
      .subtract({ hours: startHH, minutes: startMM });
    const lengthLastDay = dayjs.duration({ hours: endHH, minutes: endMM });

    if (lengthDayOne > newLen) {
      console.log(`same day`);
      return 0;
    } else {
      if (newLen.subtract(lengthDayOne).subtract(lengthLastDay) <= 0) {
        console.log(`spans two days`);
        return 1;
      } else {
        console.log(`spans three days`);
        return 2;
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

      if (curr.type === 'flight' && next && next.type === 'flight') {
        const start = curr.departureTime;
        const end = next.departureTime;
        const startLoc = curr.departureAirport;
        const endLoc = curr.arrivalAirport;

        console.log(`${i}: ${getMealChar(b, start, end, startLoc, endLoc)}`);
        console.log(`${i}: ${getMealChar(l, start, end, startLoc, endLoc)}`);
        console.log(`${i}: ${getMealChar(d, start, end, startLoc, endLoc)}`);
        console.log(`${i}: ${getMealChar(s, start, end, startLoc, endLoc)}`);
        mealStr += getMealChar(b, start, end, startLoc, endLoc) || '';
        mealStr += getMealChar(l, start, end, startLoc, endLoc) || '';
        mealStr += getMealChar(d, start, end, startLoc, endLoc) || '';
        if (getMealChar(s, start, end, startLoc, endLoc)) {
          mealStr += getMealChar(s, start, end, startLoc, endLoc) || '';
          mealStr && pushMeal(mealStr);
          mealStr = '';
        }
      } else if (curr.type === 'flight') {
        const start = curr.departureTime;
        const end = curr.arrivalTime;
        const startLoc = curr.departureAirport;
        const endLoc = curr.arrivalAirport;

        console.log(`${i}: ${getMealChar(b, start, end, startLoc, endLoc)}`);
        console.log(`${i}: ${getMealChar(l, start, end, startLoc, endLoc)}`);
        console.log(`${i}: ${getMealChar(d, start, end, startLoc, endLoc)}`);
        console.log(`${i}: ${getMealChar(s, start, end, startLoc, endLoc)}`);
        mealStr += getMealChar(b, start, end, startLoc, endLoc) || '';
        mealStr += getMealChar(l, start, end, startLoc, endLoc) || '';
        mealStr += getMealChar(d, start, end, startLoc, endLoc) || '';
        if (getMealChar(s, start, end, startLoc, endLoc)) {
          mealStr += getMealChar(s, start, end, startLoc, endLoc) || '';
          mealStr && pushMeal(mealStr);
          mealStr = '';
        }
      } else if (curr.type === 'layover') {
        const start = curr.layoverStart;
        const end = curr.layoverEnd;
        const len = curr.layoverLength;
        const startLoc = curr.layoverStation;
        const endLoc = curr.layoverStation;
        const days = getLayoverDays(start, end, len);

        for (let j = 0; j <= days; j++) {
          console.log(`j: ${j}`);
          if (j === 0 && days === 0) {
            console.log(`j === 0 && days === 0)`);
            console.log(
              `${i}: ${getMealChar(b, start, end, startLoc, endLoc)}`,
            );
            console.log(
              `${i}: ${getMealChar(l, start, end, startLoc, endLoc)}`,
            );
            console.log(
              `${i}: ${getMealChar(d, start, end, startLoc, endLoc)}`,
            );
            console.log(
              `${i}: ${getMealChar(s, start, end, startLoc, endLoc)}`,
            );
            mealStr += getMealChar(b, start, end, startLoc, endLoc) || '';
            mealStr += getMealChar(l, start, end, startLoc, endLoc) || '';
            mealStr += getMealChar(d, start, end, startLoc, endLoc) || '';
            if (getMealChar(s, start, end, startLoc, endLoc)) {
              mealStr += getMealChar(s, start, end, startLoc, endLoc) || '';
              mealStr && pushMeal(mealStr);
              mealStr = '';
            }
          } else if (j === 0 && j !== days) {
            console.log(`j === 0 && j !== days`);
            console.log(
              `${i}: ${getMealChar(b, start, '23:59', startLoc, endLoc)}`,
            );
            console.log(
              `${i}: ${getMealChar(l, start, '23:59', startLoc, endLoc)}`,
            );
            console.log(
              `${i}: ${getMealChar(d, start, '23:59', startLoc, endLoc)}`,
            );
            console.log(
              `${i}: ${getMealChar(s, start, '23:59', startLoc, endLoc)}`,
            );
            mealStr += getMealChar(b, start, '23:59', startLoc, endLoc) || '';
            mealStr += getMealChar(l, start, '23:59', startLoc, endLoc) || '';
            mealStr += getMealChar(d, start, '23:59', startLoc, endLoc) || '';
            if (getMealChar(s, start, '23:59', startLoc, endLoc)) {
              mealStr += getMealChar(s, start, '23:59', startLoc, endLoc) || '';
              mealStr && pushMeal(mealStr);
              mealStr = '';
            }
          } else if (j !== 0 && j === days) {
            console.log(`j !== 0 && j === days`);
            console.log(
              `${i}: ${getMealChar(b, '00:00', end, startLoc, endLoc)}`,
            );
            console.log(
              `${i}: ${getMealChar(l, '00:00', end, startLoc, endLoc)}`,
            );
            console.log(
              `${i}: ${getMealChar(d, '00:00', end, startLoc, endLoc)}`,
            );
            console.log(
              `${i}: ${getMealChar(s, '00:00', end, startLoc, endLoc)}`,
            );
            mealStr += getMealChar(b, '00:00', end, startLoc, endLoc) || '';
            mealStr += getMealChar(l, '00:00', end, startLoc, endLoc) || '';
            mealStr += getMealChar(d, '00:00', end, startLoc, endLoc) || '';
            if (getMealChar(s, '00:00', end, startLoc, endLoc)) {
              mealStr += getMealChar(s, '00:00', end, startLoc, endLoc) || '';
              mealStr && pushMeal(mealStr);
              mealStr = '';
            }
          } else {
            console.log(`j !== 0 && j !== days`);
            if (canadian_airport_codes.includes(curr.layoverStation)) {
              console.log(`${i}: BLDS`);
            } else if (american_airport_codes.includes(curr.layoverStation)) {
              console.log(`${i}: CMET`);
            }
          }
        }
      }
      if (last) {
        mealStr && pushMeal(mealStr);
      }
    });
  };

  await getMealsAndLocations(seq);
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
    return { meals };
  } else {
    return { meals: [], station: null };
  }
}
