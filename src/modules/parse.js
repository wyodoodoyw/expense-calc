import all_airports from '../data/all_airports';
import american_airport_codes from '../data/american_airport_codes';
import international_airport_codes from '../data/international_airport_codes';
import parseAsFlight from '../modules/parseAsFlight';
import parseAsLayover from '../modules/parseAsLayover';
import addPairingToDB from '../modules/addPairingToDB';
import aircraft from '../data/aircraft';
import dayjs from 'dayjs';
import Duration from 'dayjs/plugin/duration';
import stringToTime from '../modules/stringToTime';

dayjs.extend(Duration);

const parse = (pairing, i) => {
  let errorPairingNumber = null;

  if (!pairing) {
    throw new Error(`Pairing is empty: ${i}.`);
  }

  let newPairing = {};
  let array = pairing[0];

  // Pairing Identifier, Pairing Number, IFS Base
  if (array[0].match(/(C|M|T|V)[0-9]{4}/)) {
    newPairing.pairingIdentifier = array[0].match(/(C|M|T|V)[0-9]{4}/)[0];
    newPairing.ifsBase = newPairing.pairingIdentifier[0];
    newPairing.pairingNumber = Number(newPairing.pairingIdentifier.slice(1));
    errorPairingNumber = newPairing.pairingIdentifier;
  } else {
    throw new Error(`Error parsing pairing number: ${errorPairingNumber}`);
  }

  // Dates on which pairing operates
  if (array[2].length === 5 && array[2].match(/[0-3][0-9][A-Z]{3}/)) {
    newPairing.pairingOperatesStart = array[2];
  } else {
    throw new Error(`Error parsing start date: ${errorPairingNumber}`);
  }
  if (array[4].length === 5 && array[4].match(/[0-3][0-9][A-Z]{3}/)) {
    newPairing.pairingOperatesEnd = array[4];
  } else {
    throw new Error(`Error parsing end date: ${errorPairingNumber}`);
  }

  array = pairing[1];

  // Number of Pursers/Flight Attendants/Galley Attendants/Language Positions
  let languages = [];
  for (let i = 0; i < array.length; i++) {
    const position = array[i];
    if (position.match(/P\s[0-9]{2}/g)) {
      newPairing.pairingPurser = position
        .match(/P [0-9]{2}/g)[0]
        .replace('P ', '');
    }
    if (position.match(/FA[0-9]{2}/g)) {
      newPairing.pairingFA = position.match(/FA[0-9]{2}/g)[0].replace('FA', '');
    }
    if (position.match(/GJ[0-9]{2}/g)) {
      newPairing.pairingGJ = position.match(/GJ[0-9]{2}/g)[0].replace('GJ', '');
    }
    if (position.match(/GP[0-9]{2}/g)) {
      newPairing.pairingGJ = position.match(/GP[0-9]{2}/g)[0].replace('GP', '');
    }
    if (position.match(/GY[0-9]{2}/g)) {
      newPairing.pairingGY = position.match(/GY[0-9]{2}/g)[0].replace('GY', '');
    }
    if (
      !position.match(/P\s[0-9]{2}/g) &&
      !position.match(/FA[0-9]{2}/g) &&
      !position.match(/GJ[0-9]{2}/g) &&
      !position.match(/GY[0-9]{2}/g)
    ) {
      languages.push(position);
    }
  }

  if (languages.length > 0) {
    newPairing.pairingLanguages = languages;
  }

  // BLOCK/H-VOL Line
  let blockIdx = null;
  let tafbIdx = null;
  for (let i = 4; i < pairing.length; i++) {
    const array = pairing[i];

    if (array[0].includes('BLOCK')) {
      blockIdx = i;
      newPairing.blockCredit = array[1];

      // ['BLOCK/H-VOL', '907', '1124', 'TOTAL', 'ALLOWANCE', '-$', '50.79']
      // ['BLOCK/H-VOL', '1011', 'DPG -', '310', '1547', '(INC-$10.10', 'CICO)', 'TOTAL', 'ALLOWANCE', '-$', '188.24']

      if (array[2].includes('DPG')) {
        newPairing.pairingDPG = array[3];
        newPairing.pairingTHG = undefined;
        newPairing.totalDuty = array[4];
        newPairing.cicoAmount = array[5]
          .replace('(INC-$', '')
          .replace('CICO)', '');
        newPairing.totalAllowance = array[array.length - 1];
      } else if (array[2].includes('THG')) {
        newPairing.pairingDPG = undefined;
        newPairing.pairingTHG = array[3];
        newPairing.totalDuty = array[4];
        newPairing.cicoAmount = array[5]
          .replace('(INC-$', '')
          .replace('CICO)', '');
        newPairing.totalAllowance = array[array.length - 1];
      } else {
        newPairing.pairingDPG = undefined;
        newPairing.pairingTHG = undefined;
        newPairing.totalDuty = array[2];
        if (array[3] && array[3].includes('CICO')) {
          newPairing.cicoAmount = array[3]
            .replace('(INC-$', '')
            .replace('CICO)', '');
        } else {
          newPairing.cicoAmount = undefined;
        }
        if (array[array.length - 1].match(/[0-9]{1,3}.[0-9]{2}/g)) {
          newPairing.totalAllowance = array[array.length - 1];
        } else {
          console.warn(`Error parsing totalAllowance: ${errorPairingNumber}`);
        }
      }
    }
    if (
      newPairing.totalAllowance &&
      !newPairing.totalAllowance.match(/[0-9]{1,3}.[0-9]{2}/)
    ) {
      console.log(
        `Error parsing totalAllowance. pairing: ${newPairing.pairingIdentifier}, allowance: ${newPairing.totalAllowance}`,
      );
    }

    // Find TAFB Index
    if (array[0].includes('TAFB')) {
      tafbIdx = i;
    }
  }

  //TAFB Line
  // ['TAFB/PTEB', '1124', 'TOTAL -', '907']
  // ['TAFB/PTEB', '4410', 'TOTAL -', '1321']
  if (pairing[tafbIdx][1].match(/[0-9]{3,5}/g)) {
    newPairing.tafb = pairing[tafbIdx][1];
  } else {
    console.warn(`Error parsing TAFB: ${errorPairingNumber}`);
  }

  if (pairing[tafbIdx][3].match(/[0-9]{3,5}/g)) {
    newPairing.totalCredit = pairing[tafbIdx][3];
  } else {
    console.warn(`Error parsing totalCredit: ${errorPairingNumber}`);
  }

  // calendar of dates
  pairing[tafbIdx + 1] = pairing.slice(tafbIdx + 1).flat();
  pairing.splice(tafbIdx + 2);
  newPairing.calendar = pairing[tafbIdx + 1];

  // DPG Line, if exists
  // ['315 -DPG']
  for (let i = 3; i < pairing.length; i++) {
    const array = pairing[i];
    const next = pairing[i + 1];

    if (
      next &&
      next.length >= 1 &&
      next[0].includes('BLOCK') &&
      array[0].includes('DPG')
    ) {
      blockIdx--;
    }
  }

  // combine multiple days of week into one string
  for (let i = 2; i < blockIdx; i++) {
    let array = pairing[i];

    if (
      array[2] &&
      aircraft.includes(array[2].substring(0, 3)) &&
      !all_airports.includes(array[3].substring(0, 3))
    ) {
      array[0] = `${array[0]}${array[1]}`;
      array.splice(1, 1);
      pairing[i] = array;
    }
    // ["1","7","QKKDHD 8155","YVR 1345","YYJ 1419","17","949","1506"]
    // ["1","7","QKKDHD 8110","YWG 1150","YOW 1517","114","717","1258","L"]
    else if (
      array[2] &&
      array[2].length > 10 &&
      !aircraft.includes(array[1].substring(0, 3)) &&
      aircraft.includes(array[2].substring(0, 3)) &&
      all_airports.includes(array[3].substring(0, 3)) &&
      all_airports.includes(array[4].substring(0, 3))
    ) {
      // console.log(array);
      array[0] = `${array[0]}${array[1]}`;
      array[1] = array[2].slice(0, -5);
      array[2] = array[2].slice(-4);
      // console.log(array);
      pairing[i] = array;
    } else if (array[3] && aircraft.includes(array[3].substring(0, 3))) {
      array[0] = `${array[0]}${array[1]}${array[2]}`;
      array.splice(1, 2);
      pairing[i] = array;
    }
  }

  // split instances of aircraft/DHD airline and flight number in same element
  for (let i = 2; i < blockIdx; i++) {
    let array = pairing[i];
    if (array[1].substring(0, 3).match(/[A-Z0-9]{3}/g) && array[1].length > 6) {
      const oldElement = array[1];
      const arrayEnd = array.splice(2);
      array[1] = oldElement.substring(0, 6);
      array[2] = oldElement.substring(6).trim();
      array.splice(3);
      array = [...array, ...arrayEnd];
      pairing[i] = array;
    }
  }

  // parse sequence of flights and layovers
  const pairingSequence = [];
  for (let i = 2; i < blockIdx; i++) {
    const array = pairing[i];
    if (
      array.length > 5 &&
      array[3].match(/[A-Z]{3}/g) &&
      all_airports.includes(array[3].substring(0, 3)) &&
      array[4].match(/[A-Z]{3}/g) &&
      all_airports.includes(array[4].substring(0, 3))
    ) {
      //-------------------------
      const flight = parseAsFlight(
        pairingSequence || undefined,
        array,
        pairingSequence.length,
        i === blockIdx - 1, // last flight ==> true or false
      );
      pairingSequence.push(flight);
    } else {
      const layover = parseAsLayover(pairingSequence.length, array);
      pairingSequence.push(layover);
    }

    // Detect airport codes not included here
    if (
      array.length > 5 &&
      array[3].match(/[A-Z]{3}/g) &&
      array[4].match(/[A-Z]{3}/g)
    ) {
      if (
        !all_airports.includes(array[3].substring(0, 3)) ||
        !all_airports.includes(array[4].substring(0, 3))
      ) {
        console.warn(`Error parsing airport code: ${errorPairingNumber}`);
      }
    }
  }

  // Add info for Layovers based on [i-1] and [i+1]
  try {
    for (let i = 1; i < pairingSequence.length; i++) {
      if (pairingSequence[i].type === 'layover') {
        // Layover
        pairingSequence[i].layoverStart = pairingSequence[i - 1].arrivalTime;
        pairingSequence[i].layoverEnd = pairingSequence[i + 1].departureTime;
        pairingSequence[i].layoverLength = pairingSequence[i - 1].layoverLength;
        pairingSequence[i].layoverStation =
          pairingSequence[i - 1].arrivalAirport;
      }
      // if (
      //   international_airport_codes.includes(pairingSequence[i].layoverStation)
      // ) {
      //   newPairing.isInt = true;
      //   newPairing.isUsa = false;
      //   pairingSequence[i].isInt = true;
      //   pairingSequence.isUsa = false;
      // } else if (
      //   american_airport_codes.includes(pairingSequence[i].layoverStation)
      // ) {
      //   newPairing.isInt = false;
      //   newPairing.isUsa = true;
      //   pairingSequence[i].isInt = false;
      //   pairingSequence[i].isUsa = true;
      // } else {
      //   pairing.isInt = false;
      //   pairing.isUsa = false;
      //   pairingSequence[i].isInt = false;
      //   pairingSequence[i].isUsa = false;
      // }
    }
  } catch (err) {
    console.warn(
      'Error parsing additional layover information. ',
      newPairing.pairingIdentifier,
      i,
      err,
    );
  }

  // determine day in pairing
  try {
    let timeElapsed = dayjs.duration({
      hours: pairingSequence[0].dutyStart.slice(0, -2),
      minutes: pairingSequence[0].dutyStart.slice(-2),
    });
    for (let i = 0; i < pairingSequence.length; i++) {
      if (pairingSequence[i].type === 'flight') {
        pairingSequence[i].dutyDay = Math.floor(timeElapsed.asDays());
        if (pairingSequence[i].dutyTime) {
          timeElapsed = timeElapsed.add(
            dayjs.duration({
              hours: pairingSequence[i].dutyTime.slice(0, -2),
              minutes: pairingSequence[i].dutyTime.slice(-2),
            }),
          );
        }
      } else if (
        pairingSequence[i].type === 'layover' &&
        pairingSequence[i].layoverLength
      ) {
        timeElapsed = timeElapsed.add(
          dayjs.duration({
            hours: pairingSequence[i].layoverLength.slice(0, -2),
            minutes: pairingSequence[i].layoverLength.slice(-2),
          }),
        );
      }
    }
  } catch (err) {
    console.warn(`Error determining dutyDay: ${err},`);
  }

  // add dutyEnd to last dutyDay flights
  const lastDutyDay = pairingSequence[pairingSequence.length - 1].dutyDay; // what about spans midnight?
  for (let i = 0; i < pairingSequence.length; i++) {
    if (pairingSequence[i].type === 'flight' && !pairingSequence[i].dutyDay) {
      console.log(
        `Error: ${newPairing.pairingIdentifier} - flight segment does not have dutyDay.`,
      );
    }
    if (pairingSequence[i].dutyDay === pairingSequence[0].dutyDay) {
      pairingSequence[i].dutyStart = pairingSequence[0].dutyStart;
    }

    if (pairingSequence[i].dutyDay === lastDutyDay) {
      if (
        stringToTime(
          pairingSequence[pairingSequence.length - 1].arrivalTime, // change to isSameDay?
        ).isBetween(
          stringToTime('00:00'),
          stringToTime('07:31'),
          'minutes',
          '[]',
        )
      ) {
        // skip
      } else {
        pairingSequence[i].dutyEnd =
          pairingSequence[pairingSequence.length - 1].dutyEnd;
      }
    }
  }

  newPairing.sequence = pairingSequence;
  addPairingToDB(newPairing);
  return;
};

export default parse;
