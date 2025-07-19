const getExpensesFromDB = (code) => {
  const request = window.indexedDB.open('ExpensesDB', 1);

  request.onsuccess = (event) => {
    const db = event.target.result;
    const tx = db.transaction(['expenses'], 'readonly');
    const expensesStore = tx.objectStore('expenses');
    const airportCodesIndex = expensesStore.index('airport_codes');
    const request = airportCodesIndex.get(code);

    request.onsuccess = () => {
      const res = request.result.expenses;
      console.log(JSON.stringify(res.breakfast));
      const expenses = res.breakfast;
      // lunch: res.lunch,
      // dinner: res.dinner,
      // snack: res.snack,
      // };
      return expenses;
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
