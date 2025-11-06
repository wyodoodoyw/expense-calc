/* eslint-disable no-unused-vars */
// Returns: { meals: [{ index, meals: 'BLD', station: 'YYZ'|'int' }], station: 'XXX' }

import canadian_airport_codes from '../data/canadian_airport_codes';
import stringToTime from './stringToTime';

import calcMealsDomArrival from './calcMealsDomArrival';
import calcMealsDomAfterInt from './calcMealsDomAfterInt';
import calcMealsDomBeforeInt from './calcMealsDomBeforeInt';

import calcMealsIntLayover from './calcMealsIntLayover';
import calcMealsIntDept from './calcMealsIntDept';
import calcMealsIntArrival from './calcMealsIntArrival';

export default function getMealsFromSequence(seq = []) {
  const meals = [];
  let station = '';

  const pushMeal = (mealStr, st = 'int') => {
    if (!mealStr) return;
    meals.push({
      index: meals.length,
      meals: mealStr,
      station: st,
    });
  };

  const calcDomLayoverPrior = (
    dutyStart,
    domDeptTime,
    intDeptTime,
    layoverStart,
    layoverLength
  ) => {
    const deptMeals = calcMealsDomBeforeInt(
      dutyStart,
      domDeptTime,
      intDeptTime
    );
    if (deptMeals) pushMeal(deptMeals, 'YYZ');

    // replicate existing logic that checks for an extra dept meal when layover spans
    if (
      typeof layoverLength === 'string' &&
      layoverLength.slice(0, 2) - 24 + layoverStart.slice(0, 2) >= 1
    ) {
      const deptMeals2 = calcMealsIntDept(intDeptTime);
      if (deptMeals2) pushMeal(deptMeals2, 'YYZ');
    }
  };

  const calcDomLayoverAfter = (
    intArrivalTime,
    domArrivalTime,
    dutyEnd,
    layoverEnd,
    layoverLength
  ) => {
    const arrivalMeals = calcMealsIntArrival(intArrivalTime);
    if (arrivalMeals) pushMeal(arrivalMeals, 'YYZ');

    if (
      Number(layoverLength.slice(0, 2)) - 24 + Number(layoverEnd.slice(0, 2)) >=
      24
    ) {
      const arrivalMealsExtra = calcMealsDomArrival(domArrivalTime, dutyEnd);
      if (arrivalMealsExtra) pushMeal(arrivalMealsExtra, 'YYZ');
    }

    const arrivalMeals2 = calcMealsDomArrival(domArrivalTime, dutyEnd);
    if (arrivalMeals2) pushMeal(arrivalMeals2, 'YYZ');
  };

  if (!Array.isArray(seq) || seq.length === 0) {
    return { meals, station };
  }

  // Short-circuit: no international layover -> no meals
  if (seq.length === 2) return { meals, station };

  for (let i = 0; i < seq.length; i++) {
    const cur = seq[i];

    // detect and record international layover station
    if (cur && cur.hotelInfo && cur.isInt) {
      station = cur.layoverStation || station;

      // const collector = (entry) => {
      //   console.log(`collector entry: ${entry}`);
      //   // If helper calls with string
      //   if (typeof entry === 'string') {
      //     pushMeal(entry, 'int');
      //   } else if (entry && entry.meals) {
      //     pushMeal(entry.meals, entry.station || 'int');
      //   } else if (Array.isArray(entry)) {
      //     entry.forEach((e) => {
      //       if (typeof e === 'string') pushMeal(e, 'int');
      //       else if (e && e.meals) pushMeal(e.meals, e.station || 'int');
      //     });
      //   }
      // };

      const collector = [];

      const maybe = calcMealsIntLayover(
        cur.layoverStart,
        cur.layoverEnd,
        cur.layoverLength,
        collector
      );
      // console.log(`meals int layover: ${maybe}`);
      // if helper returned a string or array, add it
      if (typeof maybe === 'string') pushMeal(maybe, 'int');
      if (Array.isArray(maybe)) {
        maybe.forEach((m) => {
          if (typeof m === 'string') pushMeal(m, 'int');
          else if (m && m.meals) pushMeal(m.meals, m.station || 'int');
        });
      }
    } else if (
      i === 0 &&
      canadian_airport_codes.includes(cur.arrivalAirport) &&
      canadian_airport_codes.includes(cur.departureAirport) &&
      !seq[i + 1].hotelInfo
    ) {
      // Domestic Flight at beginning of pairing
      const newMeals = calcMealsDomBeforeInt(
        cur.dutyStart,
        seq[i + 1].departureTime
      );
      if (newMeals) pushMeal(newMeals, 'YYZ');
    } else if (
      i === 0 &&
      canadian_airport_codes.includes(cur.arrivalAirport) &&
      canadian_airport_codes.includes(cur.departureAirport) &&
      seq[i + 1].hotelInfo
    ) {
      // Domestic Flight at beginning of pairing, prior to Domestic Layover
      const newMeals = calcMealsDomBeforeInt(
        cur.dutyStart,
        stringToTime(cur.arrivalTime).add(15, 'minutes').format('HHmm')
      );
      if (newMeals) pushMeal(newMeals, 'YYZ');
    } else if (
      i === 1 &&
      canadian_airport_codes.includes(seq[i].layoverStation)
    ) {
      // Domestic Layover prior to International Flight/Layover
      calcDomLayoverPrior(
        seq[0].dutyStart,
        seq[0].departureTime,
        seq[2].departureTime,
        seq[1].layoverStart,
        seq[1].layoverLength
      );
    } else if (
      i === seq.length - 2 &&
      canadian_airport_codes.includes(seq[i].layoverStation)
    ) {
      // Domestic Layover after International Flight/Layover
      calcDomLayoverAfter(
        seq[seq.length - 3].arrivalTime,
        seq[seq.length - 1].arrivalTime,
        seq[seq.length - 1].dutyEnd,
        seq[seq.length - 2].layoverEnd,
        seq[seq.length - 2].layoverLength
      );
    } else if (
      i === seq.length - 1 &&
      canadian_airport_codes.includes(cur.arrivalAirport) &&
      canadian_airport_codes.includes(cur.departureAirport) &&
      !seq[i - 1].hotelInfo
    ) {
      // Domestic flight at end of pairing
      const newMeals = calcMealsDomAfterInt(
        seq[i - 1].arrivalTime,
        cur.dutyEnd
      );
      if (newMeals) pushMeal(newMeals, 'YYZ');
    } else if (
      i === seq.length - 1 &&
      canadian_airport_codes.includes(cur.arrivalAirport) &&
      canadian_airport_codes.includes(cur.departureAirport) &&
      seq[i - 1].hotelInfo
    ) {
      // Domestic flight following domestic layover at end of pairing
      const newMeals = calcMealsDomAfterInt(
        stringToTime(cur.arrivalTime).subtract(1, 'hour').format('HHmm'),
        cur.dutyEnd
      );
      if (newMeals) pushMeal(newMeals, 'YYZ');
    }
  }

  return { meals, station };
}
