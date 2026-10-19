import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
// import stringToTime from './stringToTime';
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

  const base = '2025-08-01';
  const dTZ = 'America/Toronto';
  const dF = 'DD HH:mm ZZ';

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
      console.log(`!!! logged`);
      const deptTime = elapsedTime;
      let arrTime = deptTime
        .add(item.flightTime.slice(0, -2), 'hours')
        .add(item.flightTime.slice(-2), 'minutes')
        .tz(timezones[item.arrivalAirport], false);
      if (item.isDeadhead) {
        arrTime = arrTime
          .add(item.flightTime.slice(0, -2), 'hours')
          .add(item.flightTime.slice(-2), 'minutes');
      }
      console.log(`!!${deptTime} - ${arrTime}`);
      elapsedTime = arrTime;
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
        .add(item.flightTime.slice(-2), 'minutes')
        .tz(timezones[item.arrivalAirport], false);
      if (item.isDeadhead) {
        arrTime = deptTime
          .add(item.flightTime.slice(0, -2), 'hours')
          .add(item.flightTime.slice(-2), 'minutes');
      }
      // determine number of minutes on airport sit
      let sitEnd = arrTime;
      while (
        Number(sitEnd.format('HHmm')) !== Number(arr[i + 1].departureTime)
      ) {
        sitEnd = sitEnd.add(1, 'minute');
      }
      elapsedTime = sitEnd;
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
        .add(item.flightTime.slice(-2), 'minutes')
        .tz(timezones[item.arrivalAirport], false);
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
        arrivalTime: arrTime,
      };
      //layover
    } else if (item.type === 'layover') {
      const layoverStart = prevArrival;
      let layoverEnd = layoverStart
        .add(item.layoverLength.slice(0, -2), 'hours')
        .add(item.layoverLength.slice(-2), 'minutes');
      // .add(1, 'hour')
      // .add(15, 'minutes');
      if (!arr[i - 1].isDeadhead) {
        // not deadhead before layover
        layoverEnd = layoverEnd.add(15, 'minutes');
      }
      if (!arr[i + 1].isDeadhead) {
        // not deadhead after layover
        layoverEnd = layoverEnd.add(1, 'hours');
      }
      elapsedTime = layoverEnd;
      console.log(`!elapsed: ${elapsedTime.tz(dTZ, true).format(dF)}`);
      return {
        ...item,
        layoverStart: layoverStart,
        layoverEnd: layoverEnd,
      };
    }
  });

  // seq.forEach((s) => {
  //   if (s.type === 'flight') {
  //     console.log(
  //       `flight ${s.departureTime.format(dF)} - ${s.arrivalTime.format(dF)}`,
  //     );
  //   } else {
  //     console.log(
  //       `layover ${s.layoverStart.format(dF)} - ${s.layoverEnd.format(dF)}`,
  //     );
  //   }
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

    const test = deptTime
      .set('hour', meal.test.slice(0, -2))
      .set('minute', meal.test.slice(-2));

    // console.log(
    //   `!! ${deptTime.format(dF)} | ${test.format(dF)} | ${startLoc} | ${endLoc} || ${deptTime.isBefore(test, 'minutes')} || ${deptTime.isSameOrAfter(test, 'minutes')}`,
    // );

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
      if (deptTime.isBefore(test, 'minutes')) {
        if (canadian_airport_codes.includes(endLoc)) {
          return meal.canChar;
        } else if (american_airport_codes.includes(endLoc)) {
          return meal.usChar;
        } else if (sun_domestic_airport_codes.includes(endLoc)) {
          station = endLoc;
          // console.log(`!!! ${meal.intChar}`);
          return meal.intChar;
        }
        // If flight departas at [test] or later, the [meal] is paid at the rate of the country of departure.
      } else if (deptTime.isSameOrAfter(test, 'minutes')) {
        if (canadian_airport_codes.includes(startLoc)) {
          return meal.canChar;
        } else if (american_airport_codes.includes(startLoc)) {
          return meal.usChar;
        } else if (sun_domestic_airport_codes.includes(startLoc)) {
          station = startLoc;
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
      .subtract(sequence[0].dutyOffset.slice(0, -2), 'hour')
      .subtract(sequence[0].dutyOffset.slice(-2), 'minute');
    const dutyEnd = dutyStart
      .add(tafb.slice(0, -2), 'hours')
      .add(tafb.slice(-2), 'minutes');

    // CONTINUOUS DUTY DAY CDD PAIRINGS
    if (seq.length === 2) {
      const start = seq[0].departureTime;
      const end = seq.at(-1).arrivalTime;

      const checkStart = start.set('hour', 22).set('minute', 0);
      const checkEnd = end.set('hour', 8).set('minute', 0);
      const latestStart = start.isAfter(checkStart) ? start : checkStart;
      const earliestEnd = end.isBefore(checkEnd) ? end : checkEnd;
      const overlap = earliestEnd.diff(latestStart, 'hours', false);

      if (!start.isSame(end, 'day') && Number(tafb) > 600 && overlap >= 4) {
        console.log(
          `CDD || latestStart: ${latestStart.format('HH:mm')} start: ${start.format('HH:mm')} end: ${end.format('HH:mm')} | earliestEnd: ${earliestEnd.format('HH:mm')} | overlap: ${overlap} | sameDay? ${start.isSame(end, 'day')}`,
        );
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
        const start = curr.departureTime.tz(timezones['YYZ'], true);
        const end = curr.arrivalTime.tz(timezones['YYZ'], true);

        console.log(`\nflight: ${start.format(dF)} end: ${end.format(dF)}`);

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
              mealStr += canOrUsFlight(start, meal, startLoc, startLoc) || '';
            } else if (
              meal.canChar === 'S' &&
              curr.mealsOnboard &&
              curr.mealsOnboard.includes('MS')
            ) {
              //
            } else {
              mealStr += canOrUsFlight(start, meal, startLoc, endLoc) || '';
            }
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
          const sitStart = curr.arrivalTime.tz(timezones['YYZ'], true);
          const sitEnd = next.departureTime
            // .subtract(1, 'minute')
            .tz(timezones['YYZ'], true);
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
        const lStart = curr.layoverStart.tz(timezones['YYZ'], true);
        let lEnd = curr.layoverEnd.tz(timezones['YYZ'], true);
        firstDutyDept = next.index;
        console.log(`setting firstDutyDept: ${firstDutyDept}`);

        // if (dhBefore) {
        //   lEnd = lEnd.subtract(15, 'minute');
        // }
        // if (dhAfter) {
        //   lEnd = lEnd.subtract(1, 'hour');
        // }

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
