/* eslint-disable no-unused-vars */

import canadian_airport_codes from '../data/canadian_airport_codes';
import international_airport_codes from '../data/international_airport_codes';
import addDutyDuration from './addDutyDuration';

import calcMealsDomBeforeInt from './calcMealsDomBeforeInt';
import calcMealsDomAfterInt from './calcMealsDomAfterInt';
import calcMealsIntLayover from './calcMealsIntLayover';
import getShortDutyMeals from './getShortDutyMeals';

export default function getMealsFromSequence(seq = []) {
  // Always return an object so callers can destructure safely
  if (!Array.isArray(seq) || seq.length === 0) {
    return { meals: [], station: '' };
  }
  const meals = [];

  let intOutboundIndex = null;
  let intInboundIndex = null;
  let intLayoverIndex = null;

  let intOutboundIndex2 = null;
  let intInboundIndex2 = null;
  let intLayoverIndex2 = null;

  // push meals to meal array
  const pushMeal = (mealStr, st = 'int') => {
    if (!mealStr) return;
    meals.push({
      index: meals.length,
      meals: mealStr,
      station: st,
    });
  };

  const pushMeals = (arr) => {
    if (Array.isArray(arr)) {
      arr.forEach((m) => {
        if (typeof m === 'string') pushMeal(m, 'YYZ');
        else if (m && m.meals) pushMeal(m.meals, m.station || 'YYZ');
      });
    }
  };

  //--- STEP 1: Loop through sequence to identify domestic segment prior to international departure (starting index, ending index),
  //--- domestic segment after international arrival (starting index, ending index), and international layover index.
  for (let i = 0; i < seq.length; i++) {
    const cur = seq[i];
    if (!cur) continue;

    // SPECIAL CASE: GRU-EZE shuttle
    if (cur.departureAirport == 'GRU' && cur.arrivalAirport == 'EZE') {
      const mealsFirstLayover = calcMealsIntLayover(
        seq[i - 2].arrivalTime,
        seq[i].departureTime,
        seq[i - 1].layoverLength
      );
      const mealsSecondLayover = calcMealsIntLayover(
        seq[i + 1].arrivalTime,
        seq[i + 3].departureTime,
        seq[i + 2].layoverLength
      );

      if (Array.isArray(mealsFirstLayover)) {
        mealsFirstLayover.forEach((m) => {
          if (typeof m === 'string') pushMeal(m, 'YYZ');
          else if (m && m.meals) pushMeal(m.meals, m.station || 'YYZ');
        });
      }

      if (Array.isArray(mealsSecondLayover)) {
        mealsSecondLayover.forEach((m) => {
          if (typeof m === 'string') pushMeal(m, 'YYZ');
          else if (m && m.meals) pushMeal(m.meals, m.station || 'YYZ');
        });
      }
      return { meals, station: 'GRU' };
    }

    // Find first international leg, outbound from Canada
    if (
      cur &&
      canadian_airport_codes.includes(cur.departureAirport) &&
      international_airport_codes.includes(cur.arrivalAirport) &&
      !intOutboundIndex
    ) {
      intOutboundIndex = i;
    } else if (
      cur &&
      canadian_airport_codes.includes(cur.departureAirport) &&
      international_airport_codes.includes(cur.arrivalAirport) &&
      intOutboundIndex
    ) {
      // second international outbound leg found
    }
    if (
      cur &&
      international_airport_codes.includes(cur.departureAirport) &&
      canadian_airport_codes.includes(cur.arrivalAirport)
    ) {
      // Find last international leg, inbound to Canada
      intInboundIndex = i;
    }

    // Find international layover index
    if (cur && cur.hotelInfo && cur.isInt) {
      intLayoverIndex = i;
    }
  }
  // console.log(
  //   `getMealsFromSequence IntOutbound: ${intOutboundIndex}, intLayover: ${intLayoverIndex}, intInbound: ${intInboundIndex}`
  // );

  //--- STEP 2: Loop through domestic segment prior to international departure to determine start time, end time, and length,
  //--- then calculate meals for the segment.
  if (intOutboundIndex > 0) {
    let segmentLength = '0';

    for (let j = 0; j < intOutboundIndex; j++) {
      const item = seq[j];
      if (!item) continue;
      if (item.flightTime) {
        segmentLength = addDutyDuration(segmentLength, item.flightTime);
        if (item.isDeadhead) {
          segmentLength = addDutyDuration(segmentLength, item.flightTime);
          // console.log(`segmentLength for DH: ${segmentLength}`);
        }
      }

      if (item.hotelInfo && item.layoverLength) {
        segmentLength = addDutyDuration(segmentLength, item.layoverLength);
      }
    }

    const dutyStart = seq[0] && seq[0].dutyStart;
    const firstDept = seq[0] && seq[0].departureTime;
    const outboundDept =
      seq[intOutboundIndex] && seq[intOutboundIndex].departureTime;

    if (Number(segmentLength.slice(0, -2)) < 17) {
      // console.log(
      //   `short segment length: ${Number(segmentLength.slice(0, -2))} hours`
      // );
      if (dutyStart && outboundDept) {
        const domMealsAfterInt = getShortDutyMeals(dutyStart, outboundDept);
        domMealsAfterInt && pushMeals([domMealsAfterInt]);
        // console.log(`domMealsAfterInt1: ${JSON.stringify(domMealsAfterInt)}`);
      }
    } else {
      if (dutyStart && outboundDept) {
        const domMealsBeforeInt = calcMealsDomBeforeInt(
          dutyStart,
          firstDept,
          outboundDept,
          segmentLength
        );
        domMealsBeforeInt && pushMeals(domMealsBeforeInt);
      }
    }
  }

  //--- STEP 3: Calculate meals for international layover.
  const station = seq[intLayoverIndex].layoverStation;
  const layoverEnd = seq[intLayoverIndex].layoverEnd;

  const layoverMeals = calcMealsIntLayover(
    seq[intLayoverIndex].layoverStart,
    seq[intLayoverIndex].layoverEnd,
    seq[intLayoverIndex].layoverLength
  );

  layoverMeals && pushMeals(layoverMeals);

  //--- STEP 4: Loop through domestic segment following international arrival to determine start time, end time, and length,
  //--- then calculate meals for the segment.

  if (intInboundIndex && intInboundIndex !== seq.length - 1) {
    let segmentLength = '0';

    for (let j = intInboundIndex + 1; j < seq.length; j++) {
      const item = seq[j];
      if (!item) continue;

      if (item.hotelInfo && item.layoverLength) {
        segmentLength = addDutyDuration(segmentLength, item.layoverLength);
      }

      if (item.flightTime && item.isDeadhead) {
        segmentLength = addDutyDuration(segmentLength, item.flightTime);
        segmentLength = addDutyDuration(segmentLength, item.flightTime);
      } else if (item.flightTime && !item.isDeadhead) {
        segmentLength = addDutyDuration(segmentLength, item.dutyTime);
      }
    }

    const arrivalTime =
      seq[intInboundIndex] && seq[intInboundIndex].arrivalTime;
    const finalArrival = seq[seq.length - 1] && seq[seq.length - 1].arrivalTime;
    const finalDutyEnd = seq[seq.length - 1] && seq[seq.length - 1].dutyEnd;
    let domMealsAfterInt;

    if (Number(segmentLength.slice(0, -2)) < 17) {
      // console.log(
      //   `short segment length: ${Number(segmentLength.slice(0, -2))} hours`
      // );
      if (arrivalTime && finalDutyEnd) {
        const domMealsAfterInt = getShortDutyMeals(arrivalTime, finalDutyEnd);
        domMealsAfterInt && pushMeals([domMealsAfterInt]);
        // console.log(`domMealsAfterInt1: ${JSON.stringify(domMealsAfterInt)}`);
      }
    } else {
      // console.log(
      //   `arrivalTime: ${arrivalTime}, finalArrival: ${finalArrival}, finalDuty: ${finalDutyEnd}, segmentLength: ${segmentLength}`
      // );

      if (arrivalTime && finalArrival && finalDutyEnd) {
        domMealsAfterInt = calcMealsDomAfterInt(
          arrivalTime,
          finalArrival,
          finalDutyEnd,
          segmentLength
        );

        // console.log(`domMealsAfterInt: ${JSON.stringify(domMealsAfterInt)}`);

        domMealsAfterInt && pushMeals(domMealsAfterInt);
      }
    }
  }

  if (meals) {
    // console.log(`{meals, station}: ${JSON.stringify(meals, station)}`);
    return { meals, station };
  } else {
    return;
  }
}
