const getExpensesFromDB = (code, setter) => {
  const request = window.indexedDB.open('ExpensesDB', 1);

  request.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction(['expenses'], 'readonly');
    const expensesStore = tx.objectStore('expenses');
    const airportCodesIndex = expensesStore.index('airport_codes');
    const request2 = airportCodesIndex.get(code);

    request2.onsuccess = () => {
      const res = request2.result.expenses;
      setter(res);
    };

    request2.onerror = (event) => {
      console.log(`!DB Error: ${event.target.error}`);
    };

    tx.oncomplete = () => {
      db.close();
    };
  };
};

export default getExpensesFromDB;
