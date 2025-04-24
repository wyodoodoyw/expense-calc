import { useState } from 'react';

function Alert() {
  const [checked, setChecked] = useState(false);

  return (
    <dialog open>
      <h3>PLEASE READ</h3>
      <p>
        This website/app is a work in progress. I make no claims about its
        accuracy whatsoever. Please use it at your own risk and double-check any
        results obtained by it.
      </p>
      <p>
        I am not responsible for any errors or omissions in the information
        provided by this website/app.
      </p>
      <form method="dialog">
        <input type="checkbox" id="accept" onClick={setChecked(!checked)} />
        {/* {checked && <button>Accept</button>} */}
      </form>
    </dialog>
  );
}

export default Alert;
