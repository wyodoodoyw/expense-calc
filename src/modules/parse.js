import cutStringAfterInclusive from '../cutStringAfterInclusive';
import cutStringAfterExclusive from '../cutStringAfterExclusive';
import cutStringBeforeExclusive from '../cutStringBeforeExclusive';
import all_airports from '../data/all_airports';
import parseAsFlight from '../modules/parseAsFlight';
import parseAsLayover from '../modules/parseAsLayover';
import addPairingToDB from '../modules/addPairingToDB';

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
      // console.log(`pairingNumber: ${newPairing.pairingNumber}`);
      errorPairingNumber = pairing.match(/(C|M|T|V)[0-9]{4}/)[0];
    } else {
      throw new Error('Error parsing pairing number');
    }

    // Date on which pairing operates
    if (pairing.match(/[0-9]{2}[A-Z]{3} {1,3}- {1,3}[0-9]{2}[A-Z]{3}/)) {
      newPairing.pairingOperates = pairing
        .match(/[0-9]{2}[A-Z]{3} {1,3}- {1,3}[0-9]{2}[A-Z]{3}/)[0]
        .replace('   -   ', '-');
      // console.log(`pairingOperates: ${newPairing.pairingOperates}`);
    } else {
      throw new Error('Error parsing date on which pairing operates');
    }

    // Remove substring that has been parsed above
    pairing = cutStringAfterExclusive(pairing, '*!*');

    // Number of Pursers/Flight Attendants/Galley Attendants/Language Positions
    let crew = cutStringBeforeExclusive(pairing, '*!*');
    if (crew) {
      newPairing.pairingCrew = crew.match(/[A-Z]{1,2} ?[0-9]{2}/g);
      // console.log(`pairingCrew: ${newPairing.pairingCrew}`);
      const languages = [];
      if (newPairing.pairingCrew) {
        for (let i = 0; i < newPairing.pairingCrew.length; i++) {
          const positions = newPairing.pairingCrew[i];
          if (positions.includes('P')) {
            newPairing.pairingPurser = positions.replace('P', '');
            // console.log(`P: ${newPairing.pairingPurser}`);
          } else if (positions.includes('FA')) {
            newPairing.pairingFA = positions.replace('FA', '');
            // console.log(`FA: ${newPairing.pairingFA}`);
          } else if (positions.includes('BL')) {
            newPairing.pairingBL = positions.replace('BL', '');
            // console.log(`BL: ${newPairing.pairingBL}`);
          } else if (positions.includes('GJ')) {
            newPairing.pairingGP = positions.replace('GJ', '');
            // console.log(`GJ: ${newPairing.pairingGP}`);
          } else if (positions.includes('GY')) {
            newPairing.pairingGY = positions.replace('GY', '');
            // console.log(`GY: ${newPairing.pairingGY}`);
          } else {
            languages.push(positions);
          }
        }
      }

      if (languages.length > 0) {
        newPairing.pairingLanguages = languages;
        // console.log(`languages: ${newPairing.languages}`);
      }
    } else {
      throw new Error('Error parsing crew');
    }

    // Remove substring that has been parsed above
    pairing = cutStringAfterExclusive(pairing, '*!*');

    // Parse calendar and dates the pairing operates on
    if (pairing.includes('Su   Mo')) {
      newPairing.calendar = cutStringAfterInclusive(pairing, 'Su   Mo');
      // console.log(newPairing.calendar);
      newPairing.pairingDates = newPairing.calendar.match(/[0-9]{1,2}/g);
    }
    // console.log(`pairingDates: ${newPairing.pairingDates}`);

    // Parse last line of pairing (TAFB etc.)
    if (pairing.includes('TAFB')) {
      let lastLine = cutStringAfterInclusive(pairing, 'TAFB');
      lastLine = cutStringBeforeExclusive(lastLine, 'Su   Mo'); // TAFB/PTEB   4405   TOTAL -   1525 *!*
      // console.log(`last: ${lastLine.match(/[0-9]{3,5}/g)}`);
      newPairing.tafb = lastLine.match(/[0-9]{3,5}/g)[0];
      newPairing.totalCredit = lastLine.match(/[0-9]{3,4}/g)[1];
    }
    // console.log(`TAFB: ${newPairing.tafb}`);
    // console.log(`Total credit: ${newPairing.totalCredit}`);

    // Remove substring that has been parsed above
    pairing = cutStringBeforeExclusive(pairing, 'TAFB');

    // parse second last line of pairing (Block etc.)
    if (pairing.includes('BLOCK')) {
      let penultimateLine = cutStringAfterInclusive(pairing, 'BLOCK'); // BLOCK/H-VOL   1525   1810   (INC-$5.05   CICO)   TOTAL   ALLOWANCE   -$   305.68 *!*
      // console.log(`pen1: ${penultimateLine.match(/[0-9]{3,4}/g)}`);
      newPairing.blockCredit = penultimateLine.match(/[0-9]{3,4}/g)[0];
      penultimateLine = cutStringAfterExclusive(
        penultimateLine,
        newPairing.blockCredit
      );
      // console.log(`blockCredit: ${newPairing.blockCredit}`);
      // console.log(`pen2: ${penultimateLine.match(/[0-9]{3,4}/g)}`);
      if (penultimateLine.includes('THG')) {
        newPairing.thg = penultimateLine.match(/[0-9]{1,2}/g)[0];
        penultimateLine = cutStringAfterExclusive(
          penultimateLine,
          newPairing.thg
        );
      }
      // console.log(`THG: ${newPairing.thg}`);
      // console.log(`pen3: ${penultimateLine.match(/[0-9]{3,4}/g)}`);
      if (penultimateLine.includes('DPG')) {
        newPairing.pairingDPG = penultimateLine.match(/[0-9]{1,3}/g)[0];
        penultimateLine = cutStringAfterExclusive(
          penultimateLine,
          newPairing.pairingDPG
        );
      }
      // console.log(`pairingDPG: ${newPairing.pairingDPG}`);
      // console.log(`pen4: ${penultimateLine.match(/[0-9]{3,4}/g)}`);
      newPairing.totalDuty = penultimateLine.match(/[0-9]{3,4}/g)[0];
      if (penultimateLine.includes('CICO')) {
        newPairing.cicoAmount = penultimateLine
          .match(/\$[0-9]{1,2}.[0-9]{2}/g)[0]
          .replace('$', '');
      }
      // console.log(`cico: ${newPairing.cicoAmount}`);
      // console.log(`pen5: ${penultimateLine.match(/[0-9]{3,4}/g)}`);
      penultimateLine = cutStringAfterExclusive(penultimateLine, 'ALLOWANCE');
      newPairing.totalAllowance =
        penultimateLine.match(/[0-9]{1,3}.[0-9]{2}/g)[0];
    }

    // console.log(`allowance: ${newPairing.totalAllowance}`);

    pairing = cutStringBeforeExclusive(pairing, '----------');

    // Split remainder of pairing into lines, either flight or layover
    if (pairing.includes('*!*')) {
      const sequence = pairing.split('*!*');
      // console.log(`sequence: ${sequence}`);
      if (sequence && sequence[sequence.length - 1] === ' ') {
        sequence.pop();
      }
      if (sequence && sequence[sequence.length - 1].match(/[0-9]{1,3} -DPG/)) {
        sequence.pop();
      }
      // console.log(sequence);
      let layoverLength = null;
      const pairingSequence = [];

      if (sequence) {
        for (let i = 0; i < sequence.length; i++) {
          // console.log(`sequence: ${sequence[i]}`);
          const threeLetters = sequence[i].match(/[A-Z]{3}/g);
          // console.log(`three: ${threeLetters}`);
          // console.log(`sequence.trim: ${sequence[i].trim()}`);
          if (!threeLetters && sequence[i].trim().length >= 9) {
            // Layover
            const layover = parseAsLayover(sequence[i], layoverLength, i);
            pairingSequence.push(layover);
            layoverLength = null;
          } else if (
            threeLetters[0] === 'DHD' &&
            all_airports.includes(threeLetters[1]) &&
            all_airports.includes(threeLetters[2])
          ) {
            // console.log(`DHD + YYY + XXX: ${threeLetters}`);
            // Flight
            const flight = parseAsFlight(sequence[i], i);
            if (flight.layoverLength) {
              layoverLength = flight.layoverLength;
            }
            pairingSequence.push(flight);
          } else if (
            threeLetters[1] === 'DHD' &&
            all_airports.includes(threeLetters[2]) &&
            all_airports.includes(threeLetters[3])
          ) {
            // Flight
            const flight = parseAsFlight(sequence[i], i);
            if (flight.layoverLength) {
              layoverLength = flight.layoverLength;
            }
            // console.log(flight);
            pairingSequence.push(flight);
          } else if (
            all_airports.includes(threeLetters[0]) &&
            all_airports.includes(threeLetters[1])
          ) {
            // console.log(`XXX + YYY: ${threeLetters}`);
            // Flight
            const flight = parseAsFlight(sequence[i], i);
            if (flight.layoverLength) {
              layoverLength = flight.layoverLength;
            }
            // console.log(flight);
            pairingSequence.push(flight);
          } else if (
            sequence[i].trim().length >= 9 &&
            // threeLetters.length >= 1 &&
            threeLetters[0] === 'DPG'
          ) {
            // console.log(`DPG + hotel info: ${threeLetters}`);
            // Layover
            // newPairing.dayDPG = sequence[i].match(/[0-9]{2,3}/g)[0];
            const layover = parseAsLayover(sequence[i], layoverLength, i);
            pairingSequence.push(layover);
            layoverLength = null;
          } else if (sequence[i].trim().length >= 9) {
            // Layover
            const layover = parseAsLayover(sequence[i], layoverLength, i);
            // console.log(`layover: ${JSON.stringify(layover)}`);
            pairingSequence.push(layover);
            layoverLength = null;
          } else {
            // pass
            // console.log(`oops2: ${sequence[i]}`);
          }
        }
      }
      newPairing.pairingSequence = pairingSequence;
      addPairingToDB(newPairing);
      return;
    }
  } catch (err) {
    console.error(`${errorPairingNumber} ${err}`);
  }
};

export default parse;
