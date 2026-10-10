import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import stringToTime from './stringToTime';
// import stringToDate from './stringToDate';
import includesMeal from './includesMeal';
import includesMealLayover from './includesMealLayover';
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';
import sun_domestic_airport_codes from '../data/sun_domestic_airport_codes';
import mealsK from '../data/mealConstants';
import timezones from '../data/timezones';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

export default async function getMealsFromSequenceDom(
  pIdentifier,
  sequence = [],
  tafb = '0000',
) {
  if (!Array.isArray(sequence) || sequence.length === 0) {
    return { meals: [], station: null };
  }

  const base = '2000-01-01';
  const dTZ = 'America/Toronto';
  const dF = 'DD HH:mm';

  console.log(`${pIdentifier}`);

  //--- Loop through sequence and convert flight time strings to dayjs() objects

  let elapsedTime = dayjs.tz(
    `${base} ${sequence[0].departureTime.slice(0, -2)}:${sequence[0].departureTime.slice(-2)}`,
    timezones[sequence[0].departureAirport],
  );

  let prevArrival;
  const seq = sequence.map((item, i, arr) => {
    // First in sequence
    if (i === 0 && !arr[i + 1]) {
      const deptTime = elapsedTime;
      let arrTime = deptTime
        .add(item.flightTime.slice(0, -2), 'hours')
        .add(item.flightTime.slice(-2), 'minutes');
      if (item.isDeadhead) {
        arrTime = arrTime
          .add(item.flightTime.slice(0, -2), 'hours')
          .add(item.flightTime.slice(-2), 'minutes');
      }
      elapsedTime = arrTime;
      arrTime = arrTime
        .set('hour', item.arrivalTime.slice(0, -2))
        .set('minute', item.arrivalTime.slice(-2));
      prevArrival = arrTime;
      return {
        ...item,
        departureTime: deptTime,
        arrivalTime: arrTime,
      };
      // flight and sit
    } else if (
      item.type !== 'layover' &&
      arr[i + 1] &&
      arr[i + 1].type === 'flight'
    ) {
      const deptTime = elapsedTime;
      let arrTime = deptTime
        .add(item.flightTime.slice(0, -2), 'hours')
        .add(item.flightTime.slice(-2), 'minutes');
      if (item.isDeadhead) {
        arrTime = deptTime
          .add(item.flightTime.slice(0, -2), 'hours')
          .add(item.flightTime.slice(-2), 'minutes');
      }
      arrTime = arrTime
        .set('hour', item.arrivalTime.slice(0, -2))
        .set('minute', item.arrivalTime.slice(-2));
      const start = arrTime; //dayjs with date
      const sitStart = dayjs(
        `${base} ${arr[i].arrivalTime.slice(0, -2)}:${arr[i].arrivalTime.slice(-2)}`,
      ); // generic date for calculating diff
      const sitEnd = dayjs(
        `${base} ${arr[i + 1].departureTime.slice(0, -2)}:${arr[i + 1].departureTime.slice(-2)}`,
      );
      const end = start.add(sitEnd.diff(sitStart, 'minutes', true), 'minutes');
      elapsedTime = end;
      prevArrival = arrTime;
      return {
        ...item,
        departureTime: deptTime,
        arrivalTime: arrTime,
      };
      // flight
    } else if (item.type === 'flight') {
      const deptTime = elapsedTime;
      let arrTime = deptTime
        .add(item.flightTime.slice(0, -2), 'hours')
        .add(item.flightTime.slice(-2), 'minutes');
      if (item.isDeadhead) {
        arrTime = arrTime
          .add(item.flightTime.slice(0, -2), 'hours')
          .add(item.flightTime.slice(-2), 'minutes');
      }
      elapsedTime = arrTime;
      prevArrival = arrTime;
      return {
        ...item,
        departureTime: deptTime,
        arrivalTime: arrTime
          .set('hour', item.arrivalTime.slice(0, -2))
          .set('minute', item.arrivalTime.slice(-2)),
      };
      //layover
    } else if (item.type === 'layover') {
      const layoverStart = dayjs(
        `${prevArrival.tz(dTZ).format('YYYY-MM-DD')} ${item.layoverStart.slice(0, -2)}:${item.layoverStart.slice(-2)}`,
      );
      const layoverEnd = layoverStart
        .add(item.layoverLength.slice(0, -2), 'hours')
        .add(item.layoverLength.slice(-2), 'minutes')
        .add(1, 'hour')
        .add(15, 'minutes'); //-------------- DH LOGIC
      elapsedTime = layoverEnd;
      return {
        ...item,
        layoverStart: layoverStart,
        layoverEnd: layoverEnd,
      };
    }
  });

  // seq.forEach((s) => {
  //   s.type === 'flight' &&
  //     console.log(
  //       `!F ${JSON.stringify(s.departureTime.tz(dTZ).format(dF))}-${JSON.stringify(s.arrivalTime.tz(dTZ).format(dF))}`,
  //     );
  //   s.type === 'layover' &&
  //     console.log(
  //       `\n!L ${JSON.stringify(s.layoverStart.tz(dTZ).format(dF))}-${JSON.stringify(s.layoverEnd.tz(dTZ).format(dF))}`,
  //     );
  // });

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
    // if (!deptTime || !meal || !startLoc || !endLoc) return;
    const time = deptTime;
    const test = stringToTime(meal.test);

    if (meal.canChar === 'B') {
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
      if (time.isBefore(test, 'minutes')) {
        if (canadian_airport_codes.includes(endLoc)) {
          return meal.canChar;
        } else if (american_airport_codes.includes(endLoc)) {
          return meal.usChar;
        } else if (sun_domestic_airport_codes.includes(endLoc)) {
          station = endLoc;
          return meal.intChar;
        }
        // If flight departas at [test] or later, the [meal] is paid at the rate of the country of departure.
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
    } else if (
      sun_domestic_airport_codes.includes(stn) ||
      stn === 'LHR' ||
      stn === 'KEF'
    ) {
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

  const getLayoverDays = (s, e, len, dhBefore, dhAfter, loc) => {
    if (!s || !e || !len) return;

    // const startHH = Number(s.slice(0, -2));
    // const startMM = Number(s.slice(-2));
    // const endHH = Number(e.slice(0, -2));
    // const endMM = Number(e.slice(-2));
    const startHH = s.tz(timezones[loc], true).format('HH');
    const startMM = s.tz(timezones[loc], true).format('mm');
    const endHH = e.tz(timezones[loc], true).format('HH');
    const endMM = e.tz(timezones[loc], true).format('mm');
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

    const dutyStart = dayjs(
      `${base} ${sequence[0].departureTime.slice(0, -2)}:${sequence[0].departureTime.slice(-2)}`,
    )
      .tz(timezones[sequence[0].departureAirport], true)
      .subtract(1, 'hour');
    const dutyEnd = dutyStart
      .add(tafb.slice(0, -2), 'hours')
      .add(tafb.slice(-2), 'minutes');

    console.log(`dutyStart: ${dutyStart.tz(dTZ).format('YYYY-MM-DD HH:mm')}`); //-----------------------FIX WITH PARSEASFLIGHT LOGIC FOR A/C
    console.log(`dutyStart: ${dutyEnd.tz(dTZ).format('YYYY-MM-DD HH:mm')}`);
    // CONTINUOUS DUTY DAY CDD PAIRINGS
    if (seq.length === 2) {
      const start = seq[0].departureTime;
      const end = start
        .add(tafb.slice(0, -2), 'hour')
        .add(tafb.slice(-2), 'minute')
        .subtract(75, 'minute');

      const checkStart = dayjs(`${base} 22:00:00`);
      const checkEnd = dayjs(`${base} 08:00:00`);
      const latestStart = start.isAfter(checkStart) ? start : checkStart;
      const earliestEnd = end.isBefore(checkEnd) ? end : checkEnd;
      const overlap = earliestEnd.diff(latestStart, 'hours', false);

      // console.log(
      //   `CDD || latestStart: ${latestStart.format('HH:mm')} start: ${start.format('HH:mm')} end: ${end.format('HH:mm')} | earliestEnd: ${earliestEnd.format('HH:mm')} | overlap: ${overlap}`,
      // );

      if (!start.isSame(end, 'day') && Number(tafb) > 600 && overlap >= 4) {
        // console.log(`! ${pIdentifier} night flight`);
        pushMeal('DS');
        return { meals: meals, station: station };
      }
    }

    // OTHER PAIRINGS
    let firstDutyDept = 0;
    seq.forEach((curr, i, arr) => {
      const prev = arr[i - 1] || null;
      const next = arr[i + 1] || null;
      const last = i === arr.length - 1;
      let startLoc = curr.departureAirport;
      let endLoc = curr.arrivalAirport;
      const firstDept = arr[0].departureTime;
      const lastArr = seq.at(-1).arrivalTime;

      //--- FLIGHT
      if (curr.type === 'flight') {
        const start = curr.departureTime;
        const end = curr.arrivalTime;

        console.log(
          `\nflight: ${start.tz(timezones[curr.departureAirport], true).format('HH:mm')} end: ${end.tz(dTZ, true).format('HH:mm')}`,
        );

        mealsK.forEach((meal) => {
          if (
            includesMeal(
              meal,
              dutyStart,
              firstDept,
              start,
              end,
              lastArr,
              dutyEnd,
            )
          ) {
            if (meal.canChar === 'B') {
              startLoc = seq[firstDutyDept].departureAirport;
              endLoc = startLoc;
            }
            mealStr += canOrUsFlight(start, meal, startLoc, endLoc) || '';
            console.log(`mealStr: ${mealStr}`);
            const snackCheck =
              mealStr.at(-1) === 'S' ||
              mealStr.at(-1) === 'T' ||
              mealStr.at(-1) === 'U';
            if (mealStr && snackCheck) {
              pushMeal(mealStr);
              mealStr = '';
            }
          }
        });

        //--- AIRPORT SIT
        if (next && next.type === 'flight') {
          const sitStart = curr.arrivalTime;
          const sitEnd = next.departureTime;
          let sitStation = curr.arrivalAirport;
          console.log(
            `\nsit ${sitStart.tz(dTZ).format('HH:mm')} - ${sitEnd.tz(dTZ).format('HH:mm')} at ${sitStation}`,
          );

          mealsK.forEach((meal) => {
            if (
              includesMeal(
                meal,
                dutyStart,
                firstDept,
                sitStart,
                sitEnd,
                lastArr,
                dutyEnd,
              )
            ) {
              mealStr +=
                canOrUsLayoverOrSit(
                  meal,
                  meal.canChar === 'B'
                    ? seq[firstDutyDept].departureAirport
                    : sitStation,
                ) || '';
              const snackCheck =
                mealStr.at(-1) === 'S' ||
                mealStr.at(-1) === 'T' ||
                mealStr.at(-1) === 'U';
              if (mealStr && snackCheck) {
                pushMeal(mealStr);
                mealStr = '';
              }
            }
          });
        }
      }

      //--- LAYOVER
      if (curr.type === 'layover') {
        const dhBefore = prev && prev.isDeadhead;
        const dhAfter = next && next.isDeadhead;
        const lStart = curr.layoverStart;
        let lEnd = curr.layoverEnd;
        firstDutyDept = next.index;
        console.log(`setting firstDutyDept: ${firstDutyDept}`);

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
          curr.layoverStation,
        );

        console.log(
          `\nlayover: ${lStart.tz(dTZ).format(dF)}-${lEnd.tz(dTZ).format(dF)}, length: ${curr.layoverLength}`,
        );
        const station = curr.layoverStation;

        for (let i = 0; i <= noDays; i++) {
          mealsK.forEach((meal) => {
            if (includesMealLayover(meal, i, lStart, lEnd)) {
              mealStr += canOrUsLayoverOrSit(meal, station) || '';
              const snackCheck =
                mealStr.at(-1) === 'S' ||
                mealStr.at(-1) === 'T' ||
                mealStr.at(-1) === 'U';
              if (mealStr && snackCheck) {
                pushMeal(mealStr);
                mealStr = '';
              }
            }
          });
        }
      }
      if (last) {
        mealStr && pushMeal(mealStr);
      }
      console.log(`i: ${i} - mealStr: ${mealStr}`);
    });
  };

  getMealsAndLocations(seq, tafb);

  if (meals) {
    console.log(`{meals}: ${JSON.stringify(meals, station)}`);
    return { meals: meals, station: station };
  } else {
    return { meals: [], station: null };
  }
}
