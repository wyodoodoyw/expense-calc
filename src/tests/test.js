import getMealsFromSequence from '../modules/getMealsFromSequence';
import getMealsFromSequenceDom from '../modules/getMealsFromSequenceDom';
import calculateDisplayTotal from '../modules/calcDisplayTotal';
import na_sun_airports from '../data/na_sun_airports';
import international_airport_codes from '../data/international_airport_codes';
import sun_domestic_airport_codes from '../data/sun_domestic_airport_codes';

const calcNumLayovers = (s) => {
  let layoverCount = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i].hotelInfo) {
      layoverCount++;
    }
  }
  return layoverCount;
};

// IndexedDB wrapped in Promises
const openDB = (name, version = undefined) =>
  new Promise((resolve, reject) => {
    try {
      const req = window.indexedDB.open(name, version);
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
      req.onblocked = () => console.warn(`${name} open blocked`);
    } catch (err) {
      reject(err);
    }
  });

const getAllFromStore = (db, storeName) =>
  new Promise((resolve, reject) => {
    try {
      const tx = db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => {
        resolve(req.result || []);
      };
      req.onerror = (e) => reject(e.target.error);
      tx.oncomplete = () => db.close();
    } catch (err) {
      reject(err);
    }
  });

/* Try to fetch expense rates for a station. We try a direct key-get first,
   otherwise fall back to scanning all records for a matching station field. */
async function fetchExpensesForStation(station) {
  if (!station) return {};
  let db;
  try {
    db = await openDB('ExpensesDB');
    const storeCandidates = ['expenses'];

    const normalize = (rec) => {
      const snap = JSON.parse(JSON.stringify(rec));
      return snap.rates || snap.expenses || snap.value || snap;
    };

    const indexCandidates = ['airport_codes'];

    for (const s of storeCandidates) {
      if (!db.objectStoreNames.contains(s)) continue;

      const store = db.transaction(s, 'readonly').objectStore(s);

      //--- Try lookups by known indexes (if the store defines them)
      for (const idxName of indexCandidates) {
        if (!store.indexNames || !store.indexNames.contains(idxName)) continue;

        const byIndex = await new Promise((resolve) => {
          try {
            const tx = db.transaction(s, 'readonly');
            const idx = tx.objectStore(s).index(idxName);
            const req = idx.get(station);
            req.onsuccess = () => {
              // console.log(`by station: ${JSON.stringify(req.result)}`);
              resolve(req.result);
            };
            req.onerror = () => resolve(undefined);
          } catch (err) {
            resolve(undefined);
          }
        }).catch(() => undefined);

        if (byIndex) return normalize(byIndex);
      }
    }

    return {};
  } catch (err) {
    console.warn('ExpensesDB open/lookup failed:', err);
    return {};
  } finally {
    try {
      if (db) db.close();
    } catch (e) {
      /* ignore close errors */
    }
  }
}

async function fetchAllPairings() {
  try {
    const db = await openDB('PairingsDB', 1).catch(() => openDB('PairingsDB'));
    // assume objectStore name 'pairings'
    try {
      const all = await getAllFromStore(db, 'pairings');
      return all;
    } catch (err) {
      console.error('Failed to read pairings store:', err);
      return [];
    }
  } catch (err) {
    console.error('PairingsDB open failed:', err);
    return [];
  }
}

function asNumber(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  const cleaned = String(v).replace(/[^0-9.]/g, ''); // strip currency chars, commas
  const n = Number(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

/* Main runner */
let numberOfTests = 0;
export async function runCheckAllPairings(min, max) {
  console.info('checkAllPairings: starting...');
  const pairings = await fetchAllPairings();

  if (!pairings || pairings.length === 0) {
    console.info('No pairings found in PairingsDB.');
    return;
  }

  // preload CA/US base rates once
  const caRates = await fetchExpensesForStation('YYZ');
  const usRates = await fetchExpensesForStation('MCO');

  let mismatchCount = 0;

  for (const p of pairings) {
    let arrivalStations = [];
    p.sequence.forEach((s) => {
      if (s.type === 'flight') arrivalStations.push(s.arrivalAirport);
    });

    if (p.pairingIdentifier >= min && p.pairingIdentifier <= max) {
      numberOfTests++;
      try {
        if (
          arrivalStations.some((s) => international_airport_codes.includes(s))
        ) {
          const seq = p.sequence || [];
          const numLayovers = calcNumLayovers(seq) || 0;
          const parsedAllowance = asNumber(p.totalAllowance);
          const { meals, station: intlStation } = getMealsFromSequence(
            seq || [],
          );
          const intlRates = await fetchExpensesForStation(intlStation);
          const calc = calculateDisplayTotal(
            meals || [],
            caRates || {},
            usRates || {},
            intlRates || caRates,
            numLayovers || undefined,
          );
          const calcRounded = Number(calc);
          const diff = Math.abs(calcRounded - parsedAllowance);
          const isMismatch =
            diff > 0.01 && !(isNaN(calcRounded) && isNaN(parsedAllowance));
          if (isMismatch) {
            mismatchCount++;
            console.warn(
              `Mismatch: Pairing ${
                p.pairingIdentifier || p.id || '<unknown>'
              } -> parsed: ${parsedAllowance}, calculated: ${calcRounded}, diff: ${diff.toFixed(
                2,
              )}`,
            );
          }
        } else if (arrivalStations.every((s) => na_sun_airports.includes(s))) {
          const seq = p.sequence || [];
          const numLayovers = calcNumLayovers(seq) || 0;
          const parsedAllowance = asNumber(p.totalAllowance);
          const { meals: meals, station: stn } = await getMealsFromSequenceDom(
            p.pairingIdentifier,
            seq || [],
            p.tafb,
          );
          let intlRates = caRates;
          if (sun_domestic_airport_codes.includes(stn)) {
            intlRates = await fetchExpensesForStation(stn);
          }
          const calc = calculateDisplayTotal(
            meals || [],
            caRates || {},
            usRates || {},
            intlRates,
            numLayovers || undefined,
          );
          const calcRounded = Number(calc);
          const diff = Math.abs(calcRounded - parsedAllowance);
          const isMismatch =
            diff > 0.01 && !(isNaN(calcRounded) && isNaN(parsedAllowance));
          if (isMismatch) {
            mismatchCount++;
            console.warn(
              `Mismatch: Pairing ${
                p.pairingIdentifier || p.id || '<unknown>'
              } -> parsed: ${parsedAllowance}, calculated: ${calcRounded}, diff: ${diff.toFixed(
                2,
              )}`,
            );
          }
        }
      } catch (err) {
        console.error(
          'Error processing pairing',
          p && p.pairingIdentifier,
          err,
        );
      }
    }
    // }
  }
  console.info(
    `checkAllPairings: done. Pairings processed: ${numberOfTests}, mismatches: ${mismatchCount}`,
  );

  return { total: pairings.length, mismatches: mismatchCount };
}
export default runCheckAllPairings;
