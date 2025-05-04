function ExplanationCanadaOrUS() {
  return (
    <>
      <p>
        <strong>
          * This tool is not yet set up to calculate layover expenses when there
          is a mix of Canadian and US rates.
        </strong>
        The meal entitlements should be accurate, but you will need to double
        check the dollar amounts using the table below.
      </p>
      <table className="table table-striped table-bordered text-start">
        <tbody>
          <tr>
            <td colSpan={2}>Layovers are always paid at the layover rate</td>
          </tr>
          <tr>
            <td colSpan={2}>
              Breakfast is always paid at the rate of the country of departure
            </td>
          </tr>
          <tr>
            <td>
              Flight departs prior to 12:00 <br></br>Flight departs at 12:00 or
              later
            </td>
            <td>
              L paid at rate of country of destination <br></br>L paid at rate
              of country of departure
            </td>
          </tr>
          <tr>
            <td>
              Flight departs prior to 17:30 <br></br>Flight departs at 17:30 or
              later
            </td>
            <td>
              D paid at rate of country of destination <br></br>D paid at rate
              of country of departure
            </td>
          </tr>
          <tr>
            <td>
              Flight departs prior to 22:30 <br></br>Flight departs after 22:30
              but prior to 00:59
            </td>
            <td>
              S paid at rate of country of destination <br></br>S paid at rate
              of country of departure
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default ExplanationCanadaOrUS;
