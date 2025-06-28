/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';

const TotalTable = (props) => {
  const { usAllowance } = useSelector((state) => state.pairing);
  const caAllowance = useSelector((state) => state.pairing.caAllowance);
  console.log(caAllowance);
  return (
    <>
      <table className="table table-striped table-bordered mt-3 text-center">
        <tbody>
          <tr>
            <td>CAN</td>
            <td>${caAllowance}</td>
          </tr>
          <tr>
            <td>US</td>
            <td>${usAllowance}</td>
          </tr>
          <tr className="table-primary">
            <td>Total</td>
            <td>${caAllowance + usAllowance}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default TotalTable;
