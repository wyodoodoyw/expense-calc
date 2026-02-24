import getMealsFromSequence from '../modules/getMealsFromSequence';
import getMealsFromSequenceDom from '../modules/getMealsFromSequenceDom';
import calculateDisplayTotal from '../modules/calcDisplayTotal';

let numberOfTests = 0;

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
  // strip currency chars, commas
  const cleaned = String(v).replace(/[^0-9.]/g, '');
  const n = Number(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

/* Main runner */
export async function runCheckAllPairings(min, max, { logAll = false } = {}) {
  console.info('checkAllPairings: starting...');
  const pairings = await fetchAllPairings();
  const prefix = max[0];
  const num = max.slice(-4);
  const newMax = `${prefix}${(Number(num) + 1).toString()}`;
  let minIdx = -1;
  let maxIdx = -1;
  for (let i = 0; i < pairings.length; i++) {
    const p = pairings[i];
    if (p.pairingNumber === min) {
      minIdx = i;
    }
    if (p.pairingNumber === newMax) {
      maxIdx = i;
    }
  }
  const slicedPairings = pairings.slice(minIdx, maxIdx);
  numberOfTests = slicedPairings.length;
  if (!pairings || pairings.length === 0) {
    console.info('No pairings found in PairingsDB.');
    return;
  }

  // preload CA/US base rates once
  const caRates = await fetchExpensesForStation('YYZ');
  const usRates = await fetchExpensesForStation('MCO');

  let mismatchCount = 0;

  for (const p of pairings) {
    if (p.pairingNumber >= min && p.pairingNumber <= max) {
      try {
        if (
          Number(p.pairingNumber.slice(-4)) >= 5000 &&
          Number(p.pairingNumber.slice(-4)) < 7000
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
            null, //usRates
            intlRates || {},
            numLayovers || 0,
          );
          const calcRounded = Number(calc);

          const diff = Math.abs(calcRounded - parsedAllowance);
          const isMismatch =
            diff > 0.01 && !(isNaN(calcRounded) && isNaN(parsedAllowance));

          if (isMismatch) {
            mismatchCount++;
            console.warn(
              `Mismatch: Pairing ${
                p.pairingNumber || p.id || '<unknown>'
              } -> parsed: ${parsedAllowance}, calculated: ${calcRounded}, diff: ${diff.toFixed(
                2,
              )}`,
            );
            if (logAll) {
              console.log('  meals:', meals);
              console.log('  intlStation:', intlStation);
              console.log('  caRates:', caRates);
              console.log('  intlRates:', intlRates);
              console.log('  pairing raw:', p);
            }
          } else {
            if (logAll) {
              console.info(
                `OK: Pairing ${
                  p.pairingNumber || p.id || '<unknown>'
                } -> parsed: ${parsedAllowance}, calculated: ${calcRounded}`,
              );
            }
          }
        } else if (Number(p.pairingNumber.slice(-4)) >= 7000) {
          const seq = p.sequence || [];
          const numLayovers = calcNumLayovers(seq) || 0;
          const parsedAllowance = asNumber(p.totalAllowance);
          const { meals, station: usStation } = getMealsFromSequenceDom(
            seq || [],
            p.tafb,
          );

          const calc = calculateDisplayTotal(
            meals || [],
            caRates || {},
            usRates || {},
            null, // intlRates
            numLayovers || 0,
          );
          const calcRounded = Number(calc);

          const diff = Math.abs(calcRounded - parsedAllowance);
          const isMismatch =
            diff > 0.01 && !(isNaN(calcRounded) && isNaN(parsedAllowance));

          if (isMismatch) {
            mismatchCount++;
            console.warn(
              `Mismatch: Pairing ${
                p.pairingNumber || p.id || '<unknown>'
              } -> parsed: ${parsedAllowance}, calculated: ${calcRounded}, diff: ${diff.toFixed(
                2,
              )}`,
            );
            if (logAll) {
              console.log('  meals:', meals);
              console.log('  usStation:', usStation);
              console.log('  caRates:', caRates);
              console.log('  usRates:', usRates);
              console.log('  pairing raw:', p);
            }
          } else {
            if (logAll) {
              console.info(
                `OK: Pairing ${
                  p.pairingNumber || p.id || '<unknown>'
                } -> parsed: ${parsedAllowance}, calculated: ${calcRounded}`,
              );
            }
          }
        }
      } catch (err) {
        console.error('Error processing pairing', p && p.pairingNumber, err);
      }
    }
  }

  console.info(
    `checkAllPairings: done. Pairings processed: ${numberOfTests}, mismatches: ${mismatchCount}`,
  );
  return { total: pairings.length, mismatches: mismatchCount };
}
export default runCheckAllPairings;
