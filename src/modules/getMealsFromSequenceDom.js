import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import stringToTime from './stringToTime';
import includesMeal from './includesMeal';
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
      // add logic for full days BLDS or CMET
      return 2;
    }
  };

  const getMealsAndLocations = (seq, tafb) => {
    if (!seq) return;

    let mealStr = '';

    const dutyStart = dayjs(`2000-01-01`)
      .set('hour', `${seq[0].dutyStart.slice(0, -2)}`)
      .set('minute', `${seq[0].dutyStart.slice(-2)}`);

    // console.log(`!startDate: ${startDate.format('YYYY-MM-DD HH:mm')}`);

    const dutyEnd = dutyStart
      .add(tafb.slice(0, -2), 'hours')
      .add(tafb.slice(-2), 'minutes');

    // console.log(`!end: ${end.format('YYYY-MM-DD HH:mm')}`);

    // const endDate = dayjs(`2000-01-01`)
    //   .set('hour', `${seq[seq.length - 1].dutyEnd.slice(0, -2)}`)
    //   .set('minute', `${seq[seq.length - 1].dutyEnd.slice(-2)}`)
    //   .add(seq[seq.length - 1].dutyDay - 1, 'day');

    // console.log(`!endDate: ${endDate.format('YYYY-MM-DD HH:mm')}`);

    // detect CDD pairings
    // if (
    //   seq.length === 2 &&
    //   stringToTime(seq[0].departureTime).isAfter(stringToTime('18:00')) &&
    //   stringToTime(seq[1].arrivalTime).isBefore(stringToTime('06:00'))
    //   // &&
    //   // Number(seq[1].dutyTime) > 600
    // ) {
    //   console.log('CDD');
    //   return { index: 0, meals: 'D', station: seq[0].arrivalAirport };
    // }

    seq.forEach((curr, i, arr) => {
      if (seq[i].type === 'flight') {
        console.log(`Duty Day: ${seq[i].dutyDay}`);
      }

      let day = seq[i].dutyDay || 0;
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
      const firstDept = arr[0].departureTime;
      const lastArr = arr[arr.length - 1].arrivalTime;
      // const lastSpansMidnight = stringToTime(lastArr).isBetween(
      //   stringToTime('00:00'),
      //   stringToTime('05:59'),
      //   'minute',
      //   '[]',
      // );

      const includesMSPP =
        arr[i].mealsOnboard &&
        (arr[i].mealsOnboard.includes('MS') ||
          arr[i].mealsOnboard.includes('PP'));

      //--- FLIGHT
      if (curr.type === 'flight') {
        for (let j = 0; j <= flDays; j++) {
          // let dutyStart = dutyStart;
          // let dutyEnd = dutyEnd;
          // if (j === 0 && flDays === 0) {
          start = curr.departureTime;
          end = curr.arrivalTime;
          // } else if (j === 0 && j !== flDays) {
          //   start = curr.departureTime;
          //   end = '23:59';
          //   // dutyEnd = undefined;
          // } else if (j !== 0 && j === flDays) {
          //   // else if (!lastSpansMidnight && j !== 0 && j === flDays) {
          //   // dutyStart = undefined;
          //   start = '00:00';
          //   end = curr.arrivalTime;
          //   day += 1;
          // }

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
            )
          ) {
            mealStr += canOrUsFlight(start, l, startLoc, endLoc) || '';
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
            )
          ) {
            mealStr += canOrUsFlight(start, d, startLoc, endLoc) || '';
          }
          if (
            !includesMSPP &&
            includesMeal(
              s,
              day,
              dutyStart,
              firstDept,
              start,
              end,
              lastArr,
              dutyEnd,
            )
          ) {
            mealStr += canOrUsFlight(start, s, startLoc, endLoc) || '';
            mealStr && pushMeal(mealStr);
            mealStr = '';
          }
          // }
        }

        if (next && next.type === 'flight') {
          //checks time between flights (airport sit)

          const sitStart = curr.arrivalTime;
          const sitEnd = next.departureTime;
          const sitStation = curr.arrivalAirport;
          console.log(`sit ${sitStart} - ${sitEnd} at ${sitStation}`);

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
            )
          ) {
            mealStr += canOrUsLayoverOrSit(s, sitStation) || '';
            mealStr && pushMeal(mealStr);
            console.log(`after sit mealStr: ${mealStr}`);
            mealStr = '';
          }
        }
      } else if (curr.type === 'layover') {
        // let dutyStart = dutyStart;
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
        console.log(
          `layover start: ${curr.layoverStart} -> end: ${curr.layoverEnd} | layoverDays: ${days}`,
        );

        for (let j = 0; j <= days; j++) {
          console.log(`j: ${j}`);
          // set start and end
          if (j === 0 && days === 0) {
            start = curr.layoverStart;
            end = curr.layoverEnd;
            console.log(`same day layover: start: ${start} - end: ${end}`);
          } else if (j === 0 && j !== days) {
            start = curr.layoverStart;
            end = '23:59';
            console.log(`first day of layover: start: ${start} - end: ${end}`);
          } else if (j !== 0 && j === days) {
            // dutyStart = undefined;
            start = '00:00';
            end = curr.layoverEnd;
            day += 1;
            console.log(`last day of layover:start: ${start} - end: ${end}`);
          }
          // add mealsChars if meal included on layover

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
            )
          ) {
            mealStr += canOrUsLayoverOrSit(b, station) || '';
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
            )
          ) {
            mealStr += canOrUsLayoverOrSit(l, station) || '';
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
            )
          ) {
            mealStr += canOrUsLayoverOrSit(d, station) || '';
          }
          if (
            includesMeal(
              s,
              day,
              dutyStart,
              firstDept,
              start,
              end,
              lastArr,
              dutyEnd,
            )
          ) {
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
