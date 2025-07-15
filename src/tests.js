import dayjs from 'dayjs';

const timeFormat = 'HH:mm';
const expenses = {
  breakfast: 17.95,
  lunch: 20.33,
  dinner: 40.27,
  snack: 10.52,
};

function getPairing(pairingNo) {
  const request = window.indexedDB.open('PairingsDB', 1);

  request.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction(['pairings'], 'readonly');
    const pairingsStore = tx.objectStore('pairings');
    const pairingNumberIndex = pairingsStore.index('pairingNumber');
    const request = pairingNumberIndex.get(pairingNo);

    request.onsuccess = () => {
      if (request.result) {
        return request.result;
      }
    };

    request.onerror = (event) => {
      console.log(`DB Error: ${event.target}`);
    };
  };
}

const test = (pairingNo) => {
  const p = getPairing(pairingNo);
  console.log(`p: ${JSON.stringify(p)}`);
  const firstFlight = p.sequence[0];
  const lastFlight = p.sequence[p.sequence.length - 1];

  const firstDuty = dayjs(firstFlight.departureTime, timeFormat).subtract(
    1,
    'hour'
  );
  const lastDuty = dayjs(lastFlight.arrivalTime, timeFormat).add(15, 'minute');

  const calculatePairingMeals = () => {
    let expenses = '';
    expenses += calculateFirstDayMeals();

    for (let i = 0; i < calculateFullDays(); i++) {
      expenses += 'BLDS';
    }
    expenses += calculateLastDayMeals();
    return expenses;
  };

  const calculateFirstDayMeals = () => {
    const time = dayjs(firstFlight.departureTime, timeFormat);
    const duty = {
      start: dayjs(firstDuty.dutyDayStart),
      end: dayjs('01:01', timeFormat).add(1, 'day'),
    };
    if (
      time.isBefore(dayjs('08:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('09:30', timeFormat), 'minutes')
    ) {
      // console.log(`!Begin: B`);
      return 'BLDS';
    } else if (
      time.isBefore(dayjs('12:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('13:30', timeFormat), 'minutes')
    ) {
      // console.log(`!Begin: L`);
      return 'LDS';
    } else if (
      time.isBefore(dayjs('18:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('18:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('19:30', timeFormat), 'minutes')
    ) {
      // console.log(`!Begin: D`);
      return 'DS';
    } else if (
      time.isBefore(dayjs('23:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('01:00', timeFormat).add(1, 'day'), 'minutes')
    ) {
      // console.log(`!Begin: S`);
      return 'S';
    }
  };

  const calculateLastDayMeals = () => {
    const time = dayjs(lastFlight.arrivalTime, timeFormat);
    const duty = {
      start: dayjs('00:00', timeFormat),
      end: dayjs(lastDuty.dutyDayEnd, timeFormat),
    };

    if (
      time.isAfter(dayjs('18:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('17:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('18:30', timeFormat), 'minutes')
    ) {
      // console.log(`!End: D`);
      return 'BLD';
    } else if (
      time.isAfter(dayjs('13:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('12:30', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('13:30', timeFormat), 'minutes')
    ) {
      // console.log(`!End: L`);
      return 'BL';
    } else if (
      time.isAfter(dayjs('09:30', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('08:00', timeFormat), 'minutes') &&
      duty.end.isAfter(dayjs('09:30', timeFormat), 'minutes')
    ) {
      // console.log(`!End: B`);
      return 'B';
    } else if (
      time.isAfter(dayjs('01:00', timeFormat), 'minute') &&
      duty.start.isBefore(dayjs('23:00', timeFormat), 'minutes') &&
      duty.end.isAfter((dayjs('01:00', timeFormat).add(1, 'day'), 'minutes'))
    ) {
      // console.log(`!End: S`);
      return 'BLDS';
    }
  };

  const calculateFullDays = () => {
    let hours =
      Number(p.tafb.slice(0, -2)) +
      Number(firstFlight.departureTime[(0, 2)]) -
      Number(lastFlight.arrivalTime[(0, 2)]) -
      23;
    let minutes =
      Number(p.tafb.slice(-2)) +
      Number(lastFlight.arrivalTime[-2]) -
      Number(firstFlight.arrivalTime[-2]) +
      15;
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
    }
    return hours / 24;
  };

  // EXPENSES //

  // const getExpenseAmounts = (station) => {
  //   const request = window.indexedDB.open('ExpensesDB', 1);
  //   request.onsuccess = (event) => {
  //     const db = event.target.result;
  //     const tx = db.transaction(['expenses'], 'readonly');
  //     const expensesStore = tx.objectStore('expenses');
  //     const airportCodesIndex = expensesStore.index('airport_codes');
  //     const request = airportCodesIndex.get(station);
  //     request.onsuccess = () => {
  //       const ca = request.result.expenses;
  //       return {
  //         breakfast: ca.breakfast,
  //         lunch: ca.lunch,
  //         dinner: ca.dinner,
  //         snack: ca.snack,
  //       };
  //     };
  //   };
  //   request.onerror = (event) => {
  //     console.log(`!DB Error: ${event.target.error}`);
  //   };
  //   tx.oncomplete = () => {
  //     db.close();
  //   };
  // };

  const numLayovers = () => {
    let layoverCount = 0;
    for (let i = 0; i < p.sequence.length; i++) {
      if (p.sequence[i].hotelInfo) {
        layoverCount++;
      }
    }
    return layoverCount;
  };

  const calculateDisplayBreakfastTotal = (meals) => {
    return meals.breakfast * expenses.breakfast;
  };

  const calculateDisplayLunchTotal = (meals) => {
    return meals.lunch * expenses.lunch;
  };

  const calculateDisplayDinnerTotal = (meals) => {
    return meals.dinner * expenses.dinner;
  };

  const calculateDisplaySnackTotal = (meals) => {
    return meals.snack * expenses.snack;
  };

  const calculateDisplayCicoTotal = () => {
    return numLayovers * 5.05;
  };

  const calculateDisplayTotal = (meals) => {
    const total = (
      calculateDisplayBreakfastTotal(meals) +
      calculateDisplayLunchTotal(meals) +
      calculateDisplayDinnerTotal(meals) +
      calculateDisplaySnackTotal(meals) +
      calculateDisplayCicoTotal(meals)
    ).toFixed(2);

    return total;
  };

  try {
    const testPairing = getPairing('T8879').then((pairing) => {
      const testPairingMeals = calculatePairingMeals(pairing);
      console.log(
        `Pairing ${testPairing.pairingNumber} meals: ${testPairingMeals}`
      );
    });
  } catch {
    console.log(`Error in pairing `);
  }
};

export default test;
