const getExpensesFromDB = (code) => {
  const request = window.indexedDB.open('ExpensesDB', 1);

  request.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction(['expenses'], 'readonly');
    const expensesStore = tx.objectStore('expenses');
    const airportCodesIndex = expensesStore.index('airport_codes');
    const request = airportCodesIndex.get(code);

    request.onsuccess = () => {
      return request.result;
    };

    request.onerror = (event) => {
      console.log(`!DB Error: ${event.target.error}`);
    };

    tx.oncomplete = () => {
      db.close();
    };
  };
};

export default getExpensesFromDB;
