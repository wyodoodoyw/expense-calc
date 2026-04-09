/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';

function Layover(props) {
  const { index } = props;

  const l = useSelector((state) => state.pairing.sequence[index]);

  return (
    <div>
      <div className="row align-middle my-1">
        <div className="col-2"></div>
        <div className="col-5">Layover: {l.layoverStation}</div>
        <div className="col-3">Layover Length: {l.layoverLength}</div>
        <div className="col-2">Meals: {l.layoverMeals}</div>
      </div>
    </div>
  );
}

export default Layover;
