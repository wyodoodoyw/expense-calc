import cutStringAfterExclusive from '../cutStringAfterExclusive';

const parseAsLayover = (
  line,
  layoverLength,
  layoverStation,
  layoverStart,
  index
) => {
  // const layoverMinutes = layoverLength.slice(-2);
  // const layoverHours = layoverLength.replace(layoverMinutes, '');

  const newLayover = {
    index: index,
    layoverLength: layoverLength,
    layoverStation: layoverStation,
    layoverStart: layoverStart,
  };
  const hotelInfo = line.match(/[A-Z][a-z]{1,9}.?s?/g);
  // console.log((`hotelInfo: ${hotelInfo}`);
  if (hotelInfo) {
    newLayover.hotelInfo = hotelInfo.join(' ');
  }
  // console.log((`hotel: ${line} ${newLayover.hotelInfo}`);

  if (hotelInfo) {
    let mealsInfo = cutStringAfterExclusive(
      line,
      hotelInfo[hotelInfo.length - 1]
    );
    mealsInfo = mealsInfo.trim();
    newLayover.layoverMeals = mealsInfo;
    // // console.log((`meals: ${newLayover.meals}`);
  }
  return newLayover;
};

export default parseAsLayover;
