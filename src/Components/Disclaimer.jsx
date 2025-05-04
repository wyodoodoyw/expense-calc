import { useState } from 'react';

function Disclaimer(props) {
  const { clicked, setClicked } = props;
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="container col-8 border rounded p-3 mb-3 text-start">
      <h5>Please Read:</h5>
      <p>
        This website is currently a work in progress. While we strive to provide
        accurate and up-to-date information, we make no guarantees regarding the
        completeness, reliability, or accuracy of the content. Users are
        encouraged to independently verify any information found on this site.
        We do not accept any responsibility or liability for errors, omissions,
        or any outcomes resulting from the use of this website.
      </p>
      <div className="form-check">
        <input
          className="form-check-input me-3"
          type="checkbox"
          value=""
          id="disclaimerCheck"
          onClick={() => setAccepted(!accepted)}
        />
        <label className="form-check-label" htmlFor="disclaimerCheck">
          By using this website, you acknowledge that you have read and
          understood this disclaimer and agree to its terms.
        </label>
        {accepted && (
          <input
            type="button"
            className="btn btn-primary btn-sm ms-3"
            value="Accept"
            onClick={() => setClicked(!clicked)}
          />
        )}
      </div>
    </div>
  );
}

export default Disclaimer;
