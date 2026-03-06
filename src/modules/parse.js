import all_airports from '../data/all_airports';
import other_airlines from '../data/other_airlines';
import canadian_airport_codes from '../data/canadian_airport_codes';
import american_airport_codes from '../data/american_airport_codes';
import international_airport_codes from '../data/international_airport_codes';
import parseAsFlight from '../modules/parseAsFlight';
import parseAsLayover from '../modules/parseAsLayover';
import addPairingToDB from '../modules/addPairingToDB';

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

  let blockIdx = undefined;
  let tafbIdx = undefined;
  for (let i = 2; i < pairing.length; i++) {
    const array = pairing[i];

    // BLOCK/H-VOL Line
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
      tafbIdx = 1;
      newPairing.tafb = array[1];
      newPairing.totalCredit = array[3];
    }

    // Calendar of dates the pairing operates
    let calendar = [];
    if (i > tafbIdx) {
      calendar.push(array[0]);
    }
    if (i === pairing.length - 1 && calendar.length > 0) {
      newPairing.calendar = calendar;
    }
  }

  const pairingSequence = [];
  let sequenceIdx = 0;

  for (let i = 2; i < blockIdx; i++) {
    const array = pairing[i];

    // if (i === 2) {
    //   const flight = parseAsFlight(array, pairingSequence.length, false);
    //   pairingSequence.push(flight);
    // } else if (i === blockIdx - 1) {
    //   const flight = parseAsFlight(array, pairingSequence.length, true);
    //   pairingSequence.push(flight);
    // } else
    if (array.length === 1 && array[0].includes('DPG')) {
      newPairing.pairingDPG = array[0].replace('-DPG', '').trim();
    } else if (
      other_airlines.includes(array[1].substring(0, 3)) &&
      array[1].includes('DHD')
    ) {
      parseAsFlight(array, pairingSequence.length, i === blockIdx - 1);
    } else if (
      all_airports.includes(array[3].slice(0, 3)) &&
      all_airports.includes(array[4].slice(0, 3))
    ) {
      const flight = parseAsFlight(array, i, i === blockIdx - 1); //i === blockIdx - 1 indicates last flight
      pairingSequence.push(flight);
    } else {
      const layover = parseAsLayover(sequenceIdx, array);
      pairingSequence.push(layover);
    }
    sequenceIdx++;
  }

  // Add info for Layovers based on [i-1] and [i+1]
  for (let i = 1; i < pairingSequence.length; i++) {
    if (pairingSequence[i].isLayover) {
      // Layover
      // pairingSequence[i].layoverStart = pairingSequence[i - 1].arrivalTime;
      // pairingSequence[i].layoverEnd = pairingSequence[i + 1].departureTime;
      // pairingSequence[i].layoverLength = pairingSequence[i - 1].layoverLength;
      // pairingSequence[i].layoverStation = pairingSequence[i - 1].arrivalAirport;
      // if (american_airport_codes.includes(pairingSequence[i].layoverStation)) {
      //   pairing.isUS = true;
      // } else if (
      //   international_airport_codes.includes(pairingSequence[i].layoverStation)
      // ) {
      //   pairing.isInt = true;
      // } else if (
      //   canadian_airport_codes.includes(pairingSequence[i].layoverStation)
      // ) {
      //   pairing.isDom = true;
      // } else {
      //   throw new Error(
      //     `Error parsing additional layover info: ${errorPairingNumber}`,
      //   );
      // }
    }
  }
  newPairing.sequence = pairingSequence;
  addPairingToDB(newPairing);
  return;
};

export default parse;
