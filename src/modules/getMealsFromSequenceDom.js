import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import stringToTime from './stringToTime';
import stringToDate from './stringToDate';
import includesMeal from './includesMeal';
import includesMealLayover from './includesMealLayover';
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';
import sun_domestic_airport_codes from '../data/sun_domestic_airport_codes';
import { b, l, d, s } from '../data/mealConstants';
import timezones from '../data/timezones';

// import getTimezone from './getTimezone';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

export default async function getMealsFromSequenceDom(
  pIdentifier,
  seq = [],
  tafb = '0000',
) {
  if (!Array.isArray(seq) || seq.length === 0) {
    return { meals: [], station: null };
  }

  console.log(`${pIdentifier}`);
  const meals = [];
  let station = 'YYZ';

  const pushMeal = (mealStr) => {
    if (!mealStr) return;
    meals.push({
      index: meals.length,
      meals: mealStr,
      station: station,
    });
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
        station = startLoc;
        return 'A';
      }
    } else {
      // If flight departs prior to [test] the [meal] is paid at the rate of the country of destination.
      // If flight departas at [test] or later, the [meal] is paid at the rate of the country of departure.
      if (time.isBefore(test, 'minutes')) {
        if (canadian_airport_codes.includes(endLoc)) {
          return meal.canChar;
        } else if (american_airport_codes.includes(endLoc)) {
          return meal.usChar;
        } else if (sun_domestic_airport_codes.includes(endLoc)) {
          station = endLoc;
          return meal.intChar;
        }
      } else if (time.isSameOrAfter(test, 'minutes')) {
        if (canadian_airport_codes.includes(startLoc)) {
          return meal.canChar;
        } else if (american_airport_codes.includes(startLoc)) {
          return meal.usChar;
        } else if (sun_domestic_airport_codes.includes(endLoc)) {
          station = endLoc;
          return meal.intChar;
        }
      }
    }
  };

  const canOrUsLayoverOrSit = (meal, stn) => {
    if (!meal || !station) return;

    if (canadian_airport_codes.includes(stn)) {
      return meal.canChar;
    } else if (american_airport_codes.includes(stn)) {
      return meal.usChar;
    } else if (sun_domestic_airport_codes.includes(stn)) {
      station = stn;
      return meal.intChar;
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
      newLen = newLen.subtract({ hours: 1 });
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
    } else if (newLen.subtract(lengthDayOne).subtract(lengthLastDay) <= 0) {
      return 1;
    } else {
      return 2;
    }
  };

  const getMealsAndLocations = (seq, tafb) => {
    if (!seq) return;

    let mealStr = '';

    const dutyStart = dayjs(`2000-01-01`)
      .set('hour', `${seq[0].dutyStart.slice(0, -2)}`)
      .set('minute', `${seq[0].dutyStart.slice(-2)}`);

    const dutyEnd = dutyStart
      .add(tafb.slice(0, -2), 'hours')
      .add(tafb.slice(-2), 'minutes');

    seq.forEach((curr, i, arr) => {
      if (seq[i].type === 'flight') {
        console.log(`Duty Day: ${seq[i].dutyDay}`);
      }

      let day = seq[i].dutyDay;
      const prev = arr[i - 1] || null;
      const next = arr[i + 1] || null;
      const firstDutyDay = i === 0;
      // console.log(`!${seq[i].dutyDay === seq[seq.length - 1].dutyDay}`);
      // const lastDutyDay = seq[i].dutyDay === seq[seq.length - 1].dutyDay;
      const lastDutyDay = arr[arr.length - 1].dutyDay;
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
      const firstDept = stringToDate(arr[0].departureTime, 0);
      const lastArr = stringToDate(
        arr[arr.length - 1].arrivalTime,
        arr[arr.length - 1].dutyDay,
      );

      const includesMSPP =
        arr[i].mealsOnboard &&
        (arr[i].mealsOnboard.includes('MS') ||
          arr[i].mealsOnboard.includes('PP'));

      //--- FLIGHT
      if (curr.type === 'flight') {
        // for (let j = 0; j <= flDays; j++) {
        start = stringToDate(curr.departureTime, day);

        if (
          start
            .add(curr.flightTime.slice(0, -2), 'hour')
            .add(curr.flightTime.slice(-2), 'minute')
            .isSame(start, 'day')
        ) {
          end = stringToDate(curr.arrivalTime, day);
        } else {
          end = stringToDate(curr.arrivalTime, day + 1);
        }
        console.log(
          `flight ${start.tz('America/Toronto').format('HH:mm')} - ${end.tz('America/Toronto').format('HH:mm')} at ${curr.departureAirport}`,
        );

        if (
          includesMeal(
            b,
            day,
            dutyStart,
            firstDept,
            start,
            end,
            lastArr,
            dutyEnd,
            firstDutyDay,
            lastDutyDay,
          )
        ) {
          mealStr += canOrUsFlight(start, b, startLoc, endLoc) || '';
        }

        if (
          includesMeal(
            l,
            day,
            dutyStart,
            firstDept,
            start,
            end,
            lastArr,
            dutyEnd,
            firstDutyDay,
            lastDutyDay,
          )
        ) {
          mealStr +=
            canOrUsFlight(
              start.tz('America/Toronto').format('HHmm'),
              l,
              startLoc,
              endLoc,
            ) || '';
        }
        if (
          includesMeal(
            d,
            day,
            dutyStart,
            firstDept,
            start,
            end,
            lastArr,
            dutyEnd,
            firstDutyDay,
            lastDutyDay,
          )
        ) {
          mealStr +=
            canOrUsFlight(
              start.tz('America/Toronto').format('HHmm'),
              d,
              startLoc,
              endLoc,
            ) || '';
        }
        if (
          // !includesMSPP &&
          includesMeal(
            s,
            day,
            dutyStart,
            firstDept,
            start,
            end,
            lastArr,
            dutyEnd,
            firstDutyDay,
            lastDutyDay,
          )
        ) {
          mealStr +=
            canOrUsFlight(
              start.tz('America/Toronto').format('HHmm'),
              s,
              startLoc,
              endLoc,
            ) || '';
          mealStr && pushMeal(mealStr);
          mealStr = '';
          // }
          // }
        }

        if (next && next.type === 'flight') {
          //checks time between flights (airport sit)

          const sitStart = stringToDate(curr.arrivalTime, curr.dutyDay);
          const sitEnd = stringToDate(next.departureTime, next.dutyDay);
          const sitStation = curr.arrivalAirport;
          console.log(
            `sit ${sitStart.tz('America/Toronto').format('HH:mm')} - ${sitEnd.tz('America/Toronto').format('HH:mm')} at ${sitStation}`,
          );
          console.log(`curr: ${curr.dutyDay} next: ${next.dutyDay}`);
          console.log(`day: ${day}`);

          if (
            includesMeal(
              b,
              day,
              dutyStart,
              firstDept,
              sitStart,
              sitEnd,
              lastArr,
              dutyEnd,
              firstDutyDay,
              lastDutyDay,
            )
          ) {
            mealStr += canOrUsLayoverOrSit(b, curr.departureAirport) || '';
          }
          if (
            includesMeal(
              l,
              day,
              dutyStart,
              firstDept,
              sitStart,
              sitEnd,
              lastArr,
              dutyEnd,
              firstDutyDay,
              lastDutyDay,
            )
          ) {
            mealStr += canOrUsLayoverOrSit(l, curr.departureAirport) || '';
          }
          if (
            includesMeal(
              d,
              day,
              dutyStart,
              firstDept,
              sitStart,
              sitEnd,
              lastArr,
              dutyEnd,
              firstDutyDay,
              lastDutyDay,
            )
          ) {
            mealStr += canOrUsLayoverOrSit(d, curr.departureAirport) || '';
          }
          if (
            includesMeal(
              s,
              day,
              dutyStart,
              firstDept,
              sitStart,
              sitEnd,
              lastArr,
              dutyEnd,
              firstDutyDay,
              lastDutyDay,
            )
          ) {
            mealStr += canOrUsLayoverOrSit(s, sitStation) || '';
            mealStr && pushMeal(mealStr);
            console.log(`after sit mealStr: ${mealStr}`);
            mealStr = '';
          }
        }
      } else if (curr.type === 'layover') {
        const dhBefore = prev && prev.isDeadhead;
        const dhAfter = next && next.isDeadhead;
        let lDay = prev.dutyDay;

        const lStart = stringToDate(curr.layoverStart, lDay);
        let lEnd = lStart
          .add(curr.layoverLength.slice(0, -2), 'hour')
          .add(curr.layoverLength.slice(-2), 'minute')
          .add(1, 'hour')
          .add(15, 'minute');

        if (dhBefore) {
          lEnd = lEnd.subtract(15, 'minute');
        }
        if (dhAfter) {
          lEnd = lEnd.subtract(1, 'hour');
        }

        const noDays = getLayoverDays(
          curr.layoverStart,
          curr.layoverEnd,
          curr.layoverLength,
          dhBefore,
          dhAfter,
        );
        console.log(`!noDays: ${noDays}`);

        console.log(
          `layover: s/${lStart.tz('America/Toronto').format('HH:mm')}, l/${curr.layoverLength} e/${lEnd.tz('America/Toronto').format('HH:mm')}`,
        );
        const station = curr.layoverStation;

        for (let i = 0; i <= noDays; i++) {
          lDay += i;
          if (includesMealLayover(b, lDay, lStart, lEnd)) {
            mealStr += canOrUsLayoverOrSit(b, station) || '';
          }
          if (includesMealLayover(l, lDay, lStart, lEnd)) {
            mealStr += canOrUsLayoverOrSit(l, station) || '';
          }
          if (includesMealLayover(d, lDay, lStart, lEnd)) {
            mealStr += canOrUsLayoverOrSit(d, station) || '';
          }
          if (includesMealLayover(s, lDay, lStart, lEnd)) {
            mealStr += canOrUsLayoverOrSit(s, station) || '';
            mealStr && pushMeal(mealStr);
            console.log(`after layover mealStr: ${mealStr}`);
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

  await getMealsAndLocations(seq, tafb);

  if (meals) {
    console.log(`{meals}: ${JSON.stringify(meals, station)}`);
    return { meals: meals, station: station };
  } else {
    return { meals: [], station: null };
  }
}
