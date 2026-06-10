import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
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

  const includesMeal = (meal, start, end, dutyEnd) => {
    if (!meal || !start || !end) return;

    console.log(
      `includesMeal - ${meal.canChar} test: ${meal.test} from: ${start} to: ${end}, dutyEnd: ${dutyEnd}`,
    );

    if (
      !dutyEnd &&
      stringToTime(meal.test).isBetween(
        stringToTime(start),
        stringToTime(end),
        'minute',
        '[]',
      )
    ) {
      return true;
    } else if (
      dutyEnd &&
      stringToTime(meal.end).isBefore(stringToTime(dutyEnd)) &&
      stringToTime(meal.test).isBetween(
        stringToTime(start),
        stringToTime(end),
        'minute',
        '[]',
      )
    ) {
      return true;
    } else {
      return false;
    }
  };

  const canOrUsFlight = (deptTime, meal, startLoc, endLoc) => {
    if (!deptTime || !meal || !startLoc || !endLoc) return;

    const time = stringToTime(deptTime);
    const test = stringToTime(meal.test);

    if (meal === b) {
      if (canadian_airport_codes.includes(startLoc)) {
        return 'B';
      } else if (american_airport_codes.includes(startLoc)) {
        return 'C';
      }
    } else {
      if (
        time.isBefore(test, 'minutes') &&
        canadian_airport_codes.includes(endLoc)
      ) {
        return meal.canChar;
      } else if (
        time.isBefore(test, 'minutes') &&
        american_airport_codes.includes(endLoc)
      ) {
        return meal.usChar;
      } else if (
        time.isAfter(test, 'minutes') &&
        canadian_airport_codes.includes(startLoc)
      ) {
        return meal.canChar;
      } else if (
        time.isAfter(test) &&
        american_airport_codes.includes(startLoc)
      ) {
        return meal.usChar;
      }
    }
  };

  const canOrUsLayoverOrSit = (meal, station) => {
    if (!meal || !station) return;

    if (canadian_airport_codes.includes(station)) {
      return meal.canChar;
    } else if (american_airport_codes.includes(station)) {
      return meal.usChar;
    }
  };

  const getLayoverDays = (s, e, len, dhBefore, dhAfter) => {
    if (!s || !e || !len) return;

    const startHH = Number(s.slice(0, -2));
    const startMM = Number(s.slice(-2));
    const endHH = Number(e.slice(0, -2));
    const endMM = Number(e.slice(-2));
    const durHH = Number(len.slice(0, -2));
    const durMM = Number(len.slice(-2));

    // const layoverLength = dayjs.duration({ hours: durHH, minutes: durMM });
    let newLen = dayjs
      .duration({
        hours: durHH,
        minutes: durMM,
      })
      .add({ hours: 1, minutes: 15 });

    if (dhBefore) {
      newLen = newLen.subtract({ minutes: 15 });
    }
    if (dhAfter) {
      newLen = newLen.subtract({ minutes: 30 });
    }

    const lengthDayOne = dayjs
      .duration({ hours: 24 })
      .subtract({ hours: startHH, minutes: startMM });
    const lengthLastDay = dayjs.duration({ hours: endHH, minutes: endMM });

    console.log(
      `getLayoverDays - start: ${s} end: ${e} newLen: ${newLen.format('HH:mm')} before? ${dhBefore} after? ${dhAfter}`,
    );

    if (lengthDayOne > newLen) {
      return 0;
    } else {
      if (newLen.subtract(lengthDayOne).subtract(lengthLastDay) <= 0) {
        return 1;
      } else {
        // add logic for full days BLDS or CMET
        return 2;
      }
    }
  };

  const getMealsAndLocations = (seq) => {
    if (!seq) return;

    let mealStr = '';

    seq.forEach((curr, i, arr) => {
      const prev = arr[i - 1] || null;
      const next = arr[i + 1] || null;
      const last = i === arr.length - 1;

      const start = curr.departureTime;
      const end = curr.arrivalTime;
      const startLoc = curr.departureAirport;
      const endLoc = curr.arrivalAirport;
      let dutyEnd;
      if (curr.dutyEnd) {
        dutyEnd = curr.dutyEnd;
        console.log(`dutyEnd: ${dutyEnd}`);
      } else if (next && next.dutyEnd) {
        dutyEnd = next.dutyEnd;
        console.log(`dutyEnd from next: ${dutyEnd}`);
      }

      //--- FLIGHT
      if (curr.type === 'flight') {
        // if (!dutyEnd) {
        if (includesMeal(b, start, end, dutyEnd)) {
          mealStr += canOrUsFlight(start, b, startLoc, endLoc) || '';
        }
        if (includesMeal(l, start, end, dutyEnd)) {
          mealStr += canOrUsFlight(start, l, startLoc, endLoc) || '';
        }
        if (includesMeal(d, start, end, dutyEnd)) {
          mealStr += canOrUsFlight(start, d, startLoc, endLoc) || '';
        }
        if (includesMeal(s, start, end, dutyEnd)) {
          mealStr += canOrUsFlight(start, s, startLoc, endLoc) || '';
          mealStr && pushMeal(mealStr);
          mealStr = '';
        }

        if (next && next.type === 'flight') {
          //checks time between flights (airport sit)

          const sitStart = curr.arrivalTime;
          const sitEnd = next.departureTime;
          const sitStation = curr.arrivalAirport;
          console.log(`sit ${sitStart} - ${sitEnd} at ${sitStation}`);

          if (!dutyEnd) {
            if (includesMeal(b, sitStart, sitEnd, undefined)) {
              mealStr += canOrUsLayoverOrSit(b, sitStation) || '';
            }
            if (includesMeal(l, sitStart, sitEnd, undefined)) {
              mealStr += canOrUsLayoverOrSit(l, sitStation) || '';
            }
            if (includesMeal(d, sitStart, sitEnd, undefined)) {
              mealStr += canOrUsLayoverOrSit(d, sitStation) || '';
            }
            if (includesMeal(s, sitStart, sitEnd, undefined)) {
              mealStr += canOrUsLayoverOrSit(s, sitStation) || '';
              mealStr && pushMeal(mealStr);
              mealStr = '';
            }
          } else if (
            dutyEnd &&
            stringToTime(b.end).isBefore(stringToTime(dutyEnd))
          ) {
            if (includesMeal(b, sitStart, sitEnd, undefined)) {
              mealStr += canOrUsLayoverOrSit(b, sitStation) || '';
            }
          } else if (
            dutyEnd &&
            stringToTime(l.end).isBefore(stringToTime(dutyEnd))
          ) {
            if (includesMeal(l, sitStart, sitEnd, undefined)) {
              mealStr += canOrUsLayoverOrSit(l, sitStation) || '';
            }
          } else if (
            dutyEnd &&
            stringToTime(d.end).isBefore(stringToTime(dutyEnd))
          ) {
            if (includesMeal(d, sitStart, sitEnd, undefined)) {
              mealStr += canOrUsLayoverOrSit(d, sitStation) || '';
            }
          } else if (
            dutyEnd &&
            stringToTime(s.end).isBefore(stringToTime(dutyEnd))
          ) {
            if (includesMeal(s, sitStart, sitEnd, undefined)) {
              mealStr += canOrUsLayoverOrSit(s, sitStation) || '';
              mealStr && pushMeal(mealStr);
              mealStr = '';
            }
          }
          console.log(`after sit mealStr: ${mealStr}`);
        }
      } else if (curr.type === 'layover') {
        let start;
        let end;
        const len = curr.layoverLength;
        const station = curr.layoverStation;
        const dhBefore = prev && prev.isDeadhead;
        const dhAfter = next && next.isDeadhead;
        const days = getLayoverDays(
          curr.layoverStart,
          curr.layoverEnd,
          len,
          dhBefore,
          dhAfter,
        );

        for (let j = 0; j <= days; j++) {
          console.log(`j: ${j}`);
          // set start and end
          if (j === 0 && days === 0) {
            start = curr.layoverStart;
            end = curr.layoverEnd;
            console.log(`opt 1 start: ${start} - end: ${end}`);
          } else if (j === 0 && j !== days) {
            start = curr.layoverStart;
            end = '23:59';
            console.log(`opt 2start: ${start} - end: ${end}`);
          } else if (j !== 0 && j === days) {
            start = '00:00';
            end = curr.layoverEnd;
            console.log(`opt 3start: ${start} - end: ${end}`);
          }
          // add mealsChars if meal included on layover
          if (includesMeal(b, start, end, undefined)) {
            mealStr += canOrUsLayoverOrSit(b, station) || '';
          }
          if (includesMeal(l, start, end, undefined)) {
            mealStr += canOrUsLayoverOrSit(l, station) || '';
          }
          if (includesMeal(d, start, end, undefined)) {
            mealStr += canOrUsLayoverOrSit(d, station) || '';
          }
          if (includesMeal(s, start, end, undefined)) {
            mealStr += canOrUsLayoverOrSit(s, station) || '';
            mealStr && pushMeal(mealStr);
            mealStr = '';
          }
        }
      }
      if (last) {
        mealStr && pushMeal(mealStr);
      }
      console.log(`i: ${i} - mealStr: ${mealStr}`);
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
