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
    if (position.includes('P')) {
      newPairing.pairingPurser = position.replace('P', '');
    } else if (position.includes('FA')) {
      newPairing.pairingFA = position.replace('FA', '');
    } else if (position.includes('BL')) {
      newPairing.pairingBL = position.replace('BL', '');
    } else if (position.includes('GJ')) {
      newPairing.pairingGP = position.replace('GJ', '');
    } else if (position.includes('GY')) {
      newPairing.pairingGY = position.replace('GY', '');
    } else {
      languages.push(position);
    }
  }

  if (languages.length > 0) {
    newPairing.pairingLanguages = languages;
  }

  // BLOCK/H-VOL Line
  let blockIdx = null;
  let tafbIdx = null;
  for (let i = 3; i < pairing.length; i++) {
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
        newPairing.pairindDPG = undefined;
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

  // combine multiple days of week into one string
  for (let i = 2; i < blockIdx; i++) {
    const array = pairing[i];

    if (aircraft.includes(array[1])) {
      // no action needed
    } else if (aircraft.includes(array[2])) {
      array[0] = `${array[0]}${array[1]}`;
      array.splice(1, 1);
      pairing[i] = array;
    } else if (aircraft.includes(array[3])) {
      array[0] = `${array[0]}${array[1]}${array[2]}`;
      array.splice(1, 2);
      pairing[i] = array;
    }
  }

  // parse sequence of flights and layovers
  const pairingSequence = [];
  // for (let i = 2; i < blockIdx; i++) {
  //   const array = pairing[i];
  //   if (
  //     (array.length > 3 &&
  //       array[2].match(/[A-Z]{3}/g) &&
  //       array[3].match(/[A-Z]{3}/g)) ||
  //     (array.length > 4 &&
  //       array[3].match(/[A-Z]{3}/g) &&
  //       array[4].match(/[A-Z]{3}/g)) ||
  //     (array.length > 5 &&
  //       array[4].match(/[A-Z]{3}/g) &&
  //       array[5].match(/[A-Z]{3}/g))
  //   ) {
  //     const flight = parseAsFlight(
  //       array,
  //       pairingSequence.length,
  //       i === blockIdx - 1, // last flight in sequence, true or false
  //     );
  //     pairingSequence.push(flight);
  //   } else {
  //     const layover = parseAsLayover(pairingSequence.length, array);
  //     pairingSequence.push(layover);
  //   }
  // }

  // Add info for Layovers based on [i-1] and [i+1]
  // for (let i = 1; i < pairingSequence.length; i++) {
  //   if (pairingSequence[i].isLayover) {
  //     // Layover
  //     pairingSequence[i].layoverStart = pairingSequence[i - 1].arrivalTime;
  //     pairingSequence[i].layoverEnd = pairingSequence[i + 1].departureTime;
  //     pairingSequence[i].layoverLength = pairingSequence[i - 1].layoverLength;
  //     pairingSequence[i].layoverStation = pairingSequence[i - 1].arrivalAirport;
  //     if (american_airport_codes.includes(pairingSequence[i].layoverStation)) {
  //       pairing.isUS = true;
  //     } else if (
  //       international_airport_codes.includes(pairingSequence[i].layoverStation)
  //     ) {
  //       pairing.isInt = true;
  //     } else if (
  //       canadian_airport_codes.includes(pairingSequence[i].layoverStation)
  //     ) {
  //       pairing.isDom = true;
  //     } else {
  //       throw new Error(
  //         `Error parsing additional layover info: ${errorPairingNumber}`,
  //       );
  //     }
  //   }
  // }
  newPairing.sequence = pairingSequence;
  addPairingToDB(newPairing);
  return;
};

export default parse;
