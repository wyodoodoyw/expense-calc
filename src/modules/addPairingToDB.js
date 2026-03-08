const addPairingToDB = (newPairing) => {
  const request = window.indexedDB.open('PairingsDB', 1);

  request.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction(['pairings'], 'readwrite');
    const pairingsStore = tx.objectStore('pairings');
    const pairingNumberIndex = pairingsStore.index('pairingIdentifier');

    pairingsStore.put(newPairing);
  };

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    const pairingsStore = db.createObjectStore('pairings', {
      keyPath: 'id',
      autoIncrement: true,
    });
    pairingsStore.createIndex('pairingIdentifier', 'pairingIdentifier', {
      multiEntry: true,
    });
  };

  request.onerror = (event) => {
    console.log(`!DB Error: ${event.target.error}`);
  };
};

export default addPairingToDB;
