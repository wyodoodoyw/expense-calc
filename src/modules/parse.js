import cutStringAfterInclusive from '../modules/cutStringAfterInclusive';
import cutStringAfterExclusive from '../modules/cutStringAfterExclusive';
import cutStringBeforeExclusive from '../modules/cutStringBeforeExclusive';
import all_airports from '../data/all_airports';
import parseAsFlight from '../modules/parseAsFlight';
import parseAsLayover from '../modules/parseAsLayover';
import addPairingToDB from '../modules/addPairingToDB';
import processPairingForDisplay from './processPairingForDisplay';

const parse = (pairing) => {
  let errorPairingNumber = null;
  try {
    if (!pairing) {
      throw new Error('Pairing is empty');
    }
    // New object
    let newPairing = {};

    // Pairing Number
    if (pairing.match(/(C|M|T|V)[0-9]{4}/)) {
      newPairing.pairingNumber = pairing.match(/(C|M|T|V)[0-9]{4}/)[0];
      errorPairingNumber = pairing.match(/(C|M|T|V)[0-9]{4}/)[0];
    } else {
      throw new Error('Error parsing pairing number');
    }

    // Date on which pairing operates
    if (pairing.match(/[0-9]{2}[A-Z]{3} {1,3}- {1,3}[0-9]{2}[A-Z]{3}/)) {
      newPairing.pairingOperates = pairing
        .match(/[0-9]{2}[A-Z]{3} {1,3}- {1,3}[0-9]{2}[A-Z]{3}/)[0]
        .replace('   -   ', '-');
    } else {
      throw new Error('Error parsing date on which pairing operates');
    }

    // Remove substring that has been parsed above
    pairing = cutStringAfterExclusive(pairing, '*!*');

    // Number of Pursers/Flight Attendants/Galley Attendants/Language Positions
    let crew = cutStringBeforeExclusive(pairing, '*!*');
    if (crew) {
      newPairing.pairingCrew = crew.match(/[A-Z]{1,2} ?[0-9]{2}/g);
      const languages = [];
      if (newPairing.pairingCrew) {
        for (let i = 0; i < newPairing.pairingCrew.length; i++) {
          const positions = newPairing.pairingCrew[i];
          if (positions.includes('P')) {
            newPairing.pairingPurser = positions.replace('P', '');
          } else if (positions.includes('FA')) {
            newPairing.pairingFA = positions.replace('FA', '');
          } else if (positions.includes('BL')) {
            newPairing.pairingBL = positions.replace('BL', '');
          } else if (positions.includes('GJ')) {
            newPairing.pairingGP = positions.replace('GJ', '');
          } else if (positions.includes('GY')) {
            newPairing.pairingGY = positions.replace('GY', '');
          } else {
            languages.push(positions);
          }
        }
      }

      if (languages.length > 0) {
        newPairing.pairingLanguages = languages;
      }
    } else {
      throw new Error('Error parsing crew');
    }

    // Remove substring that has been parsed above
    pairing = cutStringAfterExclusive(pairing, '*!*');

    // Parse calendar and dates the pairing operates on
    if (pairing.includes('Su   Mo')) {
      newPairing.calendar = cutStringAfterInclusive(pairing, 'Su   Mo');
      newPairing.pairingDates = newPairing.calendar.match(/[0-9]{1,2}/g);
    }

    // Parse last line of pairing (TAFB etc.)
    if (pairing.includes('TAFB')) {
      let lastLine = cutStringAfterInclusive(pairing, 'TAFB');
      lastLine = cutStringBeforeExclusive(lastLine, 'Su   Mo'); // TAFB/PTEB   4405   TOTAL -   1525 *!*
      newPairing.tafb = lastLine.match(/[0-9]{3,5}/g)[0];
      newPairing.totalCredit = lastLine.match(/[0-9]{3,4}/g)[1];
    }
    // Remove substring that has been parsed above
    pairing = cutStringBeforeExclusive(pairing, 'TAFB');

    // parse second last line of pairing (Block etc.)
    if (pairing.includes('BLOCK')) {
      let penultimateLine = cutStringAfterInclusive(pairing, 'BLOCK'); // BLOCK/H-VOL   1525   1810   (INC-$5.05   CICO)   TOTAL   ALLOWANCE   -$   305.68 *!*
      newPairing.blockCredit = penultimateLine.match(/[0-9]{3,4}/g)[0];
      penultimateLine = cutStringAfterExclusive(
        penultimateLine,
        newPairing.blockCredit
      );
      if (penultimateLine.includes('THG')) {
        newPairing.thg = penultimateLine.match(/[0-9]{1,2}/g)[0];
        penultimateLine = cutStringAfterExclusive(
          penultimateLine,
          newPairing.thg
        );
      }
      if (penultimateLine.includes('DPG')) {
        newPairing.pairingDPG = penultimateLine.match(/[0-9]{1,3}/g)[0];
        penultimateLine = cutStringAfterExclusive(
          penultimateLine,
          newPairing.pairingDPG
        );
      }
      newPairing.totalDuty = penultimateLine.match(/[0-9]{3,4}/g)[0];
      if (penultimateLine.includes('CICO')) {
        newPairing.cicoAmount = penultimateLine
          .match(/\$[0-9]{1,2}.[0-9]{2}/g)[0]
          .replace('$', '');
      }
      penultimateLine = cutStringAfterExclusive(penultimateLine, 'ALLOWANCE');
      newPairing.totalAllowance =
        penultimateLine.match(/[0-9]{1,3}.[0-9]{2}/g)[0];
    }

    pairing = cutStringBeforeExclusive(pairing, '----------');

    // Split remainder of pairing into lines, either flight or layover
    if (pairing.includes('*!*')) {
      const sequence = pairing.split('*!*');
      if (sequence && sequence[sequence.length - 1] === ' ') {
        sequence.pop();
      }
      if (sequence && sequence[sequence.length - 1].match(/[0-9]{1,3} -DPG/)) {
        sequence.pop();
      }
      const pairingSequence = [];

      if (sequence) {
        for (let i = 0; i < sequence.length; i++) {
          const threeLetters = sequence[i].match(/[A-Z]{3}/g);
          if (!threeLetters && sequence[i].trim().length >= 9) {
            // Layover
            const layover = parseAsLayover(i, sequence[i]);
            pairingSequence.push(layover);
          } else if (
            threeLetters[0] === 'DHD' &&
            all_airports.includes(threeLetters[1]) &&
            all_airports.includes(threeLetters[2])
          ) {
            // Flight
            const flight = parseAsFlight(sequence[i], i);
            pairingSequence.push(flight);
          } else if (
            threeLetters[1] === 'DHD' &&
            all_airports.includes(threeLetters[2]) &&
            all_airports.includes(threeLetters[3])
          ) {
            // Flight
            const flight = parseAsFlight(sequence[i], i);
            pairingSequence.push(flight);
          } else if (
            all_airports.includes(threeLetters[0]) &&
            all_airports.includes(threeLetters[1])
          ) {
            // Flight
            const flight = parseAsFlight(sequence[i], i);
            pairingSequence.push(flight);
          } else if (
            sequence[i].trim().length >= 9 &&
            // threeLetters.length >= 1 &&
            threeLetters[0] === 'DPG'
          ) {
            // Layover
            const layover = parseAsLayover(i, sequence[i]);
            pairingSequence.push(layover);
          } else if (sequence[i].trim().length >= 9) {
            // Layover
            const layover = parseAsLayover(i, sequence[i]);
            pairingSequence.push(layover);
          } else {
            // pass
            // console.log(`oops2: ${sequence[i]}`);
          }
        }
      }
      // Add info for Layovers based on [i-1] and [i+1]
      for (let i = 0; i < pairingSequence.length; i++) {
        if (pairingSequence[i].hotelInfo) {
          // Layover
          const layover = pairingSequence[i];
          layover.layoverStart = pairingSequence[i - 1].arrivalTime;
          layover.layoverEnd = pairingSequence[i + 1].departureTime;
          layover.layoverLength = pairingSequence[i - 1].layoverLength;
          layover.layoverStation = pairingSequence[i - 1].arrivalAirport;
          pairingSequence[i] = layover;
        }
      }
      newPairing.sequence = pairingSequence;
      // newPairing.sequence = processPairingForDisplay(pairingSequence);
      addPairingToDB(newPairing);
      return;
    }
  } catch (err) {
    console.error(`${errorPairingNumber} ${err}`);
  }
};

export default parse;
