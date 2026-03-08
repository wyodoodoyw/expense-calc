import all_airports from '../data/all_airports';
import other_airlines from '../data/other_airlines';
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';
import international_airport_codes from '../data/international_airport_codes';
import parseAsFlight from '../modules/parseAsFlight';
import parseAsLayover from '../modules/parseAsLayover';
import addPairingToDB from '../modules/addPairingToDB';
import aircraft from '../data/aircraft';

const parse = (pairing, i) => {
  let errorPairingNumber = null;

  // try {
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
    errorPairingNumber = array[0].match(/(C|M|T|V)[0-9]{4}/)[0];
  } else {
    throw new Error(`Error parsing pairing number: ${errorPairingNumber}`);
  }

  // Dates on which pairing operates
  const startDate = array[2];
  if (startDate) {
    newPairing.pairingOperatesStart = startDate;
  } else {
    throw new Error('Error parsing date on which pairing operates');
  }
  const endDate = array[4];
  if (endDate) {
    newPairing.pairingOperatesEnd = endDate;
  } else {
    throw new Error('Error parsing date on which pairing operates');
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

      if (array[2].includes('DPG')) {
        newPairing.pairingDPG = array[3];
        newPairing.totalDuty = array[4];
        newPairing.cicoAmount = array[5]
          .replace('(INC-$', '')
          .replace('CICO)', '');
        newPairing.totalAllowance = array[array.length - 1];
      } else if (array[2].includes('THG')) {
        newPairing.pairingTHG = array[3];
        newPairing.totalDuty = array[4];
        newPairing.cicoAmount = array[5]
          .replace('(INC-$', '')
          .replace('CICO)', '');
        newPairing.totalAllowance = array[array.length - 1];
      } else {
        newPairing.pairingDPG = undefined;
        newPairing.totalDuty = array[2];
        newPairing.cicoAmount = array[3]
          .replace('(INC-$', '')
          .replace('CICO)', '');
        newPairing.totalAllowance = array[array.length - 1];
      }
    }

    //TAFB Line
    if (array[0].includes('TAFB')) {
      tafbIdx = i;
      newPairing.tafb = array[1];
      newPairing.totalCredit = array[3];
    }
  }

  // calendar of dates
  pairing[tafbIdx + 1] = pairing.slice(tafbIdx + 1).flat();
  pairing.splice(tafbIdx + 2);
  newPairing.calendar = pairing[tafbIdx + 1];

  // DPG Line, if exists
  for (let i = 3; i < pairing.length; i++) {
    const array = pairing[i];

    if (
      pairing[i + 1] &&
      pairing[i + 1].length >= 1 &&
      pairing[i + 1][0].includes('BLOCK') &&
      array[0].includes('DPG')
    ) {
      blockIdx -= 1;
    }
  }

  if (i === 1690) {
    // console.log(JSON.stringify(pairing));
    console.log(pairing);
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
      const flight = parseAsFlight(
        array,
        pairingSequence.length,
        i === blockIdx - 1, // last flight in sequence, true or false
      );
      pairingSequence.push(flight);
    } else {
      const layover = parseAsLayover(pairingSequence.length, array);
      pairingSequence.push(layover);
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
    }
  } catch (err) {
    console.warn(
      'Error parsing additional layover information. ',
      newPairing.pairingIdentifier,
      i,
      err,
    );
  }

  newPairing.sequence = pairingSequence;
  addPairingToDB(newPairing);
  return;
};

export default parse;
