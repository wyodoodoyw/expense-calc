import cutStringAfterExclusive from '../cutStringAfterExclusive';

const parseAsLayover = (index, line) => {
  const newLayover = {
    index: index,
  };
  const hotelInfo = line.match(/[A-Z][a-z]{1,9}.?s?/g);
  if (hotelInfo) {
    newLayover.hotelInfo = hotelInfo.join(' ');
  }

  if (hotelInfo) {
    let mealsInfo = cutStringAfterExclusive(
      line,
      hotelInfo[hotelInfo.length - 1]
    );
    mealsInfo = mealsInfo.trim();
    newLayover.layoverMeals = mealsInfo;
  }
  return newLayover;
};

export default parseAsLayover;
