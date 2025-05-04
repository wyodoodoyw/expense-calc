function ExplanationDomesticDept() {
  return (
    <>
      <strong>Departures </strong>i.e. starting a duty period at home base
      <table className="table table-striped table-bordered text-start">
        <tbody>
          <tr>
            <td colSpan={2}>
              Use the table below to determine the first meal to which you are
              entitled.
            </td>
          </tr>
          <tr>
            <td>Depart before 08:00 and on duty from 08:00 to 09:30</td>
            <td>B</td>
          </tr>
          <tr>
            <td>Depart before 12:30 and on duty from 12:30 to 13:30</td>
            <td>L</td>
          </tr>
          <tr>
            <td>Depart before 18:00 and on duty from 18:00 to 19:30</td>
            <td>D</td>
          </tr>
          <tr>
            <td>Depart before 23:00 and on duty from 23:00 to 01:00</td>
            <td>S</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default ExplanationDomesticDept;
