import cutStringAfterExclusive from './cutStringAfterExclusive';

const parseAsLayover = (index, line) => {
  const newLayover = {
    index: index,
  };

  if (line.match(/[A-Z][a-z]{1,9}\s?/g)) {
    const hotelInfo = line.match(/[A-Z][a-z]{1,9}\s?/g);

    for (let i = 0; i < hotelInfo.length; i++) {
      hotelInfo[i] = hotelInfo[i].trim();
    }

    if (hotelInfo) {
      newLayover.hotelInfo = hotelInfo.join(' ');
    }

    if (hotelInfo) {
      let mealsInfo = cutStringAfterExclusive(
        line,
        hotelInfo[hotelInfo.length - 1]
      );
      mealsInfo = mealsInfo.replace('HND', '').replace('DT', '');
      mealsInfo = mealsInfo.trim();
      newLayover.layoverMeals = mealsInfo;
    }
  }

  if (line.match('TBA')) {
    const hotelInfo = 'TBA';
    newLayover.hotelInfo = hotelInfo;

    if (hotelInfo) {
      let mealsInfo = cutStringAfterExclusive(
        line,
        // hotelInfo[hotelInfo.length - 1]
        'TBA'
      );
      newLayover.layoverMeals = mealsInfo.trim();
    }
  }

  return newLayover;
};

export default parseAsLayover;
