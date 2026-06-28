import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import stringToTime from './stringToTime';
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';
import sun_domestic_airport_codes from '../data/sun_domestic_airport_codes';
import { b, l, d, s } from '../data/mealConstants';
import timezones from '../data/timezones';
// import getTimezone from './getTimezone';

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

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

  const includesMeal = (meal, dutyStart, start, end, dutyEnd) => {
    if (!meal || !start || !end) return;

    console.log(
      `includesMeal - ${meal.canChar} test: ${meal.test} ** dutyStart: ${dutyStart}, start: ${start} to: ${end}, dutyEnd: ${dutyEnd}`,
    );

    // Breakfast

    if (meal === b || meal === l) {
      if (dutyStart && dutyEnd) {
        // one-day pairing
        if (
          stringToTime(meal.start).isAfter(stringToTime(dutyStart)) &&
          stringToTime(meal.end).isBefore(stringToTime(dutyEnd)) &&
          stringToTime(meal.test).isBetween(
            stringToTime(start),
            stringToTime(end),
            'minute',
            '[]',
          )
        ) {
          return true;
        }
      } else if (dutyStart && !dutyEnd) {
        // first day of multi-day pairing
        if (
          stringToTime(meal.start).isAfter(stringToTime(dutyStart)) &&
          stringToTime(meal.test).isBetween(
            stringToTime(start),
            stringToTime(end),
            'minute',
            '[]',
          )
        ) {
          return true;
        }
      } else if (!dutyStart && dutyEnd) {
        // last day of multi-day pairing
        if (
          stringToTime(meal.end).isBefore(stringToTime(dutyEnd)) &&
          stringToTime(meal.test).isBetween(
            stringToTime(start),
            stringToTime(end),
            'minute',
            '[]',
          )
        ) {
          return true;
        }
      } else {
        // neither first nor last day of multi-day pairing
        if (
          stringToTime(meal.test).isBetween(
            stringToTime(start),
            stringToTime(end),
            'minute',
            '[]',
          )
        ) {
          return true;
        }
      }
    } else if (meal === d) {
      if (dutyStart && dutyEnd) {
        // one-day pairing
        if (
          stringToTime(meal.deptStart).isAfter(stringToTime(start)) &&
          stringToTime(meal.arrEnd).isBefore(stringToTime(end))
        ) {
          return true;
        }
      } else if (dutyStart && !dutyEnd) {
        // first day of multi-day pairing
        if (
          stringToTime(meal.deptStart).isAfter(stringToTime(start)) &&
          stringToTime(meal.test).isBetween(
            stringToTime(start),
            stringToTime(end),
            'minute',
            '[]',
          )
        ) {
          return true;
        }
      } else if (!dutyStart && dutyEnd) {
        // last day of multi-day pairing
        if (
          stringToTime(meal.arrEnd).isBefore(stringToTime(end)) &&
          stringToTime(meal.test).isBetween(
            stringToTime(start),
            stringToTime(end),
            'minute',
            '[]',
          )
        ) {
          return true;
        }
      } else {
        // neither first nor last day of multi-day pairing
        if (
          stringToTime(meal.test).isBetween(
            stringToTime(start),
            stringToTime(end),
            'minute',
            '[]',
          )
        ) {
          return true;
        }
      }
    } else if (meal === s) {
      if (dutyStart && dutyEnd) {
        // one-day pairing
        if (
          stringToTime(meal.start).isAfter(stringToTime(dutyStart)) &&
          stringToTime(meal.end).isBetween(
            stringToTime(dutyEnd),
            stringToTime('03:00'),
            'minute',
            '[]',
          ) &&
          stringToTime(meal.test).isBetween(
            stringToTime(start),
            stringToTime(end),
            'minute',
            '[]',
          )
        ) {
          return true;
        }
      } else if (dutyStart && !dutyEnd) {
        // first day of multi-day pairing
        if (
          stringToTime(meal.start).isAfter(stringToTime(dutyStart)) &&
          // stringToTime(meal.end).isBefore(stringToTime(dutyEnd)) &&
          stringToTime(meal.test).isBetween(
            stringToTime(start),
            stringToTime(end),
            'minute',
            '[]',
          )
        ) {
          return true;
        }
      } else if (!dutyStart && dutyEnd) {
        // last day of multi-day pairing
        if (
          stringToTime(meal.end).isBefore(stringToTime(end)) &&
          stringToTime(meal.end).isBetween(
            stringToTime(dutyEnd),
            stringToTime('03:00'),
            'minute',
            '[]',
          ) &&
          stringToTime(meal.test).isBetween(
            stringToTime(start),
            stringToTime(end),
            'minute',
            '[]',
          )
        ) {
          return true;
        }
      } else {
        // neither first nor last day of multi-day pairing
        if (
          stringToTime(meal.test).isBetween(
            stringToTime(start),
            stringToTime(end),
            'minute',
            '[]',
          )
        ) {
          return true;
        }
      }
    }
  };

  const canOrUsFlight = (deptTime, meal, startLoc, endLoc) => {
    if (!deptTime || !meal || !startLoc || !endLoc) return;

    const time = stringToTime(deptTime);
    const test = stringToTime(meal.test);

    if (meal === b) {
      // Breakfast is always paid at the rate of the country of departure.
      if (canadian_airport_codes.includes(startLoc)) {
        return 'B';
      } else if (american_airport_codes.includes(startLoc)) {
        return 'C';
      } else if (sun_domestic_airport_codes.includes(startLoc)) {
        return 'B';
      }
    } else {
      // If flight departs prior to [test] the [meal] is paid at the rate of the country of destination.
      // If flight departas at [test] or later, the [meal] is paid at the rate of the country of departure.
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
        time.isBefore(test, 'minutes') &&
        sun_domestic_airport_codes.includes(endLoc)
      ) {
        return meal.canChar;
      } else if (
        time.isAfter(test, 'minutes') &&
        canadian_airport_codes.includes(startLoc)
      ) {
        return meal.canChar;
      } else if (
        time.isAfter(test, 'minutes') &&
        american_airport_codes.includes(startLoc)
      ) {
        return meal.usChar;
      } else if (
        time.isAfter(test, 'minutes') &&
        sun_domestic_airport_codes.includes(endLoc)
      ) {
        return meal.canChar;
      }
    }
  };

  const canOrUsLayoverOrSit = (meal, station) => {
    if (!meal || !station) return;

    if (canadian_airport_codes.includes(station)) {
      return meal.canChar;
    } else if (american_airport_codes.includes(station)) {
      return meal.usChar;
    } else if (sun_domestic_airport_codes.includes(station)) {
      return meal.canChar;
    }
  };

  const getFlightDays = (s, e, len, isDH, startStation, endStation) => {
    if (!s || !e || !len || !startStation || !endStation) return 0;

    // start time (departure)
    const startHH = Number(s.slice(0, -2));
    const startMM = Number(s.slice(-2));
    // const startTZ = getTimezone(startStation);
    const startTZ = timezones[startStation];
    const startTime = dayjs()
      .set('hour', startHH)
      .set('minute', startMM)
      .tz(startTZ, true);
    // end time (arrival)
    const endHH = Number(e.slice(0, -2));
    const endMM = Number(e.slice(-2));
    // const endTZ = getTimezone(endStation);
    const endTZ = timezones[endStation];
    const endTime = dayjs()
      .set('hour', endHH)
      .set('minute', endMM)
      .tz(endTZ, true);
    const offset = startTime.$offset - endTime.$offset;

    // flight time
    const durHH = Number(len.slice(0, -2));
    const durMM = Number(len.slice(-2));

    let calculatedFlightTime;

    if (endTime.isBefore(startTime)) {
      calculatedFlightTime = dayjs
        .duration({ hours: 24 })
        .subtract({ hours: startHH, minutes: startMM })
        .add({ hours: endHH, minutes: endMM });
    } else {
      calculatedFlightTime = dayjs
        .duration(endTime.diff(startTime))
        .subtract({ minutes: offset });
    }

    let flightLength = dayjs.duration({ hours: durHH, minutes: durMM });

    if (isDH) {
      // double to flight length to complesate for 1/2 credit
      flightLength.add({ hours: durHH, minutes: durMM });
    }

    const lengthDayOne = dayjs
      .duration({ hours: 24 })
      .subtract({ hours: startHH, minutes: startMM });

    if (lengthDayOne > calculatedFlightTime) {
      return 0;
    } else {
      return 1;
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

      let start;
      let end;
      const flDays = getFlightDays(
        curr.departureTime,
        curr.arrivalTime,
        curr.flightTime,
        curr.isDeadhead,
        curr.departureAirport,
        curr.arrivalAirport,
      );

      const startLoc = curr.departureAirport;
      const endLoc = curr.arrivalAirport;

      //--- FLIGHT
      if (curr.type === 'flight') {
        for (let j = 0; j <= flDays; j++) {
          // if (!dutyEnd) {
          if (j === 0 && flDays === 0) {
            start = curr.departureTime;
            end = curr.arrivalTime;
          } else if (j === 0 && j !== flDays) {
            start = curr.departureTime;
            end = '23:59';
          } else if (j !== 0 && j === flDays) {
            start = '00:00';
            end = curr.arrivalTime;
          }
          console.log(`line 246 ${start} - end: ${end} flDays: ${flDays}`);
          if (includesMeal(b, curr.dutyStart, start, end, curr.dutyEnd)) {
            mealStr += canOrUsFlight(start, b, startLoc, endLoc) || '';
          }
          if (includesMeal(l, curr.dutyStart, start, end, curr.dutyEnd)) {
            mealStr += canOrUsFlight(start, l, startLoc, endLoc) || '';
          }
          if (includesMeal(d, curr.dutyStart, start, end, curr.dutyEnd)) {
            mealStr += canOrUsFlight(start, d, startLoc, endLoc) || '';
          }
          if (includesMeal(s, curr.dutyStart, start, end, curr.dutyEnd)) {
            mealStr += canOrUsFlight(start, s, startLoc, endLoc) || '';
            mealStr && pushMeal(mealStr);
            mealStr = '';
          }
        }

        if (next && next.type === 'flight') {
          //checks time between flights (airport sit)

          const sitStart = curr.arrivalTime;
          const sitEnd = next.departureTime;
          const sitStation = curr.arrivalAirport;
          console.log(`sit ${sitStart} - ${sitEnd} at ${sitStation}`);

          // if (!dutyEnd) {
          if (includesMeal(b, curr.dutyStart, sitStart, sitEnd, curr.dutyEnd)) {
            mealStr += canOrUsLayoverOrSit(b, curr.departureAirport) || '';
          }
          if (includesMeal(l, curr.dutyStart, sitStart, sitEnd, curr.dutyEnd)) {
            mealStr += canOrUsLayoverOrSit(l, sitStation) || '';
          }
          if (includesMeal(d, curr.dutyStart, sitStart, sitEnd, curr.dutyEnd)) {
            mealStr += canOrUsLayoverOrSit(d, sitStation) || '';
          }
          if (includesMeal(s, curr.dutyStart, sitStart, sitEnd, curr.dutyEnd)) {
            mealStr += canOrUsLayoverOrSit(s, sitStation) || '';
            mealStr && pushMeal(mealStr);
            mealStr = '';
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
            // console.log(`opt 1 start: ${start} - end: ${end}`);
          } else if (j === 0 && j !== days) {
            start = curr.layoverStart;
            end = '23:59';
            // console.log(`opt 2start: ${start} - end: ${end}`);
          } else if (j !== 0 && j === days) {
            start = '00:00';
            end = curr.layoverEnd;
            // console.log(`opt 3start: ${start} - end: ${end}`);
          }
          // add mealsChars if meal included on layover
          if (includesMeal(b, undefined, start, end, undefined)) {
            mealStr += canOrUsLayoverOrSit(b, station) || '';
          }
          if (includesMeal(l, undefined, start, end, undefined)) {
            mealStr += canOrUsLayoverOrSit(l, station) || '';
          }
          if (includesMeal(d, undefined, start, end, undefined)) {
            mealStr += canOrUsLayoverOrSit(d, station) || '';
          }
          if (includesMeal(s, undefined, start, end, undefined)) {
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

  if (meals) {
    console.log(`{meals}: ${JSON.stringify(meals, station)}`);
    return { meals };
  } else {
    return { meals: [], station: null };
  }
}
