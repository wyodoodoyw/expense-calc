/* eslint-disable react/prop-types */
import { useState, createContext } from 'react';

const PairingContext = createContext([{}, () => {}]);

const PairingProvider = (props) => {
  const [state, setState] = useState({});
  return (
    <PairingContext.Provider value={{ key: [state, setState] }}>
      {props.children}
    </PairingContext.Provider>
  );
};

export { PairingContext, PairingProvider };
