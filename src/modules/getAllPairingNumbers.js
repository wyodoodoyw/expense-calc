const getAllPairingNumbers = () => {
  const request = window.indexedDB.open('PairingsDB', 1);

  request.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction(['pairings'], 'readonly');
    const pairingsStore = tx.objectStore('pairings', {
      keyPath: 'pairingNumber',
    });
    const pairingNumberIndex = pairingsStore.index('pairingNumber');
    const request = pairingNumberIndex.getAllKeys();

    request.onsuccess = () => {
      const allPairings = request.result;
      console.log(`done ${JSON.stringify(allPairings)}`);
    };
  };

  request.onerror = (event) => {
    console.error(
      `DB Error: ${event.target.errorCode} - ${event.target.error}`
    );
  };
};

export default getAllPairingNumbers;
