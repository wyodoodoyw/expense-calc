import cutStringAfterExclusive from '../cutStringAfterExclusive';

const parseAsLayover = (
  index,
  line
  // layoverStation,
  // layoverStart,
  // layoverLength
) => {
  // const layoverMinutes = layoverLength.slice(-2);
  // const layoverHours = layoverLength.replace(layoverMinutes, '');

  const newLayover = {
    index: index,
    // layoverLength: '0000',
    // layoverStation: 'YXY',
    // layoverStart: '0000',
    // layoverEnd: '0000',
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
