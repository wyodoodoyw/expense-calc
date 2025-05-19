import { useState } from 'react';
import extractTextFromPDF from '../modules/pdf-parser-client-side';
import cutStringAfterInclusive from '../cutStringAfterInclusive';
import cutStringAfterExclusive from '../cutStringAfterExclusive';
import cutStringBeforeExclusive from '../cutStringBeforeExclusive';
import all_airports from '../data/all_airports';
import aircraft from '../data/aircraft';
import other_airlines from '../data/other_airlines';

const PairingFileUploader = () => {
  const [file, setFile] = useState(null);
  // const [expensesList, setExpensesList] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const addPairingToDB = (newPairing) => {
    const request = window.indexedDB.open('PairingsDB', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction(['pairings'], 'readwrite');
      const pairingsStore = tx.objectStore('pairings');
      const pairingNumberIndex = pairingsStore.index('pairingNumber');
      // const countryIndex = pairingsStore.index('country_code');

      pairingsStore.put(newPairing);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const pairingsStore = db.createObjectStore('pairings', {
        keyPath: 'id',
        autoIncrement: true,
      });
      pairingsStore.createIndex('pairingNumber', 'pairingNumber', {
        multiEntry: true,
      });
    };

    request.onerror = (event) => {
      console.log(`!DB Error: ${event.target.error}`);
    };
  };

  const parseAsFlight = (line, index) => {
    // console.log('---FLIGHT---');
    const newFlight = {
      index: index,
    };

    // Find occurance of aircraft designator, parse substring prior to it
    let otherAirlines = '';
    if (other_airlines) {
      for (let i = 0; i < other_airlines.length; i++) {
        otherAirlines += `|${other_airlines[i]}`;
      }
    }
    const regex = new RegExp(String.raw`[0-9]{3}|(77P${otherAirlines})`, 'g');
    let threeNumbers = line.match(regex);
    if (threeNumbers) {
      for (let i = 0; i < threeNumbers.length; i++) {
        if (aircraft.includes(threeNumbers[i])) {
          newFlight.aircraft = threeNumbers[i];
          // console.log(`newFlight.aircraft ${newFlight.aircraft}`);
        }
      }
    }
    let days = cutStringBeforeExclusive(line, newFlight.aircraft);
    newFlight.daysOfWeek = days.match(/[0-9]/g);
    // console.log(`dayfOfWeek: ${newFlight.daysOfWeek}`);

    // Remove substring that has been parsed above
    line = cutStringAfterExclusive(line, newFlight.aircraft);

    line.includes('DHD')
      ? (newFlight.isDeadhead = true)
      : (newFlight.isDeadhead = false);
    // console.log(`isDHD: ${newFlight.isDeadhead}`);
    // console.log(line);
    line = line.replace('DHD', '');

    const numbers = line.match(/[0-9]{1,4}/g);
    // console.log(`numbers: ${numbers}`);
    newFlight.flightNumber = numbers[0];
    newFlight.departureTime = numbers[1];
    newFlight.arrivalTime = numbers[2];
    newFlight.flightTime = numbers[3];

    if (numbers[5]) {
      newFlight.dutyTime = numbers[4];
      newFlight.layoverLength = numbers[5];
    }

    const airports = line.match(/[A-Z]{3}/g);
    newFlight.departureAirport = airports[0];
    newFlight.arrivalAirport = airports[1];
    // console.log(`dept: ${newFlight.departureAirport}`);
    // console.log(`arrv: ${newFlight.arrivalAirport}`);

    // Remove substring that has been parsed above
    line = cutStringAfterExclusive(line, airports[1]);
    if (line.match(/[A-Z]{2}/g)) {
      newFlight.mealsOnboard = line.match(/[A-Z]{2}/g);
    }
    // console.log(`meals: ${newFlight.mealsOnboard}`);
    // console.log('---FLIGHT END---');
    return newFlight;
  };

  const parseAsLayover = (line, layoverLength, index) => {
    // console.log('---LAYOVER---');
    const newLayover = {
      index: index,
      layoverLength: layoverLength,
    };
    const hotelInfo = line.match(/[A-Z][a-z]{1,9}.?s?/g);
    if (hotelInfo) {
      newLayover.hotelInfo = hotelInfo.join(' ');
    }
    // console.log(`hotel: ${newLayover.hotelInfo}`);

    if (hotelInfo) {
      let mealsInfo = cutStringAfterExclusive(
        line,
        hotelInfo[hotelInfo.length - 1]
      );
      mealsInfo = mealsInfo.trim();
      newLayover.meals = mealsInfo;
      // console.log(`meals: ${newLayover.meals}`);
    }
    return newLayover;
  };

  // let errorPairingNumber = null;
  //----- PARSER -----//
  const parse = (pairing) => {
    // *** MAIN PARSER

    if (!pairing) {
      throw new Error('Pairing is empty');
    }
    // New object
    let newPairing = {};

    // Pairing Number
    if (pairing.match(/(C|M|T|V)[0-9]{4}/)) {
      newPairing.pairingNumber = pairing.match(/(C|M|T|V)[0-9]{4}/)[0];
      // console.log(`pairingNumber: ${newPairing.pairingNumber}`);
      // errorPairingNumber = pairing.match(/(C|M|T|V)[0-9]{4}/)[0];
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
      // throw new Error('Error parsing date on which pairing operates');
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
      newPairing.blockCredit = penultimateLine.match(/[0-9]{3,4}/g)[0];
      penultimateLine = cutStringAfterExclusive(
        penultimateLine,
        newPairing.blockCredit
      );
      // console.log(`blockCredit: ${newPairing.blockCredit}`);

      if (penultimateLine.includes('THG')) {
        newPairing.thg = penultimateLine.match(/[0-9]{1,2}/g)[0];
        penultimateLine = cutStringAfterExclusive(
          penultimateLine,
          newPairing.HG
        );
      }
      // console.log(`THG: ${newPairing.thg}`);

      if (penultimateLine.includes('DPG')) {
        newPairing.pairingDPG = penultimateLine.match(/[0-9]{1,3}/g)[0];
        penultimateLine = cutStringAfterExclusive(
          penultimateLine,
          newPairing.pairingDPG
        );
      }
      // console.log(`pairingDPG: ${newPairing.pairingDPG}`);
      newPairing.totalDuty = penultimateLine.match(/[0-9]{3,4}/g)[0];
      if (penultimateLine.includes('CICO')) {
        newPairing.cicoAmount = penultimateLine
          .match(/\$[0-9]{1,2}.[0-9]{2}/g)[0]
          .replace('$', '');
      }
      // console.log(`cico: ${newPairing.cicoAmount}`);
      penultimateLine = cutStringAfterExclusive(penultimateLine, 'ALLOWANCE');
      newPairing.totalAllowance =
        penultimateLine.match(/[0-9]{1,3}.[0-9]{2}/g)[0];
    }
    // console.log(`allowance: ${newPairing.totalAllowance}`);
    pairing = cutStringBeforeExclusive(pairing, '----------');

    // Split remainder of pairing into lines, either flight or layover
    if (pairing.includes('*!*')) {
      const sequence = pairing.split('*!*');
      console.log(sequence);
      let layoverLength = '0';
      const pairingSequence = [];
      if (sequence) {
        for (let i = 0; i < sequence.length; i++) {
          const threeLetters = sequence[i].match(/[A-Z]{3}/g);
          console.log(sequence[i].trim());
          console.log(sequence[i].trim().length);

          if (!threeLetters) {
            // pass
          } else if (
            threeLetters[0] === 'DHD' &&
            all_airports.includes(threeLetters[1]) &&
            all_airports.includes(threeLetters[2])
          ) {
            // Flight
            const flight = parseAsFlight(sequence[i], i);
            if (flight.layoverLength) {
              layoverLength = flight.layoverLength;
            }
            layoverLength = null;
            pairingSequence.push(flight);
          } else if (
            all_airports.includes(threeLetters[0]) &&
            all_airports.includes(threeLetters[1])
          ) {
            // Flight
            const flight = parseAsFlight(sequence[i], i);
            if (flight.layoverLength) {
              layoverLength = flight.layoverLength;
            }
            layoverLength = null;
            pairingSequence.push(flight);
          } else if (
            sequence[i].trim().length >= 9 &&
            threeLetters.length >= 1 &&
            threeLetters[0] === 'DPG'
          ) {
            // Layover
            // newPairing.dayDPG = sequence[i].match(/[0-9]{2,3}/g)[0];
            const layover = parseAsLayover(sequence[i], layoverLength, i);
            pairingSequence.push(layover);
            layoverLength = null;
          } else if (sequence[i].trim().length >= 9) {
            // Layover
            const layover = parseAsLayover(sequence[i], layoverLength, i);
            pairingSequence.push(layover);
            layoverLength = null;
          } else {
            // pass
          }
        }
      }
      newPairing.pairingSequence = pairingSequence;
      addPairingToDB(newPairing);
      return;
    }
  };

  const handleUpload = async () => {
    // delete existing DB
    const request = window.indexedDB.deleteDatabase('PairingsDB');
    request.onsuccess = () => {
      // console.log('Database deleted successfully');
    };
    request.onerror = () => {
      console.log('Error deleting database');
    };
    request.onblocked = () => {
      console.log('Database deletion blocked');
    };

    if (file) {
      // Read pdf file
      let text = await extractTextFromPDF(file);
      // text && setUploaded(true);
      // Remove header
      const firstPairingNumber = text.match(/(C|M|T|V)[0-9]{4}/)[0];
      text = cutStringAfterInclusive(text, firstPairingNumber);
      const pairings = text.match(
        /(C[0-9]{4}|M[0-9]{4}|T[0-9]{4}|V[0-9]{4})[a-zA-Z0-9 .,!?/()\-$*]*/g
      );
      // console.log(pairings);
      for (const pairing of pairings) {
        if (pairing === '' || pairing === ' ' || pairing === null) {
          //pass
        } else if (pairing.includes('==')) {
          //pass
        } else if (pairing.length > 2) {
          // console.log(pairing);
          parse(pairing);
        }
      }
    }
  };

  return (
    <>
      <div className="input-group">
        <input id="file" type="file" onChange={handleFileChange} />
      </div>

      {file && (
        <button onClick={handleUpload} className="submit">
          Upload Pairing File
        </button>
      )}
    </>
  );
};

export default PairingFileUploader;
