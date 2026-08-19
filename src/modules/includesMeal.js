import stringToDate from './stringToDate.js';
// import dayjs from 'dayjs';
// import isBetween from 'dayjs/plugin/isBetween.js';
import { b, l, d, s } from '../data/mealConstants';

// dayjs.extend(isBetween);

const includesMeal = (
  meal,
  day,
  dutyStart,
  firstDept,
  start,
  end,
  lastArr,
  dutyEnd,
) => {
  if (!meal || !start || !end) return;

  // if (meal !== s) {
  // if (dutyStart && dutyEnd) {
  // one-day pairing
  console.log(
    `checking ${meal.canChar} || day: ${day} || dutyStart: x${dutyStart.tz('America/Toronto').format('HH:mm')} start: ${start} test: ${meal.test} end: ${end} dutyEnd: x${dutyEnd.tz('America/Toronto').format('HH:mm')}`,
  );
  console.log(
    `dutyStart.isBefore: ${dutyStart.isBefore(stringToDate(meal.deptTest, 0))}`,
  );
  console.log(
    `dutyEnd.isAfter: ${dutyEnd.isAfter(stringToDate(meal.arrTest, 0))}`,
  );
  console.log(
    `start: x${stringToDate(start, 0).tz('America/Toronto').format('HH:mm')} | test: x${stringToDate(meal.test, 0).tz('America/Toronto').format('HH:mm')} | end :x${stringToDate(end, 0).tz('America/Toronto').format('HH:mm')} | test.isBetween:${stringToDate(
      meal.test,
      0,
    ).isBetween(stringToDate(start, 0), stringToDate(end, 0), 'minute', '[]')}`,
  );
  if (
    dutyStart.isBefore(stringToDate(meal.deptTest, 0)) &&
    dutyEnd.isAfter(stringToDate(meal.arrTest, 0)) &&
    stringToDate(meal.test, 0).isBetween(
      stringToDate(start, 0),
      stringToDate(end, 0),
      'minute',
      '[]',
    )
  ) {
    return true;
  }
  // } else if (dutyStart && !dutyEnd) {
  //   // first day of multi-day pairing
  //   console.log(
  //     `checking ${meal.canChar} | dutyStart: ${dutyStart} start: ${start} deptTest: ${meal.deptTest} | start: ${start} test: ${meal.test} end: ${end}`,
  //   );
  //   if (
  //     dutyStart.isBefore(stringToTime(meal.deptTest)) &&
  //     stringToTime(firstDept).isBefore(stringToTime(meal.deptTest)) &&
  //     stringToTime(meal.test).isBetween(
  //       stringToTime(start),
  //       stringToTime(end),
  //       'minute',
  //       '[]',
  //     )
  //   ) {
  //     console.log(`includes ${meal.canChar}`);
  //     return true;
  //   }
  // } else if (!dutyStart && dutyEnd) {
  //   console.log(
  //     `checking ${meal.canChar} | test: ${meal.arrTest} end: ${end} dutyEnd: ${dutyEnd} | start: ${start} test: ${meal.test} end: ${end}`,
  //   );
  //   // last day of multi-day pairing
  //   if (
  //     stringToTime(lastArr).isAfter(stringToTime(meal.arrTest)) &&
  //     stringToTime(dutyEnd).isAfter(stringToTime(meal.arrTest)) &&
  //     stringToTime(meal.test).isBetween(
  //       stringToTime(start),
  //       stringToTime(end),
  //       'minute',
  //       '[]',
  //     )
  //   ) {
  //     console.log(`includes ${meal.canChar}`);
  //     return true;
  //   }
  // } else {
  //   // neither first nor last day of multi-day pairing
  //   console.log(
  //     `checking ${meal.canChar} / start: ${start} test: ${meal.arrTest} end: ${end}`,
  //   );
  //   if (
  //     stringToTime(meal.test).isBetween(
  //       stringToTime(start),
  //       stringToTime(end),
  //       'minute',
  //       '[]',
  //     )
  //   ) {
  //     console.log(`includes ${meal.canChar}`);
  //     return true;
  //   }
  // }
  // } else if (meal === s) {
  //   if (dutyStart && dutyEnd) {
  //     // one-day pairing
  //     console.log(
  //       `checking ${meal.canChar} | dutyStart: ${dutyStart} start: ${start} test: ${meal.test} end: ${end} dutyEnd: ${dutyEnd}`,
  //     );
  //     if (
  //       dutyStart).isBefore(stringToTime(meal.deptTest)) &&
  //       stringToTime(dutyEnd).isBetween(
  //         stringToTime(meal.arrTest),
  //         stringToTime('03:00'),
  //         'minute',
  //         '[]',
  //       ) &&
  //       stringToTime(meal.test).isBetween(
  //         stringToTime(start),
  //         stringToTime(end),
  //         'minute',
  //         '[]',
  //       )
  //     ) {
  //       // console.log(`includes ${meal.canChar}`);
  //       return true;
  //     }
  //   } else if (dutyStart && !dutyEnd) {
  //     console.log(
  //       `checking ${meal.canChar} | dutyStart: ${dutyStart} start: ${start} deptTest: ${meal.deptTest} | start: ${start} test: ${meal.test} end: ${end}`,
  //     );
  //     if (
  //       dutyStart).isBefore(stringToTime(meal.deptTest)) &&
  //       stringToTime(start).isBefore(stringToTime(meal.deptTest)) &&
  //       stringToTime(meal.deptTest).isBetween(
  //         stringToTime(start),
  //         stringToTime(end),
  //         'minute',
  //         '[]',
  //       )
  //     ) {
  //       console.log(`includes ${meal.canChar}`);
  //       return true;
  //     }
  //   } else if (!dutyStart && dutyEnd) {
  //     // last day of multi-day pairing
  //     console.log(
  //       `checking ${meal.canChar} | test: ${meal.arrTest} end: ${end} dutyEnd: | ${dutyEnd} start: ${start} test: ${meal.test} end: ${end}`,
  //     );
  //     if (
  //       // stringToTime(lastArr).isBetween(
  //       //   stringToTime(meal.arrTest),
  //       //   stringToTime('03:00'),
  //       //   'minute',
  //       //   '[]',
  //       // ) &&
  //       stringToTime(lastArr).isAfter(stringToTime(meal.arrTest)) &&
  //       stringToTime(dutyEnd).isAfter(stringToTime(meal.arrTest)) &&
  //       stringToTime(dutyEnd).isBetween(
  //         stringToTime(meal.arrTest),
  //         stringToTime('03:00'),
  //         'minute',
  //         '[]',
  //       ) &&
  //       stringToTime(meal.arrTest).isBetween(
  //         stringToTime(start),
  //         stringToTime(end),
  //         'minute',
  //         '[]',
  //       )
  //     ) {
  //       console.log(`includes ${meal.canChar}`);
  //       return true;
  //     }
  //   } else {
  //     // neither first nor last day of multi-day pairing
  //     console.log(
  //       `checking ${meal.canChar} | start: ${start} test: ${meal.test} end: ${end}`,
  //     );
  //     if (
  //       stringToTime(meal.test).isBetween(
  //         stringToTime(start),
  //         stringToTime(end),
  //         'minute',
  //         '[]',
  //       )
  //     ) {
  //       console.log(`includes ${meal.canChar}`);
  //       return true;
  //     }
  //   }
  // }
};

export default includesMeal;
