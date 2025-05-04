function ExplanationDomesticArrivals() {
  return (
    <>
      <strong>Arrivals </strong>i.e. ending a duty period, not including 15
      minutes deplaning
      <table className="table table-striped table-bordered text-start">
        <tbody>
          <tr>
            <td colSpan={2}>
              Use the table below to determine the last meal to which you are
              entitled. You are entitled to all meals in between.
            </td>
          </tr>
          <tr>
            <td>Arrive after 09:30 and on duty from 08:00 to 09:30</td>
            <td>B</td>
          </tr>
          <tr>
            <td>Arrive after 13:30 and on duty from 12:30 to 13:30</td>
            <td>L</td>
          </tr>
          <tr>
            <td>Arrive after 18:30 and on duty from 17:00 to 18:30</td>
            <td>D</td>
          </tr>
          <tr>
            <td>Arrive after 01:00 and on duty from 23:00 to 01:00</td>
            <td>S</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default ExplanationDomesticArrivals;
