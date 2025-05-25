const processPairingForDisplay = (pairingSequence) => {
  const pairingSequenceArray = [];
  let dutyDayStartingIndex = 0;
  for (let i = 0; i < pairingSequence.length; i++) {
    if (i === dutyDayStartingIndex && pairingSequence[i].dutyTime) {
      // One leg in Duty Day
      pairingSequenceArray.push(pairingSequence[i]);
    } else if (i === dutyDayStartingIndex) {
      // First leg in multileg day
      pairingSequenceArray.push(pairingSequence[i]);
    } else if (i !== dutyDayStartingIndex && pairingSequence[i].dutyTime) {
      //End of duty day
      pairingSequenceArray.push(pairingSequence[i]);
    } else if (i !== dutyDayStartingIndex && pairingSequence[i].hotelInfo) {
      // layover
      const layover = pairingSequence[i];
      layover.layoverStart = pairingSequence[i - 1].arrivalTime;
      layover.layoverEnd = pairingSequence[i + 1].departureTime;
      layover.layoverLength = pairingSequence[i - 1].layoverLength;
      layover.layoverStation = pairingSequence[i - 1].arrivalAirport;
      dutyDayStartingIndex = i + 1;
      pairingSequenceArray.push(layover);
      dutyDayStartingIndex = i + 1;
      // console.log(`Layover: ${JSON.stringify(layover)}`);
    } else if (i !== dutyDayStartingIndex && !pairingSequence[i].dutyTime) {
      // flight within duty day
      pairingSequenceArray.push(pairingSequence[i]);
    } else {
      console.log(`!else: ${JSON.stringify(pairingSequence[i])}`);
    }
  }
  return pairingSequenceArray;
};

export default processPairingForDisplay;
