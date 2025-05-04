function ExplanationInternationalArrival() {
  return (
    <>
      <strong>
        Scheduled Arrival at Layover - Meal Allowances on Day of Arrival
      </strong>
      <table className="table table-striped table-bordered text-start">
        <tbody>
          <tr>
            <td>Arrival before 12:30</td>
            <td>BLDS</td>
          </tr>
          <tr>
            <td>Arrival between 12:30 and 13:30</td>
            <td>LDS</td>
          </tr>
          <tr>
            <td>Arrival after 13:30</td>
            <td>DS</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default ExplanationInternationalArrival;
