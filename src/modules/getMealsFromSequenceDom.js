import calcPairingDays from './calcPairingDays';
import stringToTime from './stringToTime';

export default function getMealsFromSequenceDom(seq = [], pairingLength) {
  // Always return an object so callers can destructure safely
  if (!Array.isArray(seq) || seq.length === 0 || !pairingLength) {
    return { meals: [], station: '' };
  }
  const meals = [];
  const station = 'YYZ';

  const getDeptMeals = (dutyStart, deptTime) => {
    if (!dutyStart || !deptTime) return '';

    if (
      stringToTime(dutyStart).isBefore(stringToTime('08:00')) &&
      stringToTime(deptTime).isBefore(stringToTime('08:00'))
    ) {
      return 'BLDS';
    } else if (
      stringToTime(dutyStart).isBefore(stringToTime('12:31')) &&
      stringToTime(deptTime).isBefore(stringToTime('12:31'))
    ) {
      return 'LDS';
    } else if (
      stringToTime(dutyStart).isBefore(stringToTime('18:01')) &&
      stringToTime(deptTime).isBefore(stringToTime('18:01'))
    ) {
      return 'DS';
    } else if (
      (stringToTime(dutyStart).isBefore(stringToTime('23:01')) &&
        stringToTime(deptTime).isBefore(stringToTime('23:01'))) ||
      stringToTime(deptTime).isAfter(stringToTime('00:00'))
    ) {
      return 'S';
    }
  };

  const getArrMeals = (arrTime, dutyEnd) => {
    if (!arrTime || !dutyEnd) return '';

    if (
      stringToTime(arrTime).isBefore(stringToTime('03:00')) &&
      stringToTime(arrTime).isAfter(stringToTime('01:00')) &&
      stringToTime(dutyEnd).isAfter(stringToTime('01:00'))
    ) {
      return 'BLDS';
    } else if (
      stringToTime(arrTime).isAfter(stringToTime('18:30')) &&
      stringToTime(dutyEnd).isAfter(stringToTime('18:30'))
    ) {
      return 'BLD';
    } else if (
      stringToTime(arrTime).isAfter(stringToTime('13:30')) &&
      stringToTime(dutyEnd).isAfter(stringToTime('13:30'))
    ) {
      return 'BL';
    } else if (
      stringToTime(arrTime).isAfter(stringToTime('09:30')) &&
      stringToTime(dutyEnd).isAfter(stringToTime('09:30'))
    ) {
      return 'B';
    }
  };

  const getShortDutyMeals = (dutyStart, deptTime, arrTime, dutyEnd) => {
    if (!dutyStart || !deptTime || !arrTime || !dutyEnd) return '';

    let mealStr = '';

    if (
      stringToTime(dutyStart).isBefore(stringToTime('08:00')) &&
      stringToTime(deptTime).isBefore(stringToTime('08:00')) &&
      stringToTime(arrTime).isAfter(stringToTime('09:30')) &&
      stringToTime(dutyEnd).isAfter(stringToTime('09:30'))
    ) {
      mealStr += 'B';
    }
    if (
      stringToTime(dutyStart).isBefore(stringToTime('12:30')) &&
      stringToTime(deptTime).isBefore(stringToTime('12:30')) &&
      stringToTime(arrTime).isAfter(stringToTime('13:30')) &&
      stringToTime(dutyEnd).isAfter(stringToTime('13:30'))
    ) {
      mealStr += 'L';
    }
    if (
      stringToTime(dutyStart).isBefore(stringToTime('18:00')) &&
      stringToTime(deptTime).isBefore(stringToTime('18:00')) &&
      stringToTime(arrTime).isAfter(stringToTime('18:30')) &&
      stringToTime(dutyEnd).isAfter(stringToTime('18:30'))
    ) {
      mealStr += 'D';
    }
    if (
      stringToTime(dutyStart).isBefore(stringToTime('23:00')) &&
      stringToTime(deptTime).isBefore(stringToTime('23:00')) &&
      stringToTime(arrTime).isAfter(stringToTime('01:00')) &&
      stringToTime(dutyEnd).isAfter(stringToTime('01:00')) &&
      stringToTime(arrTime).isBefore(stringToTime('06:00'))
    ) {
      mealStr += 'S';
    }
    return mealStr;
  };

  // push meals to meal array
  const pushMeal = (mealStr, st = 'int') => {
    if (!mealStr) return;
    meals.push({
      index: meals.length,
      meals: mealStr,
      station: st,
    });
  };

  // const pushMeals = (arr) => {
  //   if (Array.isArray(arr)) {
  //     arr.forEach((m) => {
  //       if (typeof m === 'string') pushMeal(m, 'YYZ');
  //       else if (m && m.meals) pushMeal(m.meals, m.station || 'YYZ');
  //     });
  //   }
  // };

  //--- STEP 1: Handle short duty days

  if (pairingLength && Number(pairingLength) <= 1700) {
    const dutyStart = seq[0].dutyStart;
    const deptTime = seq[0].departureTime;
    const arrTime = seq[seq.length - 1].arrivalTime;
    const dutyEnd = seq[seq.length - 1].dutyEnd;

    const shortDutyMeals = getShortDutyMeals(
      dutyStart,
      deptTime,
      arrTime,
      dutyEnd,
    );

    shortDutyMeals && pushMeal(shortDutyMeals, 'YYZ');

    if (shortDutyMeals) {
      return { meals, station };
    } else {
      return;
    }
  }

  //--- STEP 2: Calculate meals for the first day
  const firstDay = getDeptMeals(seq[0].dutyStart, seq[0].departureTime);
  // console.log(`firstDay: ${firstDay}`);
  firstDay && pushMeal(firstDay, 'YYZ');

  //--- STEP 3: Calculate meals for the final day
  if (Number(pairingLength) > 2400) {
    const start = seq[0].dutyStart;
    const end = seq[seq.length - 1].dutyEnd;
    const length = pairingLength;
    // console.log(`pairingLength: ${start}-${end} ${length}`);
    // console.log(`days: ${calcPairingDays(start, end, length)}`);
    for (let i = 1; i <= calcPairingDays(start, end, length); i++) {
      pushMeal('BLDS', 'YYZ');
    }
  }

  //--- STEP 4: Calculate meals for full days
  const i = seq.length - 1;
  const lastDay = getArrMeals(seq[i].arrivalTime, seq[i].dutyEnd);
  // console.log(`lastDay: ${lastDay}`);
  lastDay && pushMeal(lastDay, 'YYZ');

  //--- STEP 4: Update meals for any flight arriving or leaving USA

  // console.log(`meals: ${JSON.stringify(meals)}`);
  if (meals) {
    // console.log(`{meals, station}: ${JSON.stringify(meals, station)}`);
    return { meals, station };
  } else {
    return;
  }
}
